import db from '@/lib/db';
import { aplicarMovimientoStock, resolverAlmacenId, actualizarCostoPromedio } from '@/lib/inventario/stock';
import { resolverFactorUnidad, aUnidadesBase, costoUnitarioBase } from '@/lib/inventario/unidades';
import { AppError } from '@/lib/errors/AppError';
import type { Compra, CompraItem, EstadoCompra, CreateCompraDto, RecibirCompraItemDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryCompraInput } from '../schemas';

type CompraItemRow = {
  id: number;
  compraId: number;
  productoId: number;
  cantidad: number;
  cantidadRecibida: number;
  costoUnitario: unknown;
  subtotal: unknown;
  unidadMedidaId: number | null;
  unidadMedida: { codigo: string } | null;
  factorUnidad: unknown;
  producto: { descripcion: string };
};

type CompraRow = {
  id: number;
  numero: string;
  proveedorId: number;
  usuarioId: number;
  tipoPagoId: number | null;
  almacenId: number | null;
  almacen: { nombre: string } | null;
  subtotal: unknown;
  igv: unknown;
  total: unknown;
  estado: string;
  numeroFactura: string | null;
  observaciones: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  lista: CompraItemRow[];
  proveedor: { descripcion: string };
};

function itemToDto(row: CompraItemRow): CompraItem {
  return {
    id: String(row.id),
    compraId: String(row.compraId),
    productoId: String(row.productoId),
    descripcion: row.producto.descripcion,
    cantidad: row.cantidad,
    cantidadRecibida: row.cantidadRecibida,
    costoUnitario: Number(row.costoUnitario),
    subtotal: Number(row.subtotal),
    unidadMedidaId: row.unidadMedidaId !== null ? String(row.unidadMedidaId) : null,
    unidadCodigo: row.unidadMedida?.codigo ?? null,
    factorUnidad: Number(row.factorUnidad),
  };
}

function toDto(row: CompraRow): Compra {
  return {
    id: String(row.id),
    numero: row.numero,
    proveedorId: String(row.proveedorId),
    proveedorNombre: row.proveedor.descripcion,
    usuarioId: String(row.usuarioId),
    tipoPagoId: row.tipoPagoId !== null ? String(row.tipoPagoId) : null,
    almacenId: row.almacenId !== null ? String(row.almacenId) : null,
    almacenNombre: row.almacen?.nombre ?? null,
    items: row.lista.map(itemToDto),
    subtotal: Number(row.subtotal),
    igv: Number(row.igv),
    total: Number(row.total),
    estado: row.estado as EstadoCompra,
    numeroFactura: row.numeroFactura,
    observaciones: row.observaciones,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

const includeItems = {
  lista: { include: { producto: { select: { descripcion: true } }, unidadMedida: { select: { codigo: true } } } },
  proveedor: { select: { descripcion: true } },
  almacen: { select: { nombre: true } },
};

export const comprasRepository = {
  async findMany(params: QueryCompraInput): Promise<PaginatedResponse<Compra>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.proveedorId) where.proveedorId = parseInt(params.proveedorId);
    if (params.estado) where.estado = params.estado;
    if (params.desde || params.hasta) {
      where.creadoEn = {
        ...(params.desde && { gte: params.desde }),
        ...(params.hasta && { lte: params.hasta }),
      };
    }

    const [rows, total] = await Promise.all([
      db.compra.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: includeItems }),
      db.compra.count({ where }),
    ]);

    return {
      data: (rows as unknown as CompraRow[]).map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<Compra | null> {
    const row = await db.compra.findUnique({ where: { id: parseInt(id) }, include: includeItems });
    return row ? toDto(row as unknown as CompraRow) : null;
  },

  async create(data: CreateCompraDto, numero: string, usuarioId: number): Promise<Compra> {
    const subtotalTotal = data.items.reduce((s, i) => s + i.cantidad * i.costoUnitario, 0);
    const igv = Math.round(subtotalTotal * 0.18 * 100) / 100;
    const total = Math.round((subtotalTotal + igv) * 100) / 100;

    const row = await db.$transaction(async tx => {
      // Resolver unidad/factor de cada ítem (caja → unidades base, etc.)
      const itemsResueltos = [];
      for (const i of data.items) {
        const { unidadMedidaId, factor } = await resolverFactorUnidad(tx, parseInt(i.productoId), i.unidadMedidaId);
        itemsResueltos.push({ ...i, unidadMedidaId, factor });
      }

      return tx.compra.create({
        data: {
          numero,
          proveedorId: parseInt(data.proveedorId),
          usuarioId,
          almacenId: parseInt(data.almacenId),
          subtotal: subtotalTotal,
          igv,
          total,
          ...(data.tipoPagoId ? { tipoPagoId: parseInt(data.tipoPagoId) } : {}),
          numeroFactura: data.numeroFactura ?? null,
          observaciones: data.observaciones ?? null,
          lista: {
            create: itemsResueltos.map(i => ({
              productoId: parseInt(i.productoId),
              cantidad: i.cantidad,
              costoUnitario: i.costoUnitario,
              subtotal: i.cantidad * i.costoUnitario,
              unidadMedidaId: i.unidadMedidaId,
              factorUnidad: i.factor,
            })),
          },
        },
        include: includeItems,
      });
    });
    return toDto(row as unknown as CompraRow);
  },

  /**
   * Recibe mercadería de la compra. Sin `items` recibe todo lo pendiente;
   * con `items` recibe las cantidades indicadas (recepción parcial / backorder).
   */
  async recibir(id: string, items?: RecibirCompraItemDto[]): Promise<Compra> {
    const row = await db.$transaction(async tx => {
      const compra = await tx.compra.findUnique({ where: { id: parseInt(id) }, include: includeItems });
      if (!compra) throw new Error('Compra no encontrada');

      const compraRow = compra as unknown as CompraRow;
      const porItem = new Map<number, number>();
      if (items?.length) {
        for (const i of items) porItem.set(parseInt(i.itemId), i.cantidad);
      } else {
        for (const i of compraRow.lista) porItem.set(i.id, i.cantidad - i.cantidadRecibida);
      }

      // Compras antiguas sin almacén: recibir en el primer almacén activo
      const almacenId = await resolverAlmacenId(tx, compraRow.almacenId);

      let recibioAlgo = false;
      for (const item of compraRow.lista) {
        const aRecibir = porItem.get(item.id) ?? 0;
        if (aRecibir <= 0) continue;
        const pendiente = item.cantidad - item.cantidadRecibida;
        if (aRecibir > pendiente) {
          throw AppError.badRequest(
            `"${item.producto.descripcion}": se intenta recibir ${aRecibir} pero solo quedan ${pendiente} pendientes`,
          );
        }
        const factor = Number(item.factorUnidad) || 1;
        const cantidadBase = aUnidadesBase(aRecibir, factor);
        const costoBase = costoUnitarioBase(Number(item.costoUnitario), factor);
        // Recalcular costo promedio ponderado (en unidades base) antes de ingresar el stock
        await actualizarCostoPromedio(tx, item.productoId, cantidadBase, costoBase);
        await aplicarMovimientoStock(tx, {
          productoId: item.productoId,
          almacenId,
          cantidad: cantidadBase,
          tipo: 'entrada_compra',
          costoUnitario: costoBase,
          referenciaId: compraRow.id,
          referenciaTipo: 'Compra',
          observacion: `Compra ${compraRow.numero}`,
          usuarioId: compraRow.usuarioId,
        });
        await tx.compraItem.update({
          where: { id: item.id },
          data: { cantidadRecibida: item.cantidadRecibida + aRecibir },
        });
        item.cantidadRecibida += aRecibir;
        recibioAlgo = true;
      }

      if (!recibioAlgo) throw AppError.badRequest('No hay cantidades pendientes por recibir');

      const completa = compraRow.lista.every(i => i.cantidadRecibida >= i.cantidad);
      return tx.compra.update({
        where: { id: parseInt(id) },
        data: { estado: completa ? 'recibida' : 'parcial' },
        include: includeItems,
      });
    });
    return toDto(row as unknown as CompraRow);
  },

  async anular(id: string): Promise<Compra> {
    const row = await db.compra.update({
      where: { id: parseInt(id) },
      data: { estado: 'anulada' },
      include: includeItems,
    });
    return toDto(row as unknown as CompraRow);
  },
};

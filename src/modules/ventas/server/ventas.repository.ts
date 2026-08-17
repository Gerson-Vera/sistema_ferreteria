import db from '@/lib/db';
import { aplicarMovimientoStock, costoPromedioDe } from '@/lib/inventario/stock';
import { resolverFactorUnidad, aUnidadesBase } from '@/lib/inventario/unidades';
import type { Venta, VentaItem, EstadoVenta, CreateVentaDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryVentaInput } from '../schemas';

type VentaItemRow = {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: unknown;
  subtotal: unknown;
  unidadMedidaId: number | null;
  unidadMedida: { codigo: string } | null;
  factorUnidad: unknown;
};

type VentaRow = {
  id: number;
  numero: string;
  clienteId: number;
  cliente: { descripcion: string };
  usuarioId: number;
  usuario: { nombre: string };
  tipoPagoId: number | null;
  almacenId: number | null;
  almacen: { nombre: string } | null;
  subtotal: unknown;
  igv: unknown;
  total: unknown;
  estado: string;
  observaciones: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  lista: VentaItemRow[];
};

function itemToDto(row: VentaItemRow): VentaItem {
  return {
    id: String(row.id),
    ventaId: String(row.ventaId),
    productoId: String(row.productoId),
    cantidad: row.cantidad,
    precioUnitario: Number(row.precioUnitario),
    subtotal: Number(row.subtotal),
    unidadMedidaId: row.unidadMedidaId !== null ? String(row.unidadMedidaId) : null,
    unidadCodigo: row.unidadMedida?.codigo ?? null,
    factorUnidad: Number(row.factorUnidad),
  };
}

function toDto(row: VentaRow): Venta {
  return {
    id: String(row.id),
    numero: row.numero,
    clienteId: String(row.clienteId),
    clienteNombre: row.cliente.descripcion,
    usuarioId: String(row.usuarioId),
    usuarioNombre: row.usuario.nombre,
    tipoPagoId: row.tipoPagoId !== null ? String(row.tipoPagoId) : null,
    almacenId: row.almacenId !== null ? String(row.almacenId) : null,
    almacenNombre: row.almacen?.nombre ?? null,
    items: row.lista.map(itemToDto),
    subtotal: Number(row.subtotal),
    igv: Number(row.igv),
    total: Number(row.total),
    estado: row.estado as EstadoVenta,
    observaciones: row.observaciones,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

const includeItems = {
  lista: { include: { unidadMedida: { select: { codigo: true } } } },
  cliente: { select: { descripcion: true } },
  usuario: { select: { nombre: true } },
  almacen: { select: { nombre: true } },
};

export const ventasRepository = {
  async findMany(params: QueryVentaInput): Promise<PaginatedResponse<Venta>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.clienteId) where.clienteId = parseInt(params.clienteId);
    if (params.estado) where.estado = params.estado;
    if (params.desde || params.hasta) {
      where.creadoEn = {
        ...(params.desde && { gte: params.desde }),
        ...(params.hasta && { lte: params.hasta }),
      };
    }

    const [rows, total] = await Promise.all([
      db.venta.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: includeItems }),
      db.venta.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<Venta | null> {
    const row = await db.venta.findUnique({ where: { id: parseInt(id) }, include: includeItems });
    return row ? toDto(row) : null;
  },

  async create(data: CreateVentaDto, numero: string, usuarioId: number): Promise<Venta> {
    const subtotalTotal = data.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
    const igv = Math.round(subtotalTotal * 0.18 * 100) / 100;
    const total = Math.round((subtotalTotal + igv) * 100) / 100;

    const almacenId = parseInt(data.almacenId);

    const row = await db.$transaction(async tx => {
      // Resolver unidad/factor de cada ítem (caja → unidades base, etc.)
      const itemsResueltos = [];
      for (const i of data.items) {
        const { unidadMedidaId, factor } = await resolverFactorUnidad(tx, parseInt(i.productoId), i.unidadMedidaId);
        itemsResueltos.push({ ...i, unidadMedidaId, factor });
      }

      const venta = await tx.venta.create({
        data: {
          numero,
          clienteId: parseInt(data.clienteId),
          usuarioId,
          almacenId,
          subtotal: subtotalTotal,
          igv,
          total,
          ...(data.tipoPagoId ? { tipoPagoId: parseInt(data.tipoPagoId) } : {}),
          observaciones: data.observaciones ?? null,
          lista: {
            create: itemsResueltos.map(i => ({
              productoId: parseInt(i.productoId),
              cantidad: i.cantidad,
              precioUnitario: i.precioUnitario,
              subtotal: i.cantidad * i.precioUnitario,
              unidadMedidaId: i.unidadMedidaId,
              factorUnidad: i.factor,
            })),
          },
        },
        include: includeItems,
      });

      for (const item of venta.lista) {
        await aplicarMovimientoStock(tx, {
          productoId: item.productoId,
          almacenId,
          cantidad: aUnidadesBase(item.cantidad, Number(item.factorUnidad)),
          tipo: 'salida_venta',
          costoUnitario: await costoPromedioDe(tx, item.productoId),
          referenciaId: venta.id,
          referenciaTipo: 'Venta',
          observacion: `Venta ${venta.numero}`,
          usuarioId,
        });
      }

      return venta;
    });
    return toDto(row);
  },

  async anular(id: string): Promise<Venta> {
    const row = await db.venta.update({
      where: { id: parseInt(id) },
      data: { estado: 'anulada' },
      include: includeItems,
    });
    return toDto(row);
  },
};

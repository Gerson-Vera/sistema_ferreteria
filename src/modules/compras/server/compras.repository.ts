import db from '@/lib/db';
import type { Compra, CompraItem, EstadoCompra, CreateCompraDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryCompraInput } from '../schemas';

type CompraItemRow = {
  id: number;
  compraId: number;
  productoId: number;
  cantidad: number;
  costoUnitario: unknown;
  subtotal: unknown;
  producto: { descripcion: string };
};

type CompraRow = {
  id: number;
  numero: string;
  proveedorId: number;
  usuarioId: number;
  tipoPagoId: number | null;
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
    costoUnitario: Number(row.costoUnitario),
    subtotal: Number(row.subtotal),
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
  lista: { include: { producto: { select: { descripcion: true } } } },
  proveedor: { select: { descripcion: true } },
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

    const row = await db.compra.create({
      data: {
        numero,
        proveedorId: parseInt(data.proveedorId),
        usuarioId,
        subtotal: subtotalTotal,
        igv,
        total,
        ...(data.tipoPagoId ? { tipoPagoId: parseInt(data.tipoPagoId) } : {}),
        numeroFactura: data.numeroFactura ?? null,
        observaciones: data.observaciones ?? null,
        lista: {
          create: data.items.map(i => ({
            productoId: parseInt(i.productoId),
            cantidad: i.cantidad,
            costoUnitario: i.costoUnitario,
            subtotal: i.cantidad * i.costoUnitario,
          })),
        },
      },
      include: includeItems,
    });
    return toDto(row as unknown as CompraRow);
  },

  async recibir(id: string, itemIds?: number[]): Promise<Compra> {
    const row = await db.$transaction(async tx => {
      const compra = await tx.compra.findUnique({ where: { id: parseInt(id) }, include: includeItems });
      if (!compra) throw new Error('Compra no encontrada');

      const compraRow = compra as unknown as CompraRow;
      const itemsToProcess = itemIds?.length
        ? compraRow.lista.filter(i => itemIds.includes(i.id))
        : compraRow.lista;

      for (const item of itemsToProcess) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          select: { stock: true },
        });
        const stockAnterior = producto?.stock ?? 0;
        const stockNuevo = stockAnterior + item.cantidad;
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: stockNuevo },
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            tipo: 'entrada_compra',
            cantidad: item.cantidad,
            stockAnterior,
            stockNuevo,
            referenciaId: compraRow.id,
            referenciaTipo: 'Compra',
            observacion: `Compra ${compraRow.numero}`,
            usuarioId: compraRow.usuarioId,
          },
        });
      }

      return tx.compra.update({
        where: { id: parseInt(id) },
        data: { estado: 'recibida' },
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

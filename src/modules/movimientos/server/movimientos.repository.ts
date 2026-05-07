import db from '@/lib/db';
import type { MovimientoInventario, TipoMovimiento } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryMovimientoInput } from '../schemas';

function toDto(row: {
  id: number;
  productoId: number;
  tipo: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  referenciaId: number | null;
  referenciaTipo: string | null;
  observacion: string | null;
  usuarioId: number;
  creadoEn: Date;
}): MovimientoInventario {
  return {
    id: String(row.id),
    productoId: String(row.productoId),
    tipo: row.tipo as TipoMovimiento,
    cantidad: row.cantidad,
    stockAnterior: row.stockAnterior,
    stockNuevo: row.stockNuevo,
    referenciaId: row.referenciaId !== null ? String(row.referenciaId) : null,
    referenciaTipo: row.referenciaTipo,
    observacion: row.observacion,
    usuarioId: String(row.usuarioId),
    creadoEn: row.creadoEn,
  };
}

export const movimientosRepository = {
  async findMany(params: QueryMovimientoInput): Promise<PaginatedResponse<MovimientoInventario>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { estado: true };
    if (params.productoId) where.productoId = parseInt(params.productoId);
    if (params.tipo) where.tipo = params.tipo;
    if (params.desde || params.hasta) {
      where.creadoEn = {
        ...(params.desde && { gte: params.desde }),
        ...(params.hasta && { lte: params.hasta }),
      };
    }

    const [rows, total] = await Promise.all([
      db.movimientoInventario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { creadoEn: 'desc' },
      }),
      db.movimientoInventario.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};

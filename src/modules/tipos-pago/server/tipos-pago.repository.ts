import db from '@/lib/db';
import type { TipoPago, CreateTipoPagoDto, UpdateTipoPagoDto } from '../types';

function toDto(row: {
  id: number;
  nombre: string;
  estado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}): TipoPago {
  return {
    id: String(row.id),
    nombre: row.nombre,
    activo: row.estado,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

export const tiposPagoRepository = {
  async findMany(activo?: boolean): Promise<TipoPago[]> {
    const rows = await db.tipoPago.findMany({
      where: activo !== undefined ? { estado: activo } : undefined,
      orderBy: { nombre: 'asc' },
    });
    return rows.map(toDto);
  },

  async findById(id: string): Promise<TipoPago | null> {
    const row = await db.tipoPago.findUnique({ where: { id: parseInt(id) } });
    return row ? toDto(row) : null;
  },

  async findByNombre(nombre: string): Promise<TipoPago | null> {
    const row = await db.tipoPago.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' }, estado: true },
    });
    return row ? toDto(row) : null;
  },

  async create(data: CreateTipoPagoDto): Promise<TipoPago> {
    const row = await db.tipoPago.create({
      data: { nombre: data.nombre },
    });
    return toDto(row);
  },

  async update(id: string, data: UpdateTipoPagoDto): Promise<TipoPago> {
    const row = await db.tipoPago.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
      },
    });
    return toDto(row);
  },

  async delete(id: string): Promise<void> {
    await db.tipoPago.update({
      where: { id: parseInt(id) },
      data: { estado: false },
    });
  },
};

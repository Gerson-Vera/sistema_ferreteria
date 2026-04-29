import db from '@/lib/db';
import type { Caja, CreateCajaDto, UpdateCajaDto } from '../types';

function toDto(row: {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}): Caja {
  return {
    id: String(row.id),
    nombre: row.nombre,
    descripcion: row.descripcion,
    activo: row.estado,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

export const cajasRepository = {
  async findMany(activo?: boolean): Promise<Caja[]> {
    const rows = await db.caja.findMany({
      where: activo !== undefined ? { estado: activo } : undefined,
      orderBy: { nombre: 'asc' },
    });
    return rows.map(toDto);
  },

  async findById(id: string): Promise<Caja | null> {
    const row = await db.caja.findUnique({ where: { id: parseInt(id) } });
    return row ? toDto(row) : null;
  },

  async findByNombre(nombre: string): Promise<Caja | null> {
    const row = await db.caja.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' }, estado: true },
    });
    return row ? toDto(row) : null;
  },

  async create(data: CreateCajaDto): Promise<Caja> {
    const row = await db.caja.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
      },
    });
    return toDto(row);
  },

  async update(id: string, data: UpdateCajaDto): Promise<Caja> {
    const row = await db.caja.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion || null }),
      },
    });
    return toDto(row);
  },

  async delete(id: string): Promise<void> {
    await db.caja.update({
      where: { id: parseInt(id) },
      data: { estado: false },
    });
  },
};

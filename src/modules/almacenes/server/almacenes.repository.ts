import db from '@/lib/db';
import type { Almacen, CreateAlmacenDto, UpdateAlmacenDto } from '../types';

function toDto(row: {
  id: number;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  estado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}): Almacen {
  return {
    id: String(row.id),
    nombre: row.nombre,
    descripcion: row.descripcion,
    direccion: row.direccion,
    activo: row.estado,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

export const almacenesRepository = {
  async findMany(activo?: boolean): Promise<Almacen[]> {
    const rows = await db.almacen.findMany({
      where: activo !== undefined ? { estado: activo } : undefined,
      orderBy: { nombre: 'asc' },
    });
    return rows.map(toDto);
  },

  async findById(id: string): Promise<Almacen | null> {
    const row = await db.almacen.findUnique({ where: { id: parseInt(id) } });
    return row ? toDto(row) : null;
  },

  async findByNombre(nombre: string): Promise<Almacen | null> {
    const row = await db.almacen.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' }, estado: true },
    });
    return row ? toDto(row) : null;
  },

  async create(data: CreateAlmacenDto): Promise<Almacen> {
    const row = await db.almacen.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        direccion: data.direccion ?? null,
      },
    });
    return toDto(row);
  },

  async update(id: string, data: UpdateAlmacenDto): Promise<Almacen> {
    const row = await db.almacen.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion || null }),
        ...(data.direccion !== undefined && { direccion: data.direccion || null }),
      },
    });
    return toDto(row);
  },

  async delete(id: string): Promise<void> {
    await db.almacen.update({
      where: { id: parseInt(id) },
      data: { estado: false },
    });
  },
};

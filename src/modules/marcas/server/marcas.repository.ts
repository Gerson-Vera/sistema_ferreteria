import db from '@/lib/db';
import type { Marca, CreateMarcaDto, UpdateMarcaDto } from '../types';

function toDto(row: {
  id: number;
  nombre: string;
  estado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}): Marca {
  return {
    id: String(row.id),
    nombre: row.nombre,
    activo: row.estado,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

export const marcasRepository = {
  async findMany(activo?: boolean): Promise<Marca[]> {
    const rows = await db.marca.findMany({
      where: activo !== undefined ? { estado: activo } : undefined,
      orderBy: { nombre: 'asc' },
    });
    return rows.map(toDto);
  },

  async findById(id: string): Promise<Marca | null> {
    const row = await db.marca.findUnique({ where: { id: parseInt(id) } });
    return row ? toDto(row) : null;
  },

  async findByNombre(nombre: string): Promise<Marca | null> {
    const row = await db.marca.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' }, estado: true },
    });
    return row ? toDto(row) : null;
  },

  async create(data: CreateMarcaDto): Promise<Marca> {
    const row = await db.marca.create({
      data: { nombre: data.nombre },
    });
    return toDto(row);
  },

  async update(id: string, data: UpdateMarcaDto): Promise<Marca> {
    const row = await db.marca.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
      },
    });
    return toDto(row);
  },

  async delete(id: string): Promise<void> {
    await db.marca.update({
      where: { id: parseInt(id) },
      data: { estado: false },
    });
  },
};

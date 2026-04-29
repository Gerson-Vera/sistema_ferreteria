import db from '@/lib/db';
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../types';

type CategoriaRow = {
  id: number;
  codigo: string;
  descripcion: string | null;
  estado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

function toDto(row: CategoriaRow): Categoria {
  return {
    id: String(row.id),
    nombre: row.codigo,
    descripcion: row.descripcion,
    activo: row.estado,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

export const categoriasRepository = {
  async findMany(): Promise<Categoria[]> {
    const rows = await db.categoria.findMany({ orderBy: { codigo: 'asc' } });
    return rows.map(toDto);
  },

  async findById(id: string): Promise<Categoria | null> {
    const row = await db.categoria.findUnique({ where: { id: parseInt(id) } });
    return row ? toDto(row) : null;
  },

  async findByNombre(nombre: string): Promise<Categoria | null> {
    const row = await db.categoria.findFirst({
      where: { codigo: { equals: nombre, mode: 'insensitive' }, estado: true },
    });
    return row ? toDto(row) : null;
  },

  async create(data: CreateCategoriaDto): Promise<Categoria> {
    const row = await db.categoria.create({
      data: {
        codigo: data.nombre,
        descripcion: data.descripcion ?? null,
      },
    });
    return toDto(row);
  },

  async update(id: string, data: UpdateCategoriaDto): Promise<Categoria> {
    const row = await db.categoria.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre !== undefined && { codigo: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion || null }),
      },
    });
    return toDto(row);
  },

  async delete(id: string): Promise<void> {
    await db.categoria.update({
      where: { id: parseInt(id) },
      data: { estado: false },
    });
  },
};

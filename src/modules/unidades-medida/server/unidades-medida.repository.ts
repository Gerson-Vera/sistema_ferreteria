import db from '@/lib/db';
import type { UnidadMedida, CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from '../types';

function toDto(row: {
  id: number;
  codigo: string;
  descripcion: string;
  estado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}): UnidadMedida {
  return {
    id: String(row.id),
    codigo: row.codigo,
    nombre: row.descripcion,
    activo: row.estado,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

export const unidadesMedidaRepository = {
  async findMany(activo?: boolean): Promise<UnidadMedida[]> {
    const rows = await db.unidadMedida.findMany({
      where: activo !== undefined ? { estado: activo } : undefined,
      orderBy: { codigo: 'asc' },
    });
    return rows.map(toDto);
  },

  async findById(id: string): Promise<UnidadMedida | null> {
    const row = await db.unidadMedida.findUnique({ where: { id: parseInt(id) } });
    return row ? toDto(row) : null;
  },

  async findByCodigo(codigo: string): Promise<UnidadMedida | null> {
    const row = await db.unidadMedida.findFirst({
      where: { codigo: { equals: codigo, mode: 'insensitive' }, estado: true },
    });
    return row ? toDto(row) : null;
  },

  async create(data: CreateUnidadMedidaDto): Promise<UnidadMedida> {
    const row = await db.unidadMedida.create({
      data: {
        codigo: data.codigo,
        descripcion: data.nombre,
      },
    });
    return toDto(row);
  },

  async update(id: string, data: UpdateUnidadMedidaDto): Promise<UnidadMedida> {
    const row = await db.unidadMedida.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.codigo !== undefined && { codigo: data.codigo }),
        ...(data.nombre !== undefined && { descripcion: data.nombre }),
      },
    });
    return toDto(row);
  },

  async delete(id: string): Promise<void> {
    await db.unidadMedida.update({
      where: { id: parseInt(id) },
      data: { estado: false },
    });
  },
};

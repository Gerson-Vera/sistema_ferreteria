import db from '@/lib/db';
import type { Proveedor, CreateProveedorDto, UpdateProveedorDto } from '../types';
import type { PaginatedResponse, QueryParams } from '@/shared/types';

function toDto(row: {
  id: number;
  codigo: string;
  descripcion: string;
  ruc: string | null;
  contacto: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}): Proveedor {
  return {
    id: String(row.id),
    codigo: row.codigo,
    nombre: row.descripcion,
    ruc: row.ruc,
    contacto: row.contacto,
    email: row.email,
    telefono: row.telefono,
    direccion: row.direccion,
    activo: row.estado,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

export const proveedoresRepository = {
  async findMany(params: QueryParams): Promise<PaginatedResponse<Proveedor>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = params.search
      ? {
          OR: [
            { descripcion: { contains: params.search, mode: 'insensitive' as const } },
            { codigo: { contains: params.search, mode: 'insensitive' as const } },
            { ruc: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [rows, total] = await Promise.all([
      db.proveedor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { descripcion: 'asc' },
      }),
      db.proveedor.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<Proveedor | null> {
    const row = await db.proveedor.findUnique({ where: { id: parseInt(id) } });
    return row ? toDto(row) : null;
  },

  async findByRuc(ruc: string): Promise<Proveedor | null> {
    const row = await db.proveedor.findUnique({ where: { ruc } });
    return row ? toDto(row) : null;
  },

  async create(data: CreateProveedorDto): Promise<Proveedor> {
    const count = await db.proveedor.count();
    const codigo = `PROV-${String(count + 1).padStart(4, '0')}`;

    const row = await db.proveedor.create({
      data: {
        codigo,
        descripcion: data.nombre,
        ruc: data.ruc ?? null,
        contacto: data.contacto ?? null,
        email: data.email ?? null,
        telefono: data.telefono ?? null,
        direccion: data.direccion ?? null,
      },
    });
    return toDto(row);
  },

  async update(id: string, data: UpdateProveedorDto): Promise<Proveedor> {
    const row = await db.proveedor.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre !== undefined && { descripcion: data.nombre }),
        ...(data.ruc !== undefined && { ruc: data.ruc || null }),
        ...(data.contacto !== undefined && { contacto: data.contacto || null }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.telefono !== undefined && { telefono: data.telefono || null }),
        ...(data.direccion !== undefined && { direccion: data.direccion || null }),
      },
    });
    return toDto(row);
  },

  async delete(id: string): Promise<void> {
    await db.proveedor.update({
      where: { id: parseInt(id) },
      data: { estado: false },
    });
  },
};

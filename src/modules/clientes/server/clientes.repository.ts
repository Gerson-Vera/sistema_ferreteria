import db from '@/lib/db';
import type { Cliente, CreateClienteDto, UpdateClienteDto, TipoCliente, TipoDocumento } from '../types';
import type { PaginatedResponse, QueryParams } from '@/shared/types';

function toDto(row: {
  id: number;
  codigo: string;
  descripcion: string;
  tipo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}): Cliente {
  return {
    id: String(row.id),
    codigo: row.codigo,
    nombre: row.descripcion,
    tipo: row.tipo as TipoCliente,
    tipoDocumento: row.tipoDocumento as TipoDocumento,
    numeroDocumento: row.numeroDocumento,
    email: row.email,
    telefono: row.telefono,
    direccion: row.direccion,
    activo: row.estado,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

export const clientesRepository = {
  async findMany(params: QueryParams): Promise<PaginatedResponse<Cliente>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = params.search
      ? {
          OR: [
            { descripcion: { contains: params.search, mode: 'insensitive' as const } },
            { codigo: { contains: params.search, mode: 'insensitive' as const } },
            { numeroDocumento: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [rows, total] = await Promise.all([
      db.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { descripcion: 'asc' },
      }),
      db.cliente.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<Cliente | null> {
    const row = await db.cliente.findUnique({ where: { id: parseInt(id) } });
    return row ? toDto(row) : null;
  },

  async findByDocumento(numeroDocumento: string): Promise<Cliente | null> {
    const row = await db.cliente.findUnique({ where: { numeroDocumento } });
    return row ? toDto(row) : null;
  },

  async create(data: CreateClienteDto): Promise<Cliente> {
    const count = await db.cliente.count();
    const codigo = `CLI-${String(count + 1).padStart(4, '0')}`;

    const row = await db.cliente.create({
      data: {
        codigo,
        descripcion: data.nombre,
        tipo: data.tipo,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        email: data.email ?? null,
        telefono: data.telefono ?? null,
        direccion: data.direccion ?? null,
      },
    });
    return toDto(row);
  },

  async update(id: string, data: UpdateClienteDto): Promise<Cliente> {
    const row = await db.cliente.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre !== undefined && { descripcion: data.nombre }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.tipoDocumento !== undefined && { tipoDocumento: data.tipoDocumento }),
        ...(data.numeroDocumento !== undefined && { numeroDocumento: data.numeroDocumento }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.telefono !== undefined && { telefono: data.telefono || null }),
        ...(data.direccion !== undefined && { direccion: data.direccion || null }),
      },
    });
    return toDto(row);
  },

  async delete(id: string): Promise<void> {
    await db.cliente.update({
      where: { id: parseInt(id) },
      data: { estado: false },
    });
  },
};

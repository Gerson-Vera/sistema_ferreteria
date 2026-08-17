import db from '@/lib/db';
import type { Despacho, EstadoDespacho, CreateDespachoDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryDespachoInput } from '../schemas';

type DespachoRow = {
  id: number;
  numero: string;
  ventaId: number;
  usuarioId: number;
  direccionEntrega: string;
  contacto: string | null;
  telefono: string | null;
  transportista: string | null;
  observaciones: string | null;
  estado: string;
  fechaDespacho: Date | null;
  fechaEntrega: Date | null;
  creadoEn: Date;
  actualizadoEn: Date;
  venta: { numero: string; cliente: { descripcion: string } };
  usuario: { nombre: string };
};

function toDto(row: DespachoRow): Despacho {
  return {
    id: String(row.id),
    numero: row.numero,
    ventaId: String(row.ventaId),
    ventaNumero: row.venta.numero,
    clienteNombre: row.venta.cliente.descripcion,
    usuarioId: String(row.usuarioId),
    usuarioNombre: row.usuario.nombre,
    direccionEntrega: row.direccionEntrega,
    contacto: row.contacto,
    telefono: row.telefono,
    transportista: row.transportista,
    observaciones: row.observaciones,
    estado: row.estado as EstadoDespacho,
    fechaDespacho: row.fechaDespacho,
    fechaEntrega: row.fechaEntrega,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

const include = {
  venta: { select: { numero: true, cliente: { select: { descripcion: true } } } },
  usuario: { select: { nombre: true } },
};

export const despachosRepository = {
  async findMany(params: QueryDespachoInput): Promise<PaginatedResponse<Despacho>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.estado) where.estado = params.estado;

    const [rows, total] = await Promise.all([
      db.despacho.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include }),
      db.despacho.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<Despacho | null> {
    const row = await db.despacho.findUnique({ where: { id: parseInt(id) }, include });
    return row ? toDto(row) : null;
  },

  async findActivoPorVenta(ventaId: number): Promise<Despacho | null> {
    const row = await db.despacho.findFirst({
      where: { ventaId, estado: { not: 'anulado' } },
      include,
    });
    return row ? toDto(row) : null;
  },

  async create(data: CreateDespachoDto, numero: string, usuarioId: number): Promise<Despacho> {
    const row = await db.despacho.create({
      data: {
        numero,
        ventaId: parseInt(data.ventaId),
        usuarioId,
        direccionEntrega: data.direccionEntrega,
        contacto: data.contacto ?? null,
        telefono: data.telefono ?? null,
        transportista: data.transportista ?? null,
        observaciones: data.observaciones ?? null,
      },
      include,
    });
    return toDto(row);
  },

  async cambiarEstado(id: string, estado: EstadoDespacho): Promise<Despacho> {
    const fechas: Record<string, Date> = {};
    if (estado === 'despachado') fechas.fechaDespacho = new Date();
    if (estado === 'entregado') fechas.fechaEntrega = new Date();

    const row = await db.despacho.update({
      where: { id: parseInt(id) },
      data: { estado, ...fechas },
      include,
    });
    return toDto(row);
  },
};

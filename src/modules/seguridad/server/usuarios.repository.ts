import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import type { UsuarioAdmin, CreateUsuarioDto, UpdateUsuarioDto } from '../types';
import type { QueryUsuariosInput } from '../schemas';
import type { PaginatedResponse } from '@/shared/types';

function toDto(row: {
  id: number;
  username: string;
  email: string;
  nombre: string;
  estado: boolean;
  creadoEn: Date;
  roles: { rol: { id: number; codigo: string; descripcion: string; estado: boolean } }[];
}): UsuarioAdmin {
  return {
    id: String(row.id),
    username: row.username,
    email: row.email,
    nombre: row.nombre,
    estado: row.estado,
    creadoEn: row.creadoEn,
    roles: row.roles.map(r => ({
      id: String(r.rol.id),
      codigo: r.rol.codigo,
      descripcion: r.rol.descripcion,
      estado: r.rol.estado,
    })),
  };
}

const include = {
  roles: { include: { rol: true }, where: { estado: true } },
};

export const usuariosRepository = {
  async findMany(params: QueryUsuariosInput): Promise<PaginatedResponse<UsuarioAdmin>> {
    const { page, limit, search, rolId, estado } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (estado === 'activo')   where.estado = true;
    if (estado === 'inactivo') where.estado = false;
    if (search) {
      where.OR = [
        { nombre:   { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email:    { contains: search, mode: 'insensitive' } },
      ];
    }
    if (rolId) {
      where.roles = { some: { rolId: parseInt(rolId), estado: true } };
    }

    const [rows, total] = await Promise.all([
      db.usuario.findMany({ where, skip, take: limit, orderBy: { nombre: 'asc' }, include }),
      db.usuario.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: number): Promise<UsuarioAdmin | null> {
    const row = await db.usuario.findUnique({ where: { id }, include });
    return row ? toDto(row) : null;
  },

  async create(data: CreateUsuarioDto): Promise<UsuarioAdmin> {
    const hash = await bcrypt.hash(data.password, 12);
    const row = await db.usuario.create({
      data: {
        username: data.username,
        email: data.email,
        nombre: data.nombre,
        password: hash,
        ...(data.roles?.length ? {
          roles: {
            create: data.roles.map(rolId => ({ rolId: parseInt(rolId) })),
          },
        } : {}),
      },
      include,
    });
    return toDto(row);
  },

  async update(id: number, data: UpdateUsuarioDto): Promise<UsuarioAdmin> {
    const updateData: Record<string, unknown> = {};
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.email)  updateData.email  = data.email;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 12);

    await db.$transaction(async tx => {
      await tx.usuario.update({ where: { id }, data: updateData });
      if (data.roles !== undefined) {
        await tx.rolUsuario.deleteMany({ where: { usuarioId: id } });
        if (data.roles.length > 0) {
          await tx.rolUsuario.createMany({
            data: data.roles.map(rolId => ({ usuarioId: id, rolId: parseInt(rolId) })),
          });
        }
      }
    });

    const row = await db.usuario.findUnique({ where: { id }, include });
    return toDto(row!);
  },

  async toggleEstado(id: number): Promise<UsuarioAdmin> {
    const current = await db.usuario.findUnique({ where: { id }, select: { estado: true } });
    const row = await db.usuario.update({
      where: { id },
      data: { estado: !current?.estado },
      include,
    });
    return toDto(row);
  },
};

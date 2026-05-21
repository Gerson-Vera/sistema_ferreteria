import db from '@/lib/db';
import type { RolAdmin, CreateRolDto, UpdateRolDto } from '../types';

function toDto(row: {
  id: number;
  codigo: string;
  descripcion: string;
  estado: boolean;
  creadoEn: Date;
  lista_usuarios: { id: number }[];
  lista_menus: { menu: { id: number; codigo: string; descripcion: string } }[];
}): RolAdmin {
  return {
    id: String(row.id),
    codigo: row.codigo,
    descripcion: row.descripcion,
    estado: row.estado,
    totalUsuarios: row.lista_usuarios.length,
    menus: row.lista_menus.map(m => ({
      id: String(m.menu.id),
      codigo: m.menu.codigo,
      descripcion: m.menu.descripcion,
    })),
    creadoEn: row.creadoEn,
  };
}

const include = {
  lista_usuarios: { select: { id: true }, where: { estado: true } },
  lista_menus:    { include: { menu: true }, where: { estado: true } },
};

export const rolesRepository = {
  async findAll(): Promise<RolAdmin[]> {
    const rows = await db.rol.findMany({ orderBy: { descripcion: 'asc' }, include });
    return rows.map(toDto);
  },

  async findById(id: number): Promise<RolAdmin | null> {
    const row = await db.rol.findUnique({ where: { id }, include });
    return row ? toDto(row) : null;
  },

  async create(data: CreateRolDto): Promise<RolAdmin> {
    const row = await db.rol.create({
      data: { codigo: data.codigo, descripcion: data.descripcion },
      include,
    });
    return toDto(row);
  },

  async update(id: number, data: UpdateRolDto): Promise<RolAdmin> {
    await db.$transaction(async tx => {
      if (data.descripcion) {
        await tx.rol.update({ where: { id }, data: { descripcion: data.descripcion } });
      }
      if (data.menus !== undefined) {
        // Replace all menu assignments
        await tx.menuRol.deleteMany({ where: { rolId: id } });
        if (data.menus.length > 0) {
          await tx.menuRol.createMany({
            data: data.menus.map(menuId => ({ rolId: id, menuId: parseInt(menuId) })),
          });
        }
      }
    });
    const row = await db.rol.findUnique({ where: { id }, include });
    return toDto(row!);
  },

  async toggleEstado(id: number): Promise<RolAdmin> {
    const current = await db.rol.findUnique({ where: { id }, select: { estado: true } });
    const row = await db.rol.update({
      where: { id },
      data: { estado: !current?.estado },
      include,
    });
    return toDto(row);
  },
};

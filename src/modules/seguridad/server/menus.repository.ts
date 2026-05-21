import db from '@/lib/db';
import type { MenuAdmin, CreateMenuDto, UpdateMenuDto } from '../types';

type MenuRow = {
  id: number;
  codigo: string;
  descripcion: string;
  url: string | null;
  icono: string | null;
  orden: number;
  menuPadreId: number | null;
  estado: boolean;
  creadoEn: Date;
};

function flatToTree(rows: MenuRow[]): MenuAdmin[] {
  const map = new Map<number, MenuAdmin>();
  rows.forEach(r => map.set(r.id, {
    id: String(r.id),
    codigo: r.codigo,
    descripcion: r.descripcion,
    url: r.url,
    icono: r.icono,
    orden: r.orden,
    menuPadreId: r.menuPadreId !== null ? String(r.menuPadreId) : null,
    estado: r.estado,
    hijos: [],
    creadoEn: r.creadoEn,
  }));

  const roots: MenuAdmin[] = [];
  rows.forEach(r => {
    const node = map.get(r.id)!;
    if (r.menuPadreId !== null) {
      map.get(r.menuPadreId)?.hijos.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function toDto(row: MenuRow): MenuAdmin {
  return {
    id: String(row.id),
    codigo: row.codigo,
    descripcion: row.descripcion,
    url: row.url,
    icono: row.icono,
    orden: row.orden,
    menuPadreId: row.menuPadreId !== null ? String(row.menuPadreId) : null,
    estado: row.estado,
    hijos: [],
    creadoEn: row.creadoEn,
  };
}

export const menusRepository = {
  async findAllTree(): Promise<MenuAdmin[]> {
    const rows = await db.menu.findMany({ orderBy: [{ menuPadreId: 'asc' }, { orden: 'asc' }] });
    return flatToTree(rows as MenuRow[]);
  },

  async findAllFlat(): Promise<MenuAdmin[]> {
    const rows = await db.menu.findMany({ orderBy: [{ menuPadreId: 'asc' }, { orden: 'asc' }] });
    return (rows as MenuRow[]).map(toDto);
  },

  async findById(id: number): Promise<MenuAdmin | null> {
    const row = await db.menu.findUnique({ where: { id } });
    return row ? toDto(row as MenuRow) : null;
  },

  async create(data: CreateMenuDto): Promise<MenuAdmin> {
    const row = await db.menu.create({
      data: {
        codigo: data.codigo,
        descripcion: data.descripcion,
        url: data.url ?? null,
        icono: data.icono ?? null,
        orden: data.orden ?? 0,
        menuPadreId: data.menuPadreId ? parseInt(data.menuPadreId) : null,
      },
    });
    return toDto(row as MenuRow);
  },

  async update(id: number, data: UpdateMenuDto): Promise<MenuAdmin> {
    const row = await db.menu.update({
      where: { id },
      data: {
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.url          !== undefined && { url: data.url }),
        ...(data.icono        !== undefined && { icono: data.icono }),
        ...(data.orden        !== undefined && { orden: data.orden }),
        ...(data.menuPadreId  !== undefined && {
          menuPadreId: data.menuPadreId ? parseInt(data.menuPadreId) : null,
        }),
      },
    });
    return toDto(row as MenuRow);
  },

  async toggleEstado(id: number): Promise<MenuAdmin> {
    const current = await db.menu.findUnique({ where: { id }, select: { estado: true } });
    const row = await db.menu.update({
      where: { id },
      data: { estado: !current?.estado },
    });
    return toDto(row as MenuRow);
  },
};

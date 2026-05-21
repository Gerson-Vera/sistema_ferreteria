import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { ok, serverError } from '@/lib/api/response';

type MenuRow = {
  id: number; codigo: string; descripcion: string; url: string | null;
  icono: string | null; orden: number; menuPadreId: number | null; estado: boolean;
};

type MenuNode = MenuRow & { hijos: MenuNode[] };

function flatToTree(rows: MenuRow[]): MenuNode[] {
  const map = new Map<number, MenuNode>();
  rows.forEach(r => map.set(r.id, { ...r, hijos: [] }));
  const roots: MenuNode[] = [];
  rows.forEach(r => {
    const node = map.get(r.id)!;
    if (r.menuPadreId !== null && map.has(r.menuPadreId)) {
      map.get(r.menuPadreId)!.hijos.push(node);
    } else {
      roots.push(node);
    }
  });
  // Sort by orden at every level
  const sortByOrden = (nodes: MenuNode[]) => {
    nodes.sort((a, b) => a.orden - b.orden);
    nodes.forEach(n => sortByOrden(n.hijos));
    return nodes;
  };
  return sortByOrden(roots);
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return new Response(null, { status: 401 });

    const roles   = (session.user.roles as string[]) ?? [];
    const isAdmin = roles.includes('ADMIN');

    let allMenus: MenuRow[];

    if (isAdmin) {
      // Admin ve todo
      allMenus = await db.menu.findMany({
        where:   { estado: true },
        orderBy: [{ menuPadreId: 'asc' }, { orden: 'asc' }],
      }) as MenuRow[];
    } else {
      // Obtener IDs de menús asignados a los roles del usuario
      const menuRoles = await db.menuRol.findMany({
        where: { estado: true, rol: { codigo: { in: roles }, estado: true } },
        select: { menuId: true },
      });
      const assignedIds = [...new Set(menuRoles.map(mr => mr.menuId))];

      // Obtener esos menús + sus padres (para que las secciones sean visibles)
      const assignedMenus = await db.menu.findMany({
        where: { id: { in: assignedIds }, estado: true },
      }) as MenuRow[];

      const parentIds = [...new Set(
        assignedMenus.map(m => m.menuPadreId).filter((id): id is number => id !== null)
      )];

      const parentMenus = parentIds.length > 0
        ? await db.menu.findMany({ where: { id: { in: parentIds }, estado: true } }) as MenuRow[]
        : [];

      // Merge sin duplicados
      const seen = new Set<number>();
      allMenus = [];
      for (const m of [...parentMenus, ...assignedMenus]) {
        if (!seen.has(m.id)) { seen.add(m.id); allMenus.push(m); }
      }
    }

    return ok(flatToTree(allMenus));
  } catch (error) {
    return serverError(error);
  }
}

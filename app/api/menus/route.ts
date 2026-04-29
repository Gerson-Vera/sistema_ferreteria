import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { ok, serverError } from '@/lib/api/response';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return new Response(null, { status: 401 });

    const roles = (session.user.roles as string[]) ?? [];

    const menuRoles = await db.menuRol.findMany({
      where: {
        estado: true,
        rol: { codigo: { in: roles }, estado: true },
      },
      select: { menu: { select: { codigo: true } } },
    });

    const codes = [...new Set(menuRoles.map(mr => mr.menu.codigo))];
    return ok(codes);
  } catch (error) {
    return serverError(error);
  }
}

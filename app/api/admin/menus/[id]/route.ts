import { type NextRequest } from 'next/server';
import { ok, notFound, forbidden, serverError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/require-admin';
import { menusRepository } from '@/modules/seguridad/server/menus.repository';
import { updateMenuSchema } from '@/modules/seguridad/schemas';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (!guard.ok) return forbidden();
  try {
    const id = parseInt((await params).id);
    const body = await req.json() as Record<string, unknown>;

    if (body.accion === 'toggle') {
      const menu = await menusRepository.findById(id);
      if (!menu) return notFound('Menú');
      return ok(await menusRepository.toggleEstado(id));
    }

    const data = updateMenuSchema.parse(body);
    return ok(await menusRepository.update(id, data));
  } catch (e) {
    return serverError(e);
  }
}

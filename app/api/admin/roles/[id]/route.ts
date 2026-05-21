import { type NextRequest } from 'next/server';
import { ok, badRequest, notFound, forbidden, serverError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/require-admin';
import { rolesRepository } from '@/modules/seguridad/server/roles.repository';
import { updateRolSchema } from '@/modules/seguridad/schemas';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (!guard.ok) return forbidden();
  try {
    const id = parseInt((await params).id);
    const rol = await rolesRepository.findById(id);
    if (!rol) return notFound('Rol');
    return ok(rol);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (!guard.ok) return forbidden();
  try {
    const id = parseInt((await params).id);
    const body = await req.json() as Record<string, unknown>;

    if (body.accion === 'toggle') {
      return ok(await rolesRepository.toggleEstado(id));
    }

    const data = updateRolSchema.parse(body);
    if (Object.keys(data).length === 0) return badRequest('Sin cambios');
    return ok(await rolesRepository.update(id, data));
  } catch (e) {
    return serverError(e);
  }
}

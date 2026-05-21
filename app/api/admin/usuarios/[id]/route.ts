import { type NextRequest } from 'next/server';
import { ok, badRequest, notFound, forbidden, conflict, serverError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/require-admin';
import { usuariosRepository } from '@/modules/seguridad/server/usuarios.repository';
import { updateUsuarioSchema } from '@/modules/seguridad/schemas';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (!guard.ok) return forbidden();
  try {
    const id = parseInt((await params).id);
    const usuario = await usuariosRepository.findById(id);
    if (!usuario) return notFound('Usuario');
    return ok(usuario);
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

    // accion: toggle estado
    if (body.accion === 'toggle') {
      if (id === guard.userId) return badRequest('No puedes desactivar tu propia cuenta');
      return ok(await usuariosRepository.toggleEstado(id));
    }

    const data = updateUsuarioSchema.parse(body);
    if (Object.keys(data).length === 0) return badRequest('Sin cambios');
    return ok(await usuariosRepository.update(id, data));
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') return conflict('El email ya está en uso');
    return serverError(e);
  }
}

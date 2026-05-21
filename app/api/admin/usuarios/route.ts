import { type NextRequest } from 'next/server';
import { ok, created, badRequest, forbidden, conflict, serverError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/require-admin';
import { usuariosRepository } from '@/modules/seguridad/server/usuarios.repository';
import { createUsuarioSchema, queryUsuariosSchema } from '@/modules/seguridad/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return forbidden();
  try {
    const params = queryUsuariosSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    return ok(await usuariosRepository.findMany(params));
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return forbidden();
  try {
    const body = createUsuarioSchema.parse(await req.json());
    const result = await usuariosRepository.create(body);
    return created(result);
  } catch (e) {
    if (e instanceof AppError) return badRequest(e.message);
    if ((e as { code?: string }).code === 'P2002') return conflict('El username o email ya está en uso');
    return serverError(e);
  }
}

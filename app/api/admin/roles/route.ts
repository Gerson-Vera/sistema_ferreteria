import { type NextRequest } from 'next/server';
import { ok, created, badRequest, forbidden, conflict, serverError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/require-admin';
import { rolesRepository } from '@/modules/seguridad/server/roles.repository';
import { createRolSchema } from '@/modules/seguridad/schemas';

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return forbidden();
  try {
    return ok(await rolesRepository.findAll());
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return forbidden();
  try {
    const body = createRolSchema.parse(await req.json());
    return created(await rolesRepository.create(body));
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') return conflict('El código de rol ya existe');
    return serverError(e);
  }
}

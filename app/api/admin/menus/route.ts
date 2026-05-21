import { type NextRequest } from 'next/server';
import { ok, created, badRequest, forbidden, conflict, serverError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/require-admin';
import { menusRepository } from '@/modules/seguridad/server/menus.repository';
import { createMenuSchema } from '@/modules/seguridad/schemas';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return forbidden();
  try {
    const flat = req.nextUrl.searchParams.get('flat') === '1';
    const data = flat
      ? await menusRepository.findAllFlat()
      : await menusRepository.findAllTree();
    return ok(data);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return forbidden();
  try {
    const body = createMenuSchema.parse(await req.json());
    return created(await menusRepository.create(body));
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') return conflict('El código de menú ya existe');
    return serverError(e);
  }
}

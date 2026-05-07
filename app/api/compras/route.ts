import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { comprasService } from '@/modules/compras/server/compras.service';
import { createCompraSchema, queryCompraSchema } from '@/modules/compras/schemas';
import { AppError } from '@/lib/errors/AppError';
import { getSessionUsuarioId } from '@/lib/auth/get-session-user';

export async function GET(req: NextRequest) {
  try {
    const params = queryCompraSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    return ok(await comprasService.getAll(params));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuarioId = await getSessionUsuarioId();
    if (!usuarioId) return badRequest('Sesión no válida. Cierra sesión e inicia de nuevo.');
    const dto = createCompraSchema.parse(await req.json());
    return created(await comprasService.create(dto, usuarioId));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

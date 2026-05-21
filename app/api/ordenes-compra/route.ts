import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { AppError } from '@/lib/errors/AppError';
import { ordenesCompraService } from '@/modules/ordenes-compra/server/ordenes-compra.service';
import { createOrdenCompraSchema, queryOrdenSchema } from '@/modules/ordenes-compra/schemas';
import { getSessionUsuarioId } from '@/lib/auth/get-session-user';

export async function GET(req: NextRequest) {
  try {
    const params = queryOrdenSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    return ok(await ordenesCompraService.getAll(params));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuarioId = await getSessionUsuarioId();
    if (!usuarioId) return badRequest('Sesión no válida');
    const dto = createOrdenCompraSchema.parse(await req.json());
    return created(await ordenesCompraService.create(dto, usuarioId));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { transferenciasService } from '@/modules/transferencias/server/transferencias.service';
import { createTransferenciaSchema, queryTransferenciaSchema } from '@/modules/transferencias/schemas';
import { AppError } from '@/lib/errors/AppError';
import { getSessionUsuarioId } from '@/lib/auth/get-session-user';

export async function GET(req: NextRequest) {
  try {
    const params = queryTransferenciaSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    return ok(await transferenciasService.getAll(params));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuarioId = await getSessionUsuarioId();
    if (!usuarioId) return badRequest('Sesión no válida. Cierra sesión e inicia de nuevo.');
    const dto = createTransferenciaSchema.parse(await req.json());
    return created(await transferenciasService.create(dto, usuarioId));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

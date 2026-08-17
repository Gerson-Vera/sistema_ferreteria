import { type NextRequest } from 'next/server';
import { ok, badRequest, notFound, serverError } from '@/lib/api/response';
import { despachosService } from '@/modules/despachos/server/despachos.service';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    return ok(await despachosService.getById((await params).id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Despacho');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { accion } = await req.json() as { accion: 'avanzar' | 'anular' };
    if (accion === 'avanzar') return ok(await despachosService.avanzar(id));
    if (accion === 'anular') return ok(await despachosService.anular(id));
    return badRequest('Acción inválida. Use "avanzar" o "anular"');
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Despacho');
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

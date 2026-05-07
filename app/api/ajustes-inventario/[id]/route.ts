import { type NextRequest } from 'next/server';
import { ok, badRequest, notFound, serverError } from '@/lib/api/response';
import { ajustesInventarioService } from '@/modules/ajustes-inventario/server/ajustes-inventario.service';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    return ok(await ajustesInventarioService.getById((await params).id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Ajuste');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { accion } = await req.json() as { accion: 'aplicar' | 'anular' };
    if (accion === 'aplicar') return ok(await ajustesInventarioService.aplicar(id));
    if (accion === 'anular') return ok(await ajustesInventarioService.anular(id));
    return badRequest('Acción inválida. Use "aplicar" o "anular"');
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Ajuste');
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

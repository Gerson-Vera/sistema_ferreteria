import { type NextRequest } from 'next/server';
import { ok, badRequest, notFound, serverError } from '@/lib/api/response';
import { transferenciasService } from '@/modules/transferencias/server/transferencias.service';
import { AppError } from '@/lib/errors/AppError';
import { getSessionUsuarioId } from '@/lib/auth/get-session-user';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    return ok(await transferenciasService.getById((await params).id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Transferencia');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const usuarioId = await getSessionUsuarioId();
    if (!usuarioId) return badRequest('Sesión no válida. Cierra sesión e inicia de nuevo.');
    const { id } = await params;
    const { accion } = await req.json() as { accion: 'enviar' | 'recibir' | 'anular' };
    if (accion === 'enviar') return ok(await transferenciasService.enviar(id, usuarioId));
    if (accion === 'recibir') return ok(await transferenciasService.recibir(id, usuarioId));
    if (accion === 'anular') return ok(await transferenciasService.anular(id, usuarioId));
    return badRequest('Acción inválida. Use "enviar", "recibir" o "anular"');
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Transferencia');
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

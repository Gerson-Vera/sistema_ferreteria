import { type NextRequest } from 'next/server';
import { ok, badRequest, serverError } from '@/lib/api/response';
import { AppError } from '@/lib/errors/AppError';
import { ordenesCompraService } from '@/modules/ordenes-compra/server/ordenes-compra.service';
import { getSessionUsuarioId } from '@/lib/auth/get-session-user';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const usuarioId = await getSessionUsuarioId();
    if (!usuarioId) return badRequest('Sesión no válida');
    return ok(await ordenesCompraService.recibir(id, usuarioId));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

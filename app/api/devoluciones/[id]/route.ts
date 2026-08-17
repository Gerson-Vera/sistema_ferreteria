import { type NextRequest } from 'next/server';
import { ok, badRequest, notFound, serverError } from '@/lib/api/response';
import { devolucionesService } from '@/modules/devoluciones/server/devoluciones.service';
import { AppError } from '@/lib/errors/AppError';
import { getSessionUsuarioId } from '@/lib/auth/get-session-user';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const tipo = req.nextUrl.searchParams.get('tipo') === 'compra' ? 'compra' : 'venta';
    return ok(await devolucionesService.getById((await params).id, tipo));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Devolución');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const usuarioId = await getSessionUsuarioId();
    if (!usuarioId) return badRequest('Sesión no válida. Cierra sesión e inicia de nuevo.');
    const { id } = await params;
    const { accion, tipo } = await req.json() as { accion: 'anular'; tipo: 'venta' | 'compra' };
    if (accion === 'anular') return ok(await devolucionesService.anular(id, tipo === 'compra' ? 'compra' : 'venta', usuarioId));
    return badRequest('Acción inválida. Use "anular"');
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Devolución');
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

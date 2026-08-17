import { type NextRequest } from 'next/server';
import { ok, badRequest, notFound, serverError } from '@/lib/api/response';
import { conteosInventarioService } from '@/modules/conteos-inventario/server/conteos-inventario.service';
import { registrarConteoSchema } from '@/modules/conteos-inventario/schemas';
import { AppError } from '@/lib/errors/AppError';
import { getSessionUsuarioId } from '@/lib/auth/get-session-user';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    return ok(await conteosInventarioService.getById((await params).id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Conteo');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json() as { accion: 'registrar' | 'aplicar' | 'anular'; items?: unknown };

    if (body.accion === 'registrar') {
      const { items } = registrarConteoSchema.parse({ items: body.items });
      return ok(await conteosInventarioService.registrar(id, items));
    }
    if (body.accion === 'aplicar') {
      const usuarioId = await getSessionUsuarioId();
      if (!usuarioId) return badRequest('Sesión no válida. Cierra sesión e inicia de nuevo.');
      return ok(await conteosInventarioService.aplicar(id, usuarioId));
    }
    if (body.accion === 'anular') return ok(await conteosInventarioService.anular(id));
    return badRequest('Acción inválida. Use "registrar", "aplicar" o "anular"');
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Conteo');
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}

import { type NextRequest } from 'next/server';
import { ok, badRequest, notFound, serverError } from '@/lib/api/response';
import { comprasService } from '@/modules/compras/server/compras.service';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    return ok(await comprasService.getById((await params).id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Compra');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json() as {
      accion: 'recibir' | 'anular';
      items?: { itemId: string; cantidad: number }[];
    };
    if (body.accion === 'recibir') {
      return ok(await comprasService.recibir(id, body.items));
    }
    if (body.accion === 'anular') return ok(await comprasService.anular(id));
    return badRequest('Acción inválida. Use "recibir" o "anular"');
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Compra');
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

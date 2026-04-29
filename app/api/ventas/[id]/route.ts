import { type NextRequest } from 'next/server';
import { ok, badRequest, notFound, serverError } from '@/lib/api/response';
import { ventasService } from '@/modules/ventas/server/ventas.service';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    return ok(await ventasService.getById((await params).id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Venta');
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    return ok(await ventasService.anular((await params).id));
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Venta');
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

import { type NextRequest } from 'next/server';
import { ok, badRequest, notFound, serverError } from '@/lib/api/response';
import { AppError } from '@/lib/errors/AppError';
import { ordenesCompraService } from '@/modules/ordenes-compra/server/ordenes-compra.service';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return ok(await ordenesCompraService.getById(id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Orden de compra');
    return serverError(error);
  }
}

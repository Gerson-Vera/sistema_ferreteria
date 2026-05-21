import { type NextRequest } from 'next/server';
import { ok, badRequest, serverError } from '@/lib/api/response';
import { AppError } from '@/lib/errors/AppError';
import { ordenesCompraService } from '@/modules/ordenes-compra/server/ordenes-compra.service';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return ok(await ordenesCompraService.anular(id));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

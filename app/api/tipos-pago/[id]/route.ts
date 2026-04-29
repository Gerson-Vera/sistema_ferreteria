import { type NextRequest } from 'next/server';
import { ok, noContent, badRequest, notFound, serverError } from '@/lib/api/response';
import { tiposPagoService } from '@/modules/tipos-pago/server/tipos-pago.service';
import { updateTipoPagoSchema } from '@/modules/tipos-pago/schemas';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return ok(await tiposPagoService.getById(id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Tipo de pago');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const dto = updateTipoPagoSchema.parse(await req.json());
    return ok(await tiposPagoService.update(id, dto));
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Tipo de pago');
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await tiposPagoService.delete(id);
    return noContent();
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Tipo de pago');
    return serverError(error);
  }
}

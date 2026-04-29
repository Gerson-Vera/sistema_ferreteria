import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { tiposPagoService } from '@/modules/tipos-pago/server/tipos-pago.service';
import { createTipoPagoSchema, tipoPagoQuerySchema } from '@/modules/tipos-pago/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  try {
    const { activo } = tipoPagoQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );
    return ok(await tiposPagoService.getAll(activo));
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const dto = createTipoPagoSchema.parse(await req.json());
    return created(await tiposPagoService.create(dto));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

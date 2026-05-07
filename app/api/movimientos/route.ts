import { type NextRequest } from 'next/server';
import { ok, badRequest, serverError } from '@/lib/api/response';
import { movimientosService } from '@/modules/movimientos/server/movimientos.service';
import { queryMovimientoSchema } from '@/modules/movimientos/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  try {
    const params = queryMovimientoSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    return ok(await movimientosService.getAll(params));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

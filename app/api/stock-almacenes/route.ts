import { type NextRequest } from 'next/server';
import { ok, badRequest, serverError } from '@/lib/api/response';
import { stockAlmacenesService } from '@/modules/stock-almacenes/server/stock-almacenes.service';
import { queryStockAlmacenSchema } from '@/modules/stock-almacenes/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  try {
    const params = queryStockAlmacenSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    return ok(await stockAlmacenesService.getAll(params));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

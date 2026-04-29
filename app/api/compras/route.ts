import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { comprasService } from '@/modules/compras/server/compras.service';
import { createCompraSchema, queryCompraSchema } from '@/modules/compras/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  try {
    const params = queryCompraSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    return ok(await comprasService.getAll(params));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const dto = createCompraSchema.parse(await req.json());
    return created(await comprasService.create(dto));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

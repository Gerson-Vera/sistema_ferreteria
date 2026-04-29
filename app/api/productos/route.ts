import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { productosService } from '@/modules/productos/server/productos.service';
import { createProductoSchema, queryProductoSchema } from '@/modules/productos/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  try {
    const params = queryProductoSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const result = await productosService.getAll(params);
    return ok(result);
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = createProductoSchema.parse(body);
    const producto = await productosService.create(dto);
    return created(producto);
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

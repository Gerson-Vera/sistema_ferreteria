import { type NextRequest } from 'next/server';
import { ok, badRequest, serverError } from '@/lib/api/response';
import { productosService } from '@/modules/productos/server/productos.service';
import { codigosBarrasSchema } from '@/modules/productos/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = codigosBarrasSchema.parse(body);
    const productos = await productosService.ensureCodigosBarras(ids);
    return ok(productos);
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

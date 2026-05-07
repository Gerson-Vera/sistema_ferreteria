import { type NextRequest } from 'next/server';
import { ok, notFound, serverError } from '@/lib/api/response';
import { productosService } from '@/modules/productos/server/productos.service';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ codigo: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { codigo } = await params;
    return ok(await productosService.getByCodigoBarras(codigo));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Producto');
    return serverError(error);
  }
}

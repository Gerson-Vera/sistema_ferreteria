import { type NextRequest } from 'next/server';
import { ok, noContent, badRequest, notFound, serverError } from '@/lib/api/response';
import { productosService } from '@/modules/productos/server/productos.service';
import { updateProductoSchema } from '@/modules/productos/schemas';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const producto = await productosService.getById(id);
    return ok(producto);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Producto');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const dto = updateProductoSchema.parse(body);
    const producto = await productosService.update(id, dto);
    return ok(producto);
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Producto');
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await productosService.delete(id);
    return noContent();
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Producto');
    return serverError(error);
  }
}

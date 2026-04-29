import { type NextRequest } from 'next/server';
import { ok, noContent, badRequest, notFound, serverError } from '@/lib/api/response';
import { proveedoresService } from '@/modules/proveedores/server/proveedores.service';
import { updateProveedorSchema } from '@/modules/proveedores/schemas';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    return ok(await proveedoresService.getById((await params).id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Proveedor');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const dto = updateProveedorSchema.parse(await req.json());
    return ok(await proveedoresService.update((await params).id, dto));
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Proveedor');
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await proveedoresService.delete((await params).id);
    return noContent();
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Proveedor');
    return serverError(error);
  }
}

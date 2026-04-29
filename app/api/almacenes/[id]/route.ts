import { type NextRequest } from 'next/server';
import { ok, noContent, badRequest, notFound, serverError } from '@/lib/api/response';
import { almacenesService } from '@/modules/almacenes/server/almacenes.service';
import { updateAlmacenSchema } from '@/modules/almacenes/schemas';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return ok(await almacenesService.getById(id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Almacén');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const dto = updateAlmacenSchema.parse(await req.json());
    return ok(await almacenesService.update(id, dto));
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Almacén');
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await almacenesService.delete(id);
    return noContent();
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Almacén');
    return serverError(error);
  }
}

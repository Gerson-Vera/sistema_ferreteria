import { type NextRequest } from 'next/server';
import { ok, noContent, badRequest, notFound, serverError } from '@/lib/api/response';
import { marcasService } from '@/modules/marcas/server/marcas.service';
import { updateMarcaSchema } from '@/modules/marcas/schemas';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return ok(await marcasService.getById(id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Marca');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const dto = updateMarcaSchema.parse(await req.json());
    return ok(await marcasService.update(id, dto));
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Marca');
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await marcasService.delete(id);
    return noContent();
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Marca');
    return serverError(error);
  }
}

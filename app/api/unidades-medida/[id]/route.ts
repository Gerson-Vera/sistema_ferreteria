import { type NextRequest } from 'next/server';
import { ok, noContent, badRequest, notFound, serverError } from '@/lib/api/response';
import { unidadesMedidaService } from '@/modules/unidades-medida/server/unidades-medida.service';
import { updateUnidadMedidaSchema } from '@/modules/unidades-medida/schemas';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return ok(await unidadesMedidaService.getById(id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Unidad de medida');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const dto = updateUnidadMedidaSchema.parse(await req.json());
    return ok(await unidadesMedidaService.update(id, dto));
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Unidad de medida');
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await unidadesMedidaService.delete(id);
    return noContent();
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Unidad de medida');
    return serverError(error);
  }
}

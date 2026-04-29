import { type NextRequest } from 'next/server';
import { ok, noContent, badRequest, notFound, serverError } from '@/lib/api/response';
import { clientesService } from '@/modules/clientes/server/clientes.service';
import { updateClienteSchema } from '@/modules/clientes/schemas';
import { AppError } from '@/lib/errors/AppError';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    return ok(await clientesService.getById((await params).id));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Cliente');
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const dto = updateClienteSchema.parse(await req.json());
    return ok(await clientesService.update((await params).id, dto));
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) return notFound('Cliente');
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await clientesService.delete((await params).id);
    return noContent();
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) return notFound('Cliente');
    return serverError(error);
  }
}

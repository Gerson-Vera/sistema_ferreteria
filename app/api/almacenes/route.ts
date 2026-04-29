import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { almacenesService } from '@/modules/almacenes/server/almacenes.service';
import { createAlmacenSchema, almacenQuerySchema } from '@/modules/almacenes/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  try {
    const { activo } = almacenQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );
    return ok(await almacenesService.getAll(activo));
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const dto = createAlmacenSchema.parse(await req.json());
    return created(await almacenesService.create(dto));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

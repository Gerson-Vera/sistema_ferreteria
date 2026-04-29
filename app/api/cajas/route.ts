import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { cajasService } from '@/modules/cajas/server/cajas.service';
import { createCajaSchema, cajaQuerySchema } from '@/modules/cajas/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  try {
    const { activo } = cajaQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );
    return ok(await cajasService.getAll(activo));
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const dto = createCajaSchema.parse(await req.json());
    return created(await cajasService.create(dto));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

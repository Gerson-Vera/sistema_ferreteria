import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { marcasService } from '@/modules/marcas/server/marcas.service';
import { createMarcaSchema, marcaQuerySchema } from '@/modules/marcas/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  try {
    const { activo } = marcaQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );
    return ok(await marcasService.getAll(activo));
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const dto = createMarcaSchema.parse(await req.json());
    return created(await marcasService.create(dto));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

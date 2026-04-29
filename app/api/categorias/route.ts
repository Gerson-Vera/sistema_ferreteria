import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { categoriasService } from '@/modules/categorias/server/categorias.service';
import { createCategoriaSchema } from '@/modules/categorias/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET() {
  try {
    const result = await categoriasService.getAll();
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = createCategoriaSchema.parse(body);
    const categoria = await categoriasService.create(dto);
    return created(categoria);
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

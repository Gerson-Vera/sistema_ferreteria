import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { unidadesMedidaService } from '@/modules/unidades-medida/server/unidades-medida.service';
import { createUnidadMedidaSchema, unidadMedidaQuerySchema } from '@/modules/unidades-medida/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  try {
    const { activo } = unidadMedidaQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );
    return ok(await unidadesMedidaService.getAll(activo));
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const dto = createUnidadMedidaSchema.parse(await req.json());
    return created(await unidadesMedidaService.create(dto));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

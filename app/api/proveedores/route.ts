import { type NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/api/response';
import { proveedoresService } from '@/modules/proveedores/server/proveedores.service';
import { createProveedorSchema } from '@/modules/proveedores/schemas';
import { AppError } from '@/lib/errors/AppError';

export async function GET(req: NextRequest) {
  try {
    const page = Number(req.nextUrl.searchParams.get('page') ?? 1);
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20);
    const search = req.nextUrl.searchParams.get('search') ?? undefined;
    return ok(await proveedoresService.getAll({ page, limit, search }));
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const dto = createProveedorSchema.parse(await req.json());
    return created(await proveedoresService.create(dto));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message, error.details);
    return serverError(error);
  }
}

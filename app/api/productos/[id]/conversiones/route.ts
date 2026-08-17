import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, badRequest, notFound, serverError } from '@/lib/api/response';
import { productosRepository } from '@/modules/productos/server/productos.repository';
import { AppError } from '@/lib/errors/AppError';
import db from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

const setConversionesSchema = z.array(
  z.object({
    unidadMedidaId: z.string().min(1, 'Unidad requerida'),
    factor: z.number().positive('El factor debe ser mayor a 0').max(100000),
  }),
).max(10, 'Máximo 10 conversiones por producto');

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return ok(await productosRepository.getConversiones(id));
  } catch (error) {
    if (error instanceof AppError) return badRequest(error.message);
    return serverError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const items = setConversionesSchema.parse(await req.json());

    const producto = await db.producto.findUnique({
      where: { id: parseInt(id) },
      select: { unidadMedidaId: true },
    });
    if (!producto) return notFound('Producto');

    const ids = items.map(i => i.unidadMedidaId);
    if (new Set(ids).size !== ids.length) {
      return badRequest('No se puede repetir la misma unidad en las conversiones');
    }
    if (producto.unidadMedidaId && ids.includes(String(producto.unidadMedidaId))) {
      return badRequest('La unidad base del producto no necesita conversión');
    }

    return ok(await productosRepository.setConversiones(id, items));
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest(error.issues[0]?.message ?? 'Datos inválidos');
    if (error instanceof AppError) return badRequest(error.message);
    return serverError(error);
  }
}

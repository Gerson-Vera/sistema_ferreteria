import { AppError } from '@/lib/errors/AppError';
import type { Prisma } from '@/generated/prisma/client';

type Tx = Prisma.TransactionClient;

export type FactorResuelto = {
  unidadMedidaId: number | null;
  /** Cuántas unidades base representa 1 unidad del ítem (1 = unidad base). */
  factor: number;
};

/**
 * Resuelve la unidad y el factor de conversión de un ítem de venta/compra.
 * - Sin unidad indicada, o la unidad base del producto → factor 1.
 * - Unidad alternativa → factor de la tabla de conversiones del producto.
 * Lanza error si la unidad no tiene conversión configurada para el producto.
 */
export async function resolverFactorUnidad(
  tx: Tx,
  productoId: number,
  unidadMedidaId?: string | null,
): Promise<FactorResuelto> {
  if (!unidadMedidaId) return { unidadMedidaId: null, factor: 1 };

  const uid = parseInt(unidadMedidaId);
  const producto = await tx.producto.findUniqueOrThrow({
    where: { id: productoId },
    select: { descripcion: true, unidadMedidaId: true },
  });

  if (producto.unidadMedidaId === uid) return { unidadMedidaId: uid, factor: 1 };

  const conversion = await tx.productoUnidadConversion.findUnique({
    where: { productoId_unidadMedidaId: { productoId, unidadMedidaId: uid } },
  });
  if (!conversion || !conversion.estado) {
    throw AppError.badRequest(
      `El producto "${producto.descripcion}" no tiene conversión configurada para la unidad indicada`,
    );
  }

  return { unidadMedidaId: uid, factor: Number(conversion.factor) };
}

/** Convierte una cantidad en la unidad del documento a unidades base de stock. */
export function aUnidadesBase(cantidad: number, factor: number): number {
  return Math.round(cantidad * factor);
}

/** Convierte un costo por unidad del documento a costo por unidad base. */
export function costoUnitarioBase(costo: number, factor: number): number {
  return Math.round((costo / factor) * 100) / 100;
}

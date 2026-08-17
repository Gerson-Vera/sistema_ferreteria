import { AppError } from '@/lib/errors/AppError';
import type { Prisma } from '@/generated/prisma/client';

type Tx = Prisma.TransactionClient;

export type TipoMovimientoStock =
  | 'entrada_compra'
  | 'salida_venta'
  | 'entrada_ajuste'
  | 'salida_ajuste'
  | 'entrada_manual'
  | 'salida_manual'
  | 'entrada_transferencia'
  | 'salida_transferencia'
  | 'entrada_devolucion_venta'
  | 'salida_devolucion_compra';

export type AplicarMovimientoParams = {
  productoId: number;
  almacenId: number;
  /** Cantidad siempre positiva; el signo lo determina el tipo (entrada_* suma, salida_* resta). */
  cantidad: number;
  tipo: TipoMovimientoStock;
  /** Costo unitario del movimiento (kardex valorizado). */
  costoUnitario?: number;
  referenciaId?: number;
  referenciaTipo?: string;
  observacion?: string;
  usuarioId: number;
  /** Permite dejar el stock del almacén en negativo (p. ej. correcciones). Por defecto false. */
  permitirNegativo?: boolean;
};

export type ResultadoMovimiento = {
  stockAnterior: number;
  stockNuevo: number;
};

/**
 * Resuelve el almacén sobre el que operar: usa el preferido si viene,
 * o el primer almacén activo. Lanza error si no hay almacenes.
 */
export async function resolverAlmacenId(tx: Tx, preferido?: number | null): Promise<number> {
  if (preferido) return preferido;
  const almacen =
    (await tx.almacen.findFirst({ where: { estado: true }, orderBy: { id: 'asc' } })) ??
    (await tx.almacen.findFirst({ orderBy: { id: 'asc' } }));
  if (!almacen) throw AppError.badRequest('No hay almacenes registrados');
  return almacen.id;
}

/** Stock actual de un producto en un almacén (0 si aún no tiene fila). */
export async function stockEnAlmacen(tx: Tx, productoId: number, almacenId: number): Promise<number> {
  const row = await tx.stockAlmacen.findUnique({
    where: { productoId_almacenId: { productoId, almacenId } },
    select: { stock: true },
  });
  return row?.stock ?? 0;
}

/** Stock y reserva actuales de un producto en un almacén. */
export async function stockYReserva(tx: Tx, productoId: number, almacenId: number): Promise<{ stock: number; reservado: number }> {
  const row = await tx.stockAlmacen.findUnique({
    where: { productoId_almacenId: { productoId, almacenId } },
    select: { stock: true, stockReservado: true },
  });
  return { stock: row?.stock ?? 0, reservado: row?.stockReservado ?? 0 };
}

/**
 * Reserva stock de un almacén (p. ej. transferencia pendiente de envío).
 * Valida que haya disponible suficiente (stock − ya reservado).
 */
export async function reservarStock(tx: Tx, productoId: number, almacenId: number, cantidad: number): Promise<void> {
  const { stock, reservado } = await stockYReserva(tx, productoId, almacenId);
  const disponible = stock - reservado;
  if (cantidad > disponible) {
    const [producto, almacen] = await Promise.all([
      tx.producto.findUnique({ where: { id: productoId }, select: { descripcion: true } }),
      tx.almacen.findUnique({ where: { id: almacenId }, select: { nombre: true } }),
    ]);
    throw AppError.conflict(
      `Stock disponible insuficiente de "${producto?.descripcion ?? productoId}" en ${almacen?.nombre ?? 'el almacén'}: disponible ${disponible} (${reservado} reservado), solicitado ${cantidad}`,
    );
  }
  await tx.stockAlmacen.update({
    where: { productoId_almacenId: { productoId, almacenId } },
    data: { stockReservado: { increment: cantidad } },
  });
}

/** Libera una reserva previa (al enviar o anular la transferencia pendiente). */
export async function liberarReserva(tx: Tx, productoId: number, almacenId: number, cantidad: number): Promise<void> {
  const { reservado } = await stockYReserva(tx, productoId, almacenId);
  await tx.stockAlmacen.update({
    where: { productoId_almacenId: { productoId, almacenId } },
    data: { stockReservado: Math.max(0, reservado - cantidad) },
  });
}

/**
 * Aplica un movimiento de inventario de forma atómica (debe llamarse dentro de una transacción):
 * 1. Actualiza el stock del producto en el almacén (stock_almacenes).
 * 2. Actualiza el stock total del producto (productos.stock).
 * 3. Registra el movimiento en el kardex con su almacén.
 *
 * stockAnterior/stockNuevo del kardex son los del almacén, no el total.
 */
export async function aplicarMovimientoStock(
  tx: Tx,
  params: AplicarMovimientoParams,
): Promise<ResultadoMovimiento> {
  const { productoId, almacenId, cantidad, tipo, usuarioId, permitirNegativo = false } = params;

  const esEntrada = tipo.startsWith('entrada');
  const delta = esEntrada ? cantidad : -cantidad;

  const { stock: stockAnterior, reservado } = await stockYReserva(tx, productoId, almacenId);
  const stockNuevo = stockAnterior + delta;

  // Una salida no puede dejar el stock por debajo de lo reservado
  // (el stock reservado está comprometido por transferencias pendientes)
  if (!esEntrada && stockNuevo < reservado && !permitirNegativo) {
    const disponible = stockAnterior - reservado;
    const [producto, almacen] = await Promise.all([
      tx.producto.findUnique({ where: { id: productoId }, select: { descripcion: true } }),
      tx.almacen.findUnique({ where: { id: almacenId }, select: { nombre: true } }),
    ]);
    throw AppError.conflict(
      `Stock insuficiente de "${producto?.descripcion ?? productoId}" en ${almacen?.nombre ?? 'el almacén'}: disponible ${disponible}${reservado > 0 ? ` (${reservado} reservado)` : ''}, solicitado ${cantidad}`,
    );
  }

  await tx.stockAlmacen.upsert({
    where: { productoId_almacenId: { productoId, almacenId } },
    update: { stock: stockNuevo },
    create: { productoId, almacenId, stock: stockNuevo },
  });

  await tx.producto.update({
    where: { id: productoId },
    data: { stock: { increment: delta } },
  });

  await tx.movimientoInventario.create({
    data: {
      productoId,
      almacenId,
      tipo,
      cantidad,
      costoUnitario: params.costoUnitario ?? null,
      stockAnterior,
      stockNuevo,
      referenciaId: params.referenciaId ?? null,
      referenciaTipo: params.referenciaTipo ?? null,
      observacion: params.observacion ?? null,
      usuarioId,
    },
  });

  return { stockAnterior, stockNuevo };
}

/** Costo promedio actual de un producto. */
export async function costoPromedioDe(tx: Tx, productoId: number): Promise<number> {
  const p = await tx.producto.findUnique({
    where: { id: productoId },
    select: { costoPromedio: true },
  });
  return Number(p?.costoPromedio ?? 0);
}

/**
 * Recalcula el costo promedio ponderado ante una entrada de mercadería.
 * Debe llamarse ANTES de aplicar el movimiento de entrada (usa el stock total actual).
 *
 *   nuevoCP = (stockActual × CP + cantidad × costo) / (stockActual + cantidad)
 *
 * Si no hay stock previo, el costo promedio pasa a ser el costo de la entrada.
 * Devuelve el nuevo costo promedio.
 */
export async function actualizarCostoPromedio(
  tx: Tx,
  productoId: number,
  cantidadEntrante: number,
  costoUnitario: number,
): Promise<number> {
  const p = await tx.producto.findUniqueOrThrow({
    where: { id: productoId },
    select: { stock: true, costoPromedio: true },
  });

  const stockActual = Math.max(0, p.stock);
  const cpActual = Number(p.costoPromedio);
  const nuevoCP = stockActual + cantidadEntrante <= 0
    ? costoUnitario
    : Math.round(((stockActual * cpActual + cantidadEntrante * costoUnitario) / (stockActual + cantidadEntrante)) * 100) / 100;

  await tx.producto.update({
    where: { id: productoId },
    data: { costoPromedio: nuevoCP },
  });

  return nuevoCP;
}

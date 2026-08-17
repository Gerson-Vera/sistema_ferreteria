import db from '@/lib/db';
import { aplicarMovimientoStock, costoPromedioDe, reservarStock, liberarReserva } from '@/lib/inventario/stock';
import type { Transferencia, TransferenciaItem, EstadoTransferencia, CreateTransferenciaDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryTransferenciaInput } from '../schemas';

type TransferenciaItemRow = {
  id: number;
  transferenciaId: number;
  productoId: number;
  cantidad: number;
  producto: { descripcion: string; codigo: string };
};

type TransferenciaRow = {
  id: number;
  numero: string;
  almacenOrigenId: number;
  almacenDestinoId: number;
  usuarioId: number;
  estado: string;
  observaciones: string | null;
  fechaEnvio: Date | null;
  fechaRecepcion: Date | null;
  creadoEn: Date;
  actualizadoEn: Date;
  almacenOrigen: { nombre: string };
  almacenDestino: { nombre: string };
  usuario: { nombre: string };
  lista: TransferenciaItemRow[];
};

function itemToDto(row: TransferenciaItemRow): TransferenciaItem {
  return {
    id: String(row.id),
    transferenciaId: String(row.transferenciaId),
    productoId: String(row.productoId),
    productoNombre: row.producto.descripcion,
    productoSku: row.producto.codigo,
    cantidad: row.cantidad,
  };
}

function toDto(row: TransferenciaRow): Transferencia {
  return {
    id: String(row.id),
    numero: row.numero,
    almacenOrigenId: String(row.almacenOrigenId),
    almacenOrigenNombre: row.almacenOrigen.nombre,
    almacenDestinoId: String(row.almacenDestinoId),
    almacenDestinoNombre: row.almacenDestino.nombre,
    usuarioId: String(row.usuarioId),
    usuarioNombre: row.usuario.nombre,
    estado: row.estado as EstadoTransferencia,
    observaciones: row.observaciones,
    fechaEnvio: row.fechaEnvio,
    fechaRecepcion: row.fechaRecepcion,
    items: row.lista.map(itemToDto),
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

const includeAll = {
  almacenOrigen: { select: { nombre: true } },
  almacenDestino: { select: { nombre: true } },
  usuario: { select: { nombre: true } },
  lista: { include: { producto: { select: { descripcion: true, codigo: true } } } },
};

export const transferenciasRepository = {
  async findMany(params: QueryTransferenciaInput): Promise<PaginatedResponse<Transferencia>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.estado) where.estado = params.estado;
    if (params.almacenId) {
      const aid = parseInt(params.almacenId);
      where.OR = [{ almacenOrigenId: aid }, { almacenDestinoId: aid }];
    }

    const [rows, total] = await Promise.all([
      db.transferenciaAlmacen.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: includeAll }),
      db.transferenciaAlmacen.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<Transferencia | null> {
    const row = await db.transferenciaAlmacen.findUnique({ where: { id: parseInt(id) }, include: includeAll });
    return row ? toDto(row) : null;
  },

  async create(data: CreateTransferenciaDto, numero: string, usuarioId: number): Promise<Transferencia> {
    const almacenOrigenId = parseInt(data.almacenOrigenId);

    const row = await db.$transaction(async tx => {
      // Reservar el stock en el origen mientras la transferencia esté pendiente
      for (const item of data.items) {
        await reservarStock(tx, parseInt(item.productoId), almacenOrigenId, item.cantidad);
      }

      return tx.transferenciaAlmacen.create({
        data: {
          numero,
          almacenOrigenId,
          almacenDestinoId: parseInt(data.almacenDestinoId),
          usuarioId,
          observaciones: data.observaciones ?? null,
          lista: {
            create: data.items.map(i => ({
              productoId: parseInt(i.productoId),
              cantidad: i.cantidad,
            })),
          },
        },
        include: includeAll,
      });
    });
    return toDto(row);
  },

  /** Descuenta el stock del almacén de origen y marca la transferencia como enviada. */
  async enviar(id: string, usuarioId: number): Promise<Transferencia> {
    const row = await db.$transaction(async tx => {
      const transf = await tx.transferenciaAlmacen.findUniqueOrThrow({
        where: { id: parseInt(id) },
        include: includeAll,
      });

      for (const item of transf.lista) {
        // Liberar la reserva tomada al crear y descontar el stock físico
        await liberarReserva(tx, item.productoId, transf.almacenOrigenId, item.cantidad);
        await aplicarMovimientoStock(tx, {
          productoId: item.productoId,
          almacenId: transf.almacenOrigenId,
          cantidad: item.cantidad,
          tipo: 'salida_transferencia',
          costoUnitario: await costoPromedioDe(tx, item.productoId),
          referenciaId: transf.id,
          referenciaTipo: 'Transferencia',
          observacion: `Transferencia ${transf.numero} (envío)`,
          usuarioId,
        });
      }

      return tx.transferenciaAlmacen.update({
        where: { id: parseInt(id) },
        data: { estado: 'enviada', fechaEnvio: new Date() },
        include: includeAll,
      });
    });
    return toDto(row);
  },

  /** Ingresa el stock al almacén de destino y marca la transferencia como recibida. */
  async recibir(id: string, usuarioId: number): Promise<Transferencia> {
    const row = await db.$transaction(async tx => {
      const transf = await tx.transferenciaAlmacen.findUniqueOrThrow({
        where: { id: parseInt(id) },
        include: includeAll,
      });

      for (const item of transf.lista) {
        await aplicarMovimientoStock(tx, {
          productoId: item.productoId,
          almacenId: transf.almacenDestinoId,
          cantidad: item.cantidad,
          tipo: 'entrada_transferencia',
          costoUnitario: await costoPromedioDe(tx, item.productoId),
          referenciaId: transf.id,
          referenciaTipo: 'Transferencia',
          observacion: `Transferencia ${transf.numero} (recepción)`,
          usuarioId,
        });
      }

      return tx.transferenciaAlmacen.update({
        where: { id: parseInt(id) },
        data: { estado: 'recibida', fechaRecepcion: new Date() },
        include: includeAll,
      });
    });
    return toDto(row);
  },

  /** Anula la transferencia. Si ya estaba enviada, devuelve el stock al origen. */
  async anular(id: string, usuarioId: number): Promise<Transferencia> {
    const row = await db.$transaction(async tx => {
      const transf = await tx.transferenciaAlmacen.findUniqueOrThrow({
        where: { id: parseInt(id) },
        include: includeAll,
      });

      if (transf.estado === 'pendiente') {
        // Liberar las reservas tomadas al crear
        for (const item of transf.lista) {
          await liberarReserva(tx, item.productoId, transf.almacenOrigenId, item.cantidad);
        }
      }

      if (transf.estado === 'enviada') {
        for (const item of transf.lista) {
          await aplicarMovimientoStock(tx, {
            productoId: item.productoId,
            almacenId: transf.almacenOrigenId,
            cantidad: item.cantidad,
            tipo: 'entrada_transferencia',
            costoUnitario: await costoPromedioDe(tx, item.productoId),
            referenciaId: transf.id,
            referenciaTipo: 'Transferencia',
            observacion: `Transferencia ${transf.numero} (anulación — retorno al origen)`,
            usuarioId,
          });
        }
      }

      return tx.transferenciaAlmacen.update({
        where: { id: parseInt(id) },
        data: { estado: 'anulada' },
        include: includeAll,
      });
    });
    return toDto(row);
  },
};

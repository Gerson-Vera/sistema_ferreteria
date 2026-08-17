import db from '@/lib/db';
import { AppError } from '@/lib/errors/AppError';
import { aplicarMovimientoStock, costoPromedioDe } from '@/lib/inventario/stock';
import { aUnidadesBase, costoUnitarioBase } from '@/lib/inventario/unidades';
import type { Devolucion, DevolucionItem, EstadoDevolucion, CreateDevolucionDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryDevolucionInput } from '../schemas';

type ItemRow = {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario?: unknown;
  costoUnitario?: unknown;
  subtotal: unknown;
  producto: { descripcion: string };
};

type VentaDevRow = {
  id: number;
  numero: string;
  ventaId: number;
  almacenId: number;
  usuarioId: number;
  motivo: string;
  estado: string;
  observaciones: string | null;
  total: unknown;
  creadoEn: Date;
  actualizadoEn: Date;
  venta: { numero: string; cliente: { descripcion: string } };
  almacen: { nombre: string };
  usuario: { nombre: string };
  lista: ItemRow[];
};

type CompraDevRow = {
  id: number;
  numero: string;
  compraId: number;
  almacenId: number;
  usuarioId: number;
  motivo: string;
  estado: string;
  observaciones: string | null;
  total: unknown;
  creadoEn: Date;
  actualizadoEn: Date;
  compra: { numero: string; proveedor: { descripcion: string } };
  almacen: { nombre: string };
  usuario: { nombre: string };
  lista: ItemRow[];
};

function itemToDto(row: ItemRow): DevolucionItem {
  return {
    id: String(row.id),
    productoId: String(row.productoId),
    productoNombre: row.producto.descripcion,
    cantidad: row.cantidad,
    precioUnitario: Number(row.precioUnitario ?? row.costoUnitario ?? 0),
    subtotal: Number(row.subtotal),
  };
}

function ventaToDto(row: VentaDevRow): Devolucion {
  return {
    id: String(row.id),
    numero: row.numero,
    tipo: 'venta',
    referenciaId: String(row.ventaId),
    referenciaNumero: row.venta.numero,
    contraparteNombre: row.venta.cliente.descripcion,
    almacenId: String(row.almacenId),
    almacenNombre: row.almacen.nombre,
    usuarioId: String(row.usuarioId),
    usuarioNombre: row.usuario.nombre,
    motivo: row.motivo,
    estado: row.estado as EstadoDevolucion,
    observaciones: row.observaciones,
    total: Number(row.total),
    items: row.lista.map(itemToDto),
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

function compraToDto(row: CompraDevRow): Devolucion {
  return {
    id: String(row.id),
    numero: row.numero,
    tipo: 'compra',
    referenciaId: String(row.compraId),
    referenciaNumero: row.compra.numero,
    contraparteNombre: row.compra.proveedor.descripcion,
    almacenId: String(row.almacenId),
    almacenNombre: row.almacen.nombre,
    usuarioId: String(row.usuarioId),
    usuarioNombre: row.usuario.nombre,
    motivo: row.motivo,
    estado: row.estado as EstadoDevolucion,
    observaciones: row.observaciones,
    total: Number(row.total),
    items: row.lista.map(itemToDto),
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

const includeVenta = {
  venta: { select: { numero: true, cliente: { select: { descripcion: true } } } },
  almacen: { select: { nombre: true } },
  usuario: { select: { nombre: true } },
  lista: { include: { producto: { select: { descripcion: true } } } },
};

const includeCompra = {
  compra: { select: { numero: true, proveedor: { select: { descripcion: true } } } },
  almacen: { select: { nombre: true } },
  usuario: { select: { nombre: true } },
  lista: { include: { producto: { select: { descripcion: true } } } },
};

export const devolucionesRepository = {
  async findMany(params: QueryDevolucionInput): Promise<PaginatedResponse<Devolucion>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.estado) where.estado = params.estado;

    if (params.tipo === 'venta') {
      const [rows, total] = await Promise.all([
        db.devolucionVenta.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: includeVenta }),
        db.devolucionVenta.count({ where }),
      ]);
      return { data: rows.map(ventaToDto), total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    const [rows, total] = await Promise.all([
      db.devolucionCompra.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: includeCompra }),
      db.devolucionCompra.count({ where }),
    ]);
    return { data: rows.map(compraToDto), total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string, tipo: 'venta' | 'compra'): Promise<Devolucion | null> {
    if (tipo === 'venta') {
      const row = await db.devolucionVenta.findUnique({ where: { id: parseInt(id) }, include: includeVenta });
      return row ? ventaToDto(row) : null;
    }
    const row = await db.devolucionCompra.findUnique({ where: { id: parseInt(id) }, include: includeCompra });
    return row ? compraToDto(row) : null;
  },

  /** Devolución de cliente: reingresa mercadería vendida al almacén indicado. */
  async createVenta(data: CreateDevolucionDto, numero: string, usuarioId: number): Promise<Devolucion> {
    const ventaId = parseInt(data.referenciaId);
    const almacenId = parseInt(data.almacenId);

    const row = await db.$transaction(async tx => {
      const venta = await tx.venta.findUnique({ where: { id: ventaId }, include: { lista: true } });
      if (!venta) throw AppError.notFound('Venta');
      if (venta.estado === 'anulada') throw AppError.badRequest('No se puede devolver una venta anulada');

      // Cantidades ya devueltas en devoluciones registradas de esta venta
      const previas = await tx.devolucionVentaItem.groupBy({
        by: ['productoId'],
        where: { devolucion: { ventaId, estado: 'registrada' } },
        _sum: { cantidad: true },
      });
      const devueltoMap = new Map(previas.map(p => [p.productoId, p._sum.cantidad ?? 0]));

      const items = data.items.map(i => {
        const pid = parseInt(i.productoId);
        const ventaItem = venta.lista.find(vi => vi.productoId === pid);
        if (!ventaItem) throw AppError.badRequest(`El producto ${i.productoId} no pertenece a la venta ${venta.numero}`);
        const disponible = ventaItem.cantidad - (devueltoMap.get(pid) ?? 0);
        if (i.cantidad > disponible) {
          throw AppError.badRequest(`Cantidad a devolver (${i.cantidad}) excede lo disponible (${disponible}) para el producto de la venta ${venta.numero}`);
        }
        const precio = Number(ventaItem.precioUnitario);
        const factor = Number(ventaItem.factorUnidad) || 1;
        return { productoId: pid, cantidad: i.cantidad, factor, precioUnitario: precio, subtotal: Math.round(i.cantidad * precio * 100) / 100 };
      });

      const total = Math.round(items.reduce((s, i) => s + i.subtotal, 0) * 100) / 100;

      const devolucion = await tx.devolucionVenta.create({
        data: {
          numero,
          ventaId,
          almacenId,
          usuarioId,
          motivo: data.motivo,
          observaciones: data.observaciones ?? null,
          total,
          lista: { create: items.map(({ factor: _f, ...item }) => item) },
        },
        include: includeVenta,
      });

      for (const item of items) {
        await aplicarMovimientoStock(tx, {
          productoId: item.productoId,
          almacenId,
          cantidad: aUnidadesBase(item.cantidad, item.factor),
          tipo: 'entrada_devolucion_venta',
          costoUnitario: await costoPromedioDe(tx, item.productoId),
          referenciaId: devolucion.id,
          referenciaTipo: 'DevolucionVenta',
          observacion: `Devolución ${numero} (venta ${venta.numero})`,
          usuarioId,
        });
      }

      return devolucion;
    });
    return ventaToDto(row);
  },

  /** Devolución a proveedor: retira del almacén mercadería comprada. */
  async createCompra(data: CreateDevolucionDto, numero: string, usuarioId: number): Promise<Devolucion> {
    const compraId = parseInt(data.referenciaId);
    const almacenId = parseInt(data.almacenId);

    const row = await db.$transaction(async tx => {
      const compra = await tx.compra.findUnique({ where: { id: compraId }, include: { lista: true } });
      if (!compra) throw AppError.notFound('Compra');
      if (compra.estado !== 'recibida' && compra.estado !== 'parcial') {
        throw AppError.badRequest('Solo se puede devolver mercadería de compras recibidas (total o parcialmente)');
      }

      const previas = await tx.devolucionCompraItem.groupBy({
        by: ['productoId'],
        where: { devolucion: { compraId, estado: 'registrada' } },
        _sum: { cantidad: true },
      });
      const devueltoMap = new Map(previas.map(p => [p.productoId, p._sum.cantidad ?? 0]));

      const items = data.items.map(i => {
        const pid = parseInt(i.productoId);
        const compraItem = compra.lista.find(ci => ci.productoId === pid);
        if (!compraItem) throw AppError.badRequest(`El producto ${i.productoId} no pertenece a la compra ${compra.numero}`);
        // Solo puede devolverse lo efectivamente recibido (recepción parcial)
        const disponible = compraItem.cantidadRecibida - (devueltoMap.get(pid) ?? 0);
        if (i.cantidad > disponible) {
          throw AppError.badRequest(`Cantidad a devolver (${i.cantidad}) excede lo recibido disponible (${disponible}) para el producto de la compra ${compra.numero}`);
        }
        const costo = Number(compraItem.costoUnitario);
        const factor = Number(compraItem.factorUnidad) || 1;
        return { productoId: pid, cantidad: i.cantidad, factor, costoUnitario: costo, subtotal: Math.round(i.cantidad * costo * 100) / 100 };
      });

      const total = Math.round(items.reduce((s, i) => s + i.subtotal, 0) * 100) / 100;

      const devolucion = await tx.devolucionCompra.create({
        data: {
          numero,
          compraId,
          almacenId,
          usuarioId,
          motivo: data.motivo,
          observaciones: data.observaciones ?? null,
          total,
          lista: { create: items.map(({ factor: _f, ...item }) => item) },
        },
        include: includeCompra,
      });

      for (const item of items) {
        await aplicarMovimientoStock(tx, {
          productoId: item.productoId,
          almacenId,
          cantidad: aUnidadesBase(item.cantidad, item.factor),
          tipo: 'salida_devolucion_compra',
          costoUnitario: costoUnitarioBase(item.costoUnitario, item.factor),
          referenciaId: devolucion.id,
          referenciaTipo: 'DevolucionCompra',
          observacion: `Devolución ${numero} (compra ${compra.numero})`,
          usuarioId,
        });
      }

      return devolucion;
    });
    return compraToDto(row);
  },

  /** Anula la devolución y revierte el movimiento de stock. */
  async anular(id: string, tipo: 'venta' | 'compra', usuarioId: number): Promise<Devolucion> {
    if (tipo === 'venta') {
      const row = await db.$transaction(async tx => {
        const dev = await tx.devolucionVenta.findUniqueOrThrow({ where: { id: parseInt(id) }, include: includeVenta });
        const ventaItems = await tx.ventaItem.findMany({
          where: { ventaId: dev.ventaId },
          select: { productoId: true, factorUnidad: true },
        });
        const factorMap = new Map(ventaItems.map(v => [v.productoId, Number(v.factorUnidad) || 1]));
        for (const item of dev.lista) {
          await aplicarMovimientoStock(tx, {
            productoId: item.productoId,
            almacenId: dev.almacenId,
            cantidad: aUnidadesBase(item.cantidad, factorMap.get(item.productoId) ?? 1),
            tipo: 'salida_manual',
            costoUnitario: await costoPromedioDe(tx, item.productoId),
            referenciaId: dev.id,
            referenciaTipo: 'DevolucionVenta',
            observacion: `Anulación devolución ${dev.numero}`,
            usuarioId,
          });
        }
        return tx.devolucionVenta.update({ where: { id: parseInt(id) }, data: { estado: 'anulada' }, include: includeVenta });
      });
      return ventaToDto(row);
    }

    const row = await db.$transaction(async tx => {
      const dev = await tx.devolucionCompra.findUniqueOrThrow({ where: { id: parseInt(id) }, include: includeCompra });
      const compraItems = await tx.compraItem.findMany({
        where: { compraId: dev.compraId },
        select: { productoId: true, factorUnidad: true },
      });
      const factorMap = new Map(compraItems.map(c => [c.productoId, Number(c.factorUnidad) || 1]));
      for (const item of dev.lista) {
        const factor = factorMap.get(item.productoId) ?? 1;
        await aplicarMovimientoStock(tx, {
          productoId: item.productoId,
          almacenId: dev.almacenId,
          cantidad: aUnidadesBase(item.cantidad, factor),
          tipo: 'entrada_manual',
          costoUnitario: costoUnitarioBase(Number(item.costoUnitario), factor),
          referenciaId: dev.id,
          referenciaTipo: 'DevolucionCompra',
          observacion: `Anulación devolución ${dev.numero}`,
          usuarioId,
        });
      }
      return tx.devolucionCompra.update({ where: { id: parseInt(id) }, data: { estado: 'anulada' }, include: includeCompra });
    });
    return compraToDto(row);
  },
};

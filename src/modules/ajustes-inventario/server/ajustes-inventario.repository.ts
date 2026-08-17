import db from '@/lib/db';
import { aplicarMovimientoStock, resolverAlmacenId, stockEnAlmacen, costoPromedioDe } from '@/lib/inventario/stock';
import type { AjusteInventario, AjusteInventarioItem, EstadoAjuste, CreateAjusteInventarioDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryAjusteInput } from '../schemas';

type AjusteItemRow = {
  id: number;
  ajusteId: number;
  productoId: number;
  stockSistema: number;
  stockFisico: number;
  diferencia: number;
};

type AjusteRow = {
  id: number;
  numero: string;
  motivo: string;
  usuarioId: number;
  almacenId: number | null;
  almacen: { nombre: string } | null;
  estado: string;
  observaciones: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  lista: AjusteItemRow[];
};

function itemToDto(row: AjusteItemRow): AjusteInventarioItem {
  return {
    id: String(row.id),
    ajusteId: String(row.ajusteId),
    productoId: String(row.productoId),
    stockSistema: row.stockSistema,
    stockFisico: row.stockFisico,
    diferencia: row.diferencia,
  };
}

function toDto(row: AjusteRow): AjusteInventario {
  return {
    id: String(row.id),
    numero: row.numero,
    motivo: row.motivo,
    usuarioId: String(row.usuarioId),
    almacenId: row.almacenId !== null ? String(row.almacenId) : null,
    almacenNombre: row.almacen?.nombre ?? null,
    estado: row.estado as EstadoAjuste,
    observaciones: row.observaciones,
    items: row.lista.map(itemToDto),
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

const includeItems = { lista: true, almacen: { select: { nombre: true } } };

export const ajustesInventarioRepository = {
  async findMany(params: QueryAjusteInput): Promise<PaginatedResponse<AjusteInventario>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.estado) where.estado = params.estado;

    const [rows, total] = await Promise.all([
      db.ajusteInventario.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: includeItems }),
      db.ajusteInventario.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<AjusteInventario | null> {
    const row = await db.ajusteInventario.findUnique({ where: { id: parseInt(id) }, include: includeItems });
    return row ? toDto(row) : null;
  },

  async create(data: CreateAjusteInventarioDto, numero: string, usuarioId: number): Promise<AjusteInventario> {
    const almacenId = parseInt(data.almacenId);

    const row = await db.$transaction(async tx => {
      const stocks = await tx.stockAlmacen.findMany({
        where: {
          almacenId,
          productoId: { in: data.items.map(i => parseInt(i.productoId)) },
        },
        select: { productoId: true, stock: true },
      });

      const stockMap = new Map(stocks.map(s => [s.productoId, s.stock]));

      return tx.ajusteInventario.create({
        data: {
          numero,
          motivo: data.motivo,
          usuarioId,
          almacenId,
          observaciones: data.observaciones ?? null,
          lista: {
            create: data.items.map(i => {
              const pid = parseInt(i.productoId);
              const stockSistema = stockMap.get(pid) ?? 0;
              return {
                productoId: pid,
                stockSistema,
                stockFisico: i.stockFisico,
                diferencia: i.stockFisico - stockSistema,
              };
            }),
          },
        },
        include: includeItems,
      });
    });
    return toDto(row);
  },

  async aplicar(id: string): Promise<AjusteInventario> {
    const row = await db.$transaction(async tx => {
      const ajuste = await tx.ajusteInventario.findUnique({ where: { id: parseInt(id) }, include: includeItems });
      if (!ajuste) throw new Error('Ajuste no encontrado');

      // Ajustes antiguos sin almacén: aplicar sobre el primer almacén activo
      const almacenId = await resolverAlmacenId(tx, ajuste.almacenId);

      for (const item of ajuste.lista) {
        // Diferencia contra el stock actual del almacén (puede haber cambiado desde el borrador)
        const stockActual = await stockEnAlmacen(tx, item.productoId, almacenId);
        const delta = item.stockFisico - stockActual;
        if (delta === 0) continue;

        await aplicarMovimientoStock(tx, {
          productoId: item.productoId,
          almacenId,
          cantidad: Math.abs(delta),
          tipo: delta > 0 ? 'entrada_ajuste' : 'salida_ajuste',
          costoUnitario: await costoPromedioDe(tx, item.productoId),
          referenciaId: ajuste.id,
          referenciaTipo: 'AjusteInventario',
          observacion: `Ajuste ${ajuste.numero}: ${ajuste.motivo}`,
          usuarioId: ajuste.usuarioId,
        });
      }

      return tx.ajusteInventario.update({
        where: { id: parseInt(id) },
        data: { estado: 'aplicado' },
        include: includeItems,
      });
    });
    return toDto(row);
  },

  async anular(id: string): Promise<AjusteInventario> {
    const row = await db.ajusteInventario.update({
      where: { id: parseInt(id) },
      data: { estado: 'anulado' },
      include: includeItems,
    });
    return toDto(row);
  },
};

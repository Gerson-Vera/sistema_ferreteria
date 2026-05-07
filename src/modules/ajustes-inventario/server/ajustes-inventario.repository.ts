import db from '@/lib/db';
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
    estado: row.estado as EstadoAjuste,
    observaciones: row.observaciones,
    items: row.lista.map(itemToDto),
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

const includeItems = { lista: true };

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
    const row = await db.$transaction(async tx => {
      const productos = await tx.producto.findMany({
        where: { id: { in: data.items.map(i => parseInt(i.productoId)) } },
        select: { id: true, stock: true },
      });

      const stockMap = new Map(productos.map(p => [p.id, p.stock]));

      return tx.ajusteInventario.create({
        data: {
          numero,
          motivo: data.motivo,
          usuarioId,
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

      for (const item of ajuste.lista) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: item.stockFisico },
        });
        const tipoMov = item.diferencia >= 0 ? 'entrada_ajuste' : 'salida_ajuste';
        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            tipo: tipoMov,
            cantidad: Math.abs(item.diferencia),
            stockAnterior: item.stockSistema,
            stockNuevo: item.stockFisico,
            referenciaId: ajuste.id,
            referenciaTipo: 'AjusteInventario',
            observacion: `Ajuste ${ajuste.numero}: ${ajuste.motivo}`,
            usuarioId: ajuste.usuarioId,
          },
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

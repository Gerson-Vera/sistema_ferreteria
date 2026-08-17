import db from '@/lib/db';
import { AppError } from '@/lib/errors/AppError';
import { aplicarMovimientoStock, costoPromedioDe } from '@/lib/inventario/stock';
import type { Conteo, ConteoItem, EstadoConteo, CreateConteoDto, RegistrarConteoItemDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryConteoInput } from '../schemas';

type ConteoItemRow = {
  id: number;
  conteoId: number;
  productoId: number;
  stockSistema: number;
  stockFisico: number | null;
  producto: { descripcion: string; codigo: string };
};

type ConteoRow = {
  id: number;
  numero: string;
  almacenId: number;
  usuarioId: number;
  estado: string;
  observaciones: string | null;
  fechaAplicacion: Date | null;
  creadoEn: Date;
  actualizadoEn: Date;
  almacen: { nombre: string };
  usuario: { nombre: string };
  lista: ConteoItemRow[];
};

function itemToDto(row: ConteoItemRow): ConteoItem {
  return {
    id: String(row.id),
    conteoId: String(row.conteoId),
    productoId: String(row.productoId),
    productoNombre: row.producto.descripcion,
    productoSku: row.producto.codigo,
    stockSistema: row.stockSistema,
    stockFisico: row.stockFisico,
    diferencia: row.stockFisico !== null ? row.stockFisico - row.stockSistema : null,
  };
}

function toDto(row: ConteoRow): Conteo {
  const items = row.lista.map(itemToDto);
  return {
    id: String(row.id),
    numero: row.numero,
    almacenId: String(row.almacenId),
    almacenNombre: row.almacen.nombre,
    usuarioId: String(row.usuarioId),
    usuarioNombre: row.usuario.nombre,
    estado: row.estado as EstadoConteo,
    observaciones: row.observaciones,
    fechaAplicacion: row.fechaAplicacion,
    items,
    contados: items.filter(i => i.stockFisico !== null).length,
    totalItems: items.length,
    conDiferencia: items.filter(i => i.diferencia !== null && i.diferencia !== 0).length,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

const includeAll = {
  almacen: { select: { nombre: true } },
  usuario: { select: { nombre: true } },
  lista: {
    include: { producto: { select: { descripcion: true, codigo: true } } },
    orderBy: { producto: { descripcion: 'asc' as const } },
  },
};

export const conteosInventarioRepository = {
  async findMany(params: QueryConteoInput): Promise<PaginatedResponse<Conteo>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.estado) where.estado = params.estado;
    if (params.almacenId) where.almacenId = parseInt(params.almacenId);

    const [rows, total] = await Promise.all([
      db.conteoInventario.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: includeAll }),
      db.conteoInventario.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<Conteo | null> {
    const row = await db.conteoInventario.findUnique({ where: { id: parseInt(id) }, include: includeAll });
    return row ? toDto(row) : null;
  },

  /** Genera la planilla: captura el stock del sistema por producto en el almacén. */
  async create(data: CreateConteoDto, numero: string, usuarioId: number): Promise<Conteo> {
    const almacenId = parseInt(data.almacenId);

    const row = await db.$transaction(async tx => {
      const stocks = await tx.stockAlmacen.findMany({
        where: {
          almacenId,
          producto: {
            estado: true,
            ...(data.categoriaId ? { categoriaId: parseInt(data.categoriaId) } : {}),
          },
        },
        select: { productoId: true, stock: true },
      });
      if (stocks.length === 0) {
        throw AppError.badRequest('No hay productos activos para contar en ese almacén/categoría');
      }

      return tx.conteoInventario.create({
        data: {
          numero,
          almacenId,
          usuarioId,
          observaciones: data.observaciones ?? null,
          lista: {
            create: stocks.map(s => ({ productoId: s.productoId, stockSistema: s.stock })),
          },
        },
        include: includeAll,
      });
    });
    return toDto(row);
  },

  /** Guarda los conteos físicos registrados (puede llamarse varias veces mientras esté abierto). */
  async registrar(id: string, items: RegistrarConteoItemDto[]): Promise<Conteo> {
    const row = await db.$transaction(async tx => {
      const conteo = await tx.conteoInventario.findUniqueOrThrow({
        where: { id: parseInt(id) },
        select: { id: true, lista: { select: { id: true } } },
      });
      const idsValidos = new Set(conteo.lista.map(i => i.id));

      for (const i of items) {
        const itemId = parseInt(i.itemId);
        if (!idsValidos.has(itemId)) throw AppError.badRequest(`El ítem ${i.itemId} no pertenece a este conteo`);
        await tx.conteoInventarioItem.update({
          where: { id: itemId },
          data: { stockFisico: i.stockFisico },
        });
      }

      return tx.conteoInventario.findUniqueOrThrow({ where: { id: parseInt(id) }, include: includeAll });
    });
    return toDto(row);
  },

  /**
   * Aplica las diferencias al stock: ajusta cada producto contado para que el
   * stock del almacén quede igual a lo contado físicamente. Los ítems sin
   * contar no se tocan.
   */
  async aplicar(id: string, usuarioId: number): Promise<Conteo> {
    const row = await db.$transaction(async tx => {
      const conteo = await tx.conteoInventario.findUniqueOrThrow({
        where: { id: parseInt(id) },
        include: includeAll,
      });

      for (const item of conteo.lista) {
        if (item.stockFisico === null) continue;

        // Ajustar contra el stock ACTUAL del almacén (pudo moverse desde que se
        // generó la planilla); el conteo físico es la verdad final.
        const fila = await tx.stockAlmacen.findUnique({
          where: { productoId_almacenId: { productoId: item.productoId, almacenId: conteo.almacenId } },
          select: { stock: true },
        });
        const stockActual = fila?.stock ?? 0;
        const diferencia = item.stockFisico - stockActual;
        if (diferencia === 0) continue;

        await aplicarMovimientoStock(tx, {
          productoId: item.productoId,
          almacenId: conteo.almacenId,
          cantidad: Math.abs(diferencia),
          tipo: diferencia > 0 ? 'entrada_ajuste' : 'salida_ajuste',
          costoUnitario: await costoPromedioDe(tx, item.productoId),
          referenciaId: conteo.id,
          referenciaTipo: 'ConteoInventario',
          observacion: `Conteo físico ${conteo.numero}`,
          usuarioId,
          // El conteo físico manda: puede invadir stock reservado
          permitirNegativo: true,
        });
      }

      return tx.conteoInventario.update({
        where: { id: parseInt(id) },
        data: { estado: 'aplicado', fechaAplicacion: new Date() },
        include: includeAll,
      });
    });
    return toDto(row);
  },

  async anular(id: string): Promise<Conteo> {
    const row = await db.conteoInventario.update({
      where: { id: parseInt(id) },
      data: { estado: 'anulado' },
      include: includeAll,
    });
    return toDto(row);
  },
};

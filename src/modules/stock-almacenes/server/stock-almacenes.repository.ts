import db from '@/lib/db';
import type { StockAlmacen } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryStockAlmacenInput } from '../schemas';

type StockAlmacenRow = {
  id: number;
  productoId: number;
  almacenId: number;
  stock: number;
  stockReservado: number;
  actualizadoEn: Date;
  producto: { descripcion: string; codigo: string; stockMinimo: number; costoPromedio: unknown };
  almacen: { nombre: string };
};

function toDto(row: StockAlmacenRow): StockAlmacen {
  const costoPromedio = Number(row.producto.costoPromedio);
  return {
    id: String(row.id),
    productoId: String(row.productoId),
    productoNombre: row.producto.descripcion,
    productoSku: row.producto.codigo,
    stockMinimo: row.producto.stockMinimo,
    costoPromedio,
    almacenId: String(row.almacenId),
    almacenNombre: row.almacen.nombre,
    stock: row.stock,
    stockReservado: row.stockReservado,
    disponible: row.stock - row.stockReservado,
    valor: Math.round(row.stock * costoPromedio * 100) / 100,
    actualizadoEn: row.actualizadoEn,
  };
}

const include = {
  producto: { select: { descripcion: true, codigo: true, stockMinimo: true, costoPromedio: true } },
  almacen: { select: { nombre: true } },
};

export const stockAlmacenesRepository = {
  async findMany(params: QueryStockAlmacenInput): Promise<PaginatedResponse<StockAlmacen>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.almacenId) where.almacenId = parseInt(params.almacenId);
    if (params.productoId) where.productoId = parseInt(params.productoId);
    if (params.search) {
      where.producto = {
        OR: [
          { descripcion: { contains: params.search, mode: 'insensitive' } },
          { codigo: { contains: params.search, mode: 'insensitive' } },
          { codigoBarras: { contains: params.search, mode: 'insensitive' } },
        ],
      };
    }

    const [rows, total] = await Promise.all([
      db.stockAlmacen.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ producto: { descripcion: 'asc' } }, { almacenId: 'asc' }],
        include,
      }),
      db.stockAlmacen.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};

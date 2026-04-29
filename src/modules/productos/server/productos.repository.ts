import { randomUUID } from 'crypto';
import db from '@/lib/db';
import type { Producto, CreateProductoDto, UpdateProductoDto } from '../types';
import type { PaginatedResponse, QueryParams } from '@/shared/types';

type DecimalLike = { toString(): string };

type ProductoRow = {
  id: number;
  codigo: string;
  descripcion: string;
  detalle: string | null;
  precioCompra: DecimalLike;
  precioVenta: DecimalLike;
  stock: number;
  stockMinimo: number;
  categoriaId: number;
  proveedorId: number | null;
  estado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

function toDto(row: ProductoRow): Producto {
  return {
    id: String(row.id),
    sku: row.codigo,
    nombre: row.descripcion,
    descripcion: row.detalle,
    precioCompra: Number(row.precioCompra),
    precioVenta: Number(row.precioVenta),
    stock: row.stock,
    stockMinimo: row.stockMinimo,
    categoriaId: String(row.categoriaId),
    proveedorId: row.proveedorId ? String(row.proveedorId) : null,
    activo: row.estado,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

function buildOrderBy(orderBy?: string, order?: string): Record<string, string> {
  const dir = order === 'desc' ? 'desc' : 'asc';
  switch (orderBy) {
    case 'sku':         return { codigo: dir };
    case 'stock':       return { stock: dir };
    case 'precioVenta': return { precioVenta: dir };
    case 'creadoEn':    return { creadoEn: dir };
    default:            return { descripcion: dir };
  }
}

export const productosRepository = {
  async findMany(
    params: QueryParams & { categoriaId?: string; activo?: boolean }
  ): Promise<PaginatedResponse<Producto>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: {
      OR?: { descripcion?: object; codigo?: object }[];
      categoriaId?: number;
      estado?: boolean;
    } = {};

    if (params.search) {
      where.OR = [
        { descripcion: { contains: params.search, mode: 'insensitive' } },
        { codigo: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.categoriaId) {
      where.categoriaId = parseInt(params.categoriaId);
    }
    if (params.activo !== undefined) {
      where.estado = params.activo;
    }

    const orderBy = buildOrderBy(params.orderBy, params.order);

    const [rows, total] = await Promise.all([
      db.producto.findMany({ where, skip, take: limit, orderBy }),
      db.producto.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<Producto | null> {
    const row = await db.producto.findUnique({ where: { id: parseInt(id) } });
    return row ? toDto(row) : null;
  },

  async findBySku(sku: string): Promise<Producto | null> {
    const row = await db.producto.findFirst({
      where: { codigo: { equals: sku, mode: 'insensitive' } },
    });
    return row ? toDto(row) : null;
  },

  async create(data: CreateProductoDto): Promise<Producto> {
    const row = await db.producto.create({
      data: {
        codigo: randomUUID(),
        descripcion: data.nombre,
        detalle: data.descripcion ?? null,
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,
        stock: data.stock,
        stockMinimo: data.stockMinimo,
        categoria: { connect: { id: parseInt(data.categoriaId) } },
        ...(data.proveedorId
          ? { proveedor: { connect: { id: parseInt(data.proveedorId) } } }
          : {}),
      },
    });
    return toDto(row);
  },

  async update(id: string, data: UpdateProductoDto): Promise<Producto> {
    const row = await db.producto.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre !== undefined && { descripcion: data.nombre }),
        ...(data.descripcion !== undefined && { detalle: data.descripcion || null }),
        ...(data.precioCompra !== undefined && { precioCompra: data.precioCompra }),
        ...(data.precioVenta !== undefined && { precioVenta: data.precioVenta }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.stockMinimo !== undefined && { stockMinimo: data.stockMinimo }),
        ...(data.categoriaId !== undefined && {
          categoria: { connect: { id: parseInt(data.categoriaId) } },
        }),
        ...(data.proveedorId !== undefined && (
          data.proveedorId
            ? { proveedor: { connect: { id: parseInt(data.proveedorId) } } }
            : { proveedor: { disconnect: true } }
        )),
      },
    });
    return toDto(row);
  },

  async updateStock(id: string, cantidad: number): Promise<Producto> {
    const row = await db.producto.update({
      where: { id: parseInt(id) },
      data: { stock: { increment: cantidad } },
    });
    return toDto(row);
  },

  async delete(id: string): Promise<void> {
    await db.producto.update({
      where: { id: parseInt(id) },
      data: { estado: false },
    });
  },

  async countLowStock(): Promise<number> {
    const items = await db.producto.findMany({
      where: { estado: true },
      select: { stock: true, stockMinimo: true },
    });
    return items.filter(p => p.stock <= p.stockMinimo).length;
  },
};

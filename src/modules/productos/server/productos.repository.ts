import { randomUUID } from 'crypto';
import db from '@/lib/db';
import type { Producto, CreateProductoDto, UpdateProductoDto } from '../types';
import type { PaginatedResponse, QueryParams } from '@/shared/types';

type DecimalLike = { toString(): string };

type ProductoRow = {
  id: number;
  codigo: string;
  codigoBarras: string | null;
  descripcion: string;
  detalle: string | null;
  img: string | null;
  precioCompra: DecimalLike;
  precioVenta: DecimalLike;
  stock: number;
  stockMinimo: number;
  ubicacion: string | null;
  categoriaId: number;
  marcaId: number | null;
  unidadMedidaId: number | null;
  proveedorId: number | null;
  almacenId: number | null;
  estado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

function toDto(row: ProductoRow): Producto {
  return {
    id: String(row.id),
    sku: row.codigo,
    codigoBarras: row.codigoBarras,
    nombre: row.descripcion,
    descripcion: row.detalle,
    img: row.img,
    precioCompra: Number(row.precioCompra),
    precioVenta: Number(row.precioVenta),
    stock: row.stock,
    stockMinimo: row.stockMinimo,
    ubicacion: row.ubicacion,
    categoriaId: String(row.categoriaId),
    marcaId: row.marcaId ? String(row.marcaId) : null,
    unidadMedidaId: row.unidadMedidaId ? String(row.unidadMedidaId) : null,
    proveedorId: row.proveedorId ? String(row.proveedorId) : null,
    almacenId: row.almacenId ? String(row.almacenId) : null,
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

/** Generates an EAN-13 barcode with prefix 789 (internal/Peru). */
function generateEan13(): string {
  const prefix = '789';
  const middle = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, '0');
  const raw = prefix + middle;
  const checksum = raw
    .split('')
    .reduce((sum, d, i) => sum + parseInt(d) * (i % 2 === 0 ? 1 : 3), 0);
  return raw + String((10 - (checksum % 10)) % 10);
}

/** Ensures uniqueness of the generated barcode. */
async function uniqueEan13(): Promise<string> {
  let barcode = generateEan13();
  let attempts = 0;
  while (attempts < 10) {
    const exists = await db.producto.findUnique({ where: { codigoBarras: barcode } });
    if (!exists) return barcode;
    barcode = generateEan13();
    attempts++;
  }
  return barcode;
}

export const productosRepository = {
  async findMany(
    params: QueryParams & { categoriaId?: string; almacenId?: string; codigoBarras?: string; activo?: boolean }
  ): Promise<PaginatedResponse<Producto>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: {
      OR?: { descripcion?: object; codigo?: object; codigoBarras?: object }[];
      categoriaId?: number;
      almacenId?: number;
      codigoBarras?: object;
      estado?: boolean;
    } = {};

    if (params.search) {
      where.OR = [
        { descripcion: { contains: params.search, mode: 'insensitive' } },
        { codigo:      { contains: params.search, mode: 'insensitive' } },
        { codigoBarras:{ contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.categoriaId) {
      where.categoriaId = parseInt(params.categoriaId);
    }
    if (params.almacenId) {
      where.almacenId = parseInt(params.almacenId);
    }
    if (params.codigoBarras) {
      where.codigoBarras = { equals: params.codigoBarras };
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

  async findByCodigoBarras(codigoBarras: string): Promise<Producto | null> {
    const row = await db.producto.findUnique({ where: { codigoBarras } });
    return row ? toDto(row) : null;
  },

  async create(data: CreateProductoDto): Promise<Producto> {
    const codigoBarras = data.codigoBarras?.trim() || await uniqueEan13();

    const row = await db.producto.create({
      data: {
        codigo: randomUUID(),
        codigoBarras,
        descripcion: data.nombre,
        detalle: data.descripcion ?? null,
        img: data.img ?? null,
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,
        stock: data.stock,
        stockMinimo: data.stockMinimo,
        ubicacion: data.ubicacion ?? null,
        categoria: { connect: { id: parseInt(data.categoriaId) } },
        ...(data.marcaId
          ? { marca: { connect: { id: parseInt(data.marcaId) } } }
          : {}),
        ...(data.unidadMedidaId
          ? { unidadMedida: { connect: { id: parseInt(data.unidadMedidaId) } } }
          : {}),
        ...(data.proveedorId
          ? { proveedor: { connect: { id: parseInt(data.proveedorId) } } }
          : {}),
        ...(data.almacenId
          ? { almacen: { connect: { id: parseInt(data.almacenId) } } }
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
        ...(data.codigoBarras !== undefined && { codigoBarras: data.codigoBarras || null }),
        ...(data.img !== undefined && { img: data.img || null }),
        ...(data.precioCompra !== undefined && { precioCompra: data.precioCompra }),
        ...(data.precioVenta !== undefined && { precioVenta: data.precioVenta }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.stockMinimo !== undefined && { stockMinimo: data.stockMinimo }),
        ...(data.ubicacion !== undefined && { ubicacion: data.ubicacion || null }),
        ...(data.categoriaId !== undefined && {
          categoria: { connect: { id: parseInt(data.categoriaId) } },
        }),
        ...(data.marcaId !== undefined && (
          data.marcaId
            ? { marca: { connect: { id: parseInt(data.marcaId) } } }
            : { marca: { disconnect: true } }
        )),
        ...(data.unidadMedidaId !== undefined && (
          data.unidadMedidaId
            ? { unidadMedida: { connect: { id: parseInt(data.unidadMedidaId) } } }
            : { unidadMedida: { disconnect: true } }
        )),
        ...(data.proveedorId !== undefined && (
          data.proveedorId
            ? { proveedor: { connect: { id: parseInt(data.proveedorId) } } }
            : { proveedor: { disconnect: true } }
        )),
        ...(data.almacenId !== undefined && (
          data.almacenId
            ? { almacen: { connect: { id: parseInt(data.almacenId) } } }
            : { almacen: { disconnect: true } }
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

  async findLowStock(): Promise<Producto[]> {
    const items = await db.producto.findMany({
      where: { estado: true },
      orderBy: { descripcion: 'asc' },
    });
    return items
      .filter(p => p.stock <= p.stockMinimo)
      .map(toDto);
  },
};

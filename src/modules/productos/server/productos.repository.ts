import { randomUUID } from 'crypto';
import db from '@/lib/db';
import { resolverAlmacenId } from '@/lib/inventario/stock';
import type { Producto, CreateProductoDto, UpdateProductoDto, ProductoConversion, SetConversionDto } from '../types';
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
  costoPromedio: DecimalLike;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  puntoReorden: number;
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
    costoPromedio: Number(row.costoPromedio),
    stock: row.stock,
    stockMinimo: row.stockMinimo,
    stockMaximo: row.stockMaximo,
    puntoReorden: row.puntoReorden,
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
    params: QueryParams & { categoriaId?: string; almacenId?: string; proveedorId?: string; codigoBarras?: string; activo?: boolean }
  ): Promise<PaginatedResponse<Producto>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: {
      OR?: { descripcion?: object; codigo?: object; codigoBarras?: object }[];
      categoriaId?: number;
      almacenId?: number;
      proveedorId?: number;
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
    if (params.proveedorId) {
      where.proveedorId = parseInt(params.proveedorId);
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
    // Acepta tanto el código de barras/QR como el código interno (SKU)
    const row = await db.producto.findFirst({
      where: { OR: [{ codigoBarras }, { codigo: { equals: codigoBarras, mode: 'insensitive' } }] },
    });
    return row ? toDto(row) : null;
  },

  async create(data: CreateProductoDto): Promise<Producto> {
    const codigoBarras = data.codigoBarras?.trim() || await uniqueEan13();

    const row = await db.$transaction(async tx => {
      const producto = await tx.producto.create({
      data: {
        codigo: randomUUID(),
        codigoBarras,
        descripcion: data.nombre,
        detalle: data.descripcion ?? null,
        img: data.img ?? null,
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,
        costoPromedio: data.precioCompra,
        stock: data.stock,
        stockMinimo: data.stockMinimo,
        stockMaximo: data.stockMaximo ?? 0,
        puntoReorden: data.puntoReorden ?? 0,
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

      // Registrar el stock inicial en el almacén asignado (o el primero activo)
      const almacenId = await resolverAlmacenId(tx, producto.almacenId);
      await tx.stockAlmacen.create({
        data: { productoId: producto.id, almacenId, stock: producto.stock },
      });

      return producto;
    });
    return toDto(row);
  },

  async update(id: string, data: UpdateProductoDto): Promise<Producto> {
    const row = await db.$transaction(async tx => {
      const anterior = await tx.producto.findUniqueOrThrow({
        where: { id: parseInt(id) },
        select: { stock: true, almacenId: true },
      });

      const producto = await tx.producto.update({
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
        ...(data.stockMaximo !== undefined && { stockMaximo: data.stockMaximo }),
        ...(data.puntoReorden !== undefined && { puntoReorden: data.puntoReorden }),
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

      // Si se editó el stock total directamente, reflejar la diferencia
      // en el stock del almacén asignado al producto
      if (data.stock !== undefined && data.stock !== anterior.stock) {
        const delta = data.stock - anterior.stock;
        const almacenId = await resolverAlmacenId(tx, producto.almacenId ?? anterior.almacenId);
        await tx.stockAlmacen.upsert({
          where: { productoId_almacenId: { productoId: producto.id, almacenId } },
          update: { stock: { increment: delta } },
          create: { productoId: producto.id, almacenId, stock: data.stock },
        });
      }

      return producto;
    });
    return toDto(row);
  },

  async getConversiones(id: string): Promise<ProductoConversion[]> {
    const rows = await db.productoUnidadConversion.findMany({
      where: { productoId: parseInt(id), estado: true },
      include: { unidadMedida: { select: { codigo: true, descripcion: true } } },
      orderBy: { factor: 'asc' },
    });
    return rows.map(r => ({
      id: String(r.id),
      unidadMedidaId: String(r.unidadMedidaId),
      unidadCodigo: r.unidadMedida.codigo,
      unidadNombre: r.unidadMedida.descripcion,
      factor: Number(r.factor),
    }));
  },

  async setConversiones(id: string, items: SetConversionDto[]): Promise<ProductoConversion[]> {
    const productoId = parseInt(id);
    await db.$transaction(async tx => {
      await tx.productoUnidadConversion.deleteMany({ where: { productoId } });
      if (items.length > 0) {
        await tx.productoUnidadConversion.createMany({
          data: items.map(i => ({
            productoId,
            unidadMedidaId: parseInt(i.unidadMedidaId),
            factor: i.factor,
          })),
        });
      }
    });
    return this.getConversiones(id);
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

  /** Garantiza que cada producto tenga código de barras, generándolo si falta. */
  async ensureCodigosBarras(ids: string[]): Promise<Producto[]> {
    const numericIds = ids.map(id => parseInt(id));
    const rows = await db.producto.findMany({ where: { id: { in: numericIds } } });
    const result = await Promise.all(rows.map(async row => {
      if (row.codigoBarras) return row;
      const codigoBarras = await uniqueEan13();
      return db.producto.update({ where: { id: row.id }, data: { codigoBarras } });
    }));
    return result.map(toDto);
  },
};

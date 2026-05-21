import { randomUUID } from 'crypto';
import db from '@/lib/db';
import type {
  OrdenCompra, OrdenCompraResumen, OrdenCompraItem,
  CreateOrdenCompraDto, RecibirOrdenResult,
} from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryOrdenInput } from '../schemas';

const IGV = 0.18;

// ─── Prisma include shape ────────────────────────────────────────────────────
const INCLUDE = {
  proveedor: { select: { descripcion: true, email: true } },
  usuario:   { select: { nombre: true } },
  lista: {
    where: { estado: true },
    include: {
      producto:  { select: { descripcion: true } },
      categoria: { select: { descripcion: true, codigo: true } },
    },
    orderBy: { id: 'asc' as const },
  },
} as const;

type OrdenRow = Awaited<ReturnType<typeof db.ordenCompra.findUniqueOrThrow>> & {
  proveedor: { descripcion: string; email: string | null };
  usuario:   { nombre: string };
  lista: Array<{
    id: number;
    ordenCompraId: number;
    productoId: number | null;
    descripcion: string;
    detalles: string | null;
    cantidad: number;
    cantidadRecibida: number;
    costoUnitario: { toString(): string };
    subtotal: { toString(): string };
    esNuevoProducto: boolean;
    precioVentaSugerido: { toString(): string } | null;
    categoriaId: number | null;
    estado: boolean;
    producto:  { descripcion: string } | null;
    categoria: { descripcion: string | null; codigo: string } | null;
  }>;
};

function calcTotals(lista: { cantidad: number; costoUnitario: { toString(): string } }[]) {
  const subtotal = lista.reduce((s, i) => s + i.cantidad * Number(i.costoUnitario), 0);
  const igv = Math.round(subtotal * IGV * 100) / 100;
  const total = Math.round((subtotal + igv) * 100) / 100;
  return { subtotal, igv, total };
}

function itemToDto(i: OrdenRow['lista'][number]): OrdenCompraItem {
  return {
    id: String(i.id),
    ordenCompraId: String(i.ordenCompraId),
    productoId: i.productoId ? String(i.productoId) : null,
    descripcion: i.descripcion,
    detalles: i.detalles,
    cantidad: i.cantidad,
    cantidadRecibida: i.cantidadRecibida,
    costoUnitario: Number(i.costoUnitario),
    subtotal: Number(i.subtotal),
    esNuevoProducto: i.esNuevoProducto,
    precioVentaSugerido: i.precioVentaSugerido ? Number(i.precioVentaSugerido) : null,
    categoriaId: i.categoriaId ? String(i.categoriaId) : null,
    categoriaNombre: i.categoria?.descripcion ?? i.categoria?.codigo ?? null,
    productoNombre: i.producto?.descripcion ?? null,
  };
}

function toOrdenCompra(row: OrdenRow): OrdenCompra {
  const { subtotal, igv, total } = calcTotals(row.lista);
  return {
    id: String(row.id),
    numero: row.numero,
    proveedorId: String(row.proveedorId),
    proveedorNombre: row.proveedor.descripcion,
    proveedorEmail: row.proveedor.email,
    usuarioId: String(row.usuarioId),
    usuarioNombre: row.usuario.nombre,
    estado: row.estado as OrdenCompra['estado'],
    observaciones: row.observaciones,
    correoEnviado: row.correoEnviado,
    fechaEnvio: row.fechaEnvio,
    fechaRecepcion: row.fechaRecepcion,
    items: row.lista.map(itemToDto),
    subtotal,
    igv,
    total,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

function toResumen(row: OrdenRow): OrdenCompraResumen {
  const { subtotal, igv, total } = calcTotals(row.lista);
  return {
    id: String(row.id),
    numero: row.numero,
    proveedorId: String(row.proveedorId),
    proveedorNombre: row.proveedor.descripcion,
    proveedorEmail: row.proveedor.email,
    usuarioId: String(row.usuarioId),
    usuarioNombre: row.usuario.nombre,
    estado: row.estado as OrdenCompra['estado'],
    observaciones: row.observaciones,
    correoEnviado: row.correoEnviado,
    fechaEnvio: row.fechaEnvio,
    fechaRecepcion: row.fechaRecepcion,
    totalItems: row.lista.length,
    subtotal,
    igv,
    total,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

// ─── Repository ──────────────────────────────────────────────────────────────
export const ordenesCompraRepository = {
  async findMany(params: QueryOrdenInput): Promise<PaginatedResponse<OrdenCompraResumen>> {
    const page  = params.page  ?? 1;
    const limit = params.limit ?? 20;
    const skip  = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.estado) where.estado = params.estado;
    if (params.proveedorId) where.proveedorId = parseInt(params.proveedorId);
    if (params.search) {
      where.OR = [
        { numero:    { contains: params.search, mode: 'insensitive' } },
        { proveedor: { descripcion: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [rows, total] = await Promise.all([
      db.ordenCompra.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include: INCLUDE }),
      db.ordenCompra.count({ where }),
    ]);

    return {
      data: (rows as unknown as OrdenRow[]).map(toResumen),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<OrdenCompra | null> {
    const row = await db.ordenCompra.findUnique({ where: { id: parseInt(id) }, include: INCLUDE });
    return row ? toOrdenCompra(row as unknown as OrdenRow) : null;
  },

  async create(data: CreateOrdenCompraDto, numero: string, usuarioId: number): Promise<OrdenCompra> {
    const row = await db.ordenCompra.create({
      data: {
        numero,
        proveedor:    { connect: { id: parseInt(data.proveedorId) } },
        usuario:      { connect: { id: usuarioId } },
        observaciones: data.observaciones ?? null,
        lista: {
          create: data.items.map(item => ({
            descripcion:  item.descripcion,
            detalles:     item.detalles ?? null,
            cantidad:     item.cantidad,
            costoUnitario: item.costoUnitario,
            subtotal:     item.cantidad * item.costoUnitario,
            esNuevoProducto: item.esNuevoProducto,
            precioVentaSugerido: item.precioVentaSugerido ?? null,
            ...(item.productoId  ? { producto:  { connect: { id: parseInt(item.productoId) } } }  : {}),
            ...(item.categoriaId ? { categoria: { connect: { id: parseInt(item.categoriaId) } } } : {}),
          })),
        },
      },
      include: INCLUDE,
    });
    return toOrdenCompra(row as unknown as OrdenRow);
  },

  async marcarEnviada(id: string): Promise<OrdenCompra> {
    const row = await db.ordenCompra.update({
      where: { id: parseInt(id) },
      data: { estado: 'enviada', correoEnviado: true, fechaEnvio: new Date() },
      include: INCLUDE,
    });
    return toOrdenCompra(row as unknown as OrdenRow);
  },

  async anular(id: string): Promise<OrdenCompra> {
    const row = await db.ordenCompra.update({
      where: { id: parseInt(id) },
      data: { estado: 'anulada' },
      include: INCLUDE,
    });
    return toOrdenCompra(row as unknown as OrdenRow);
  },

  async recibir(id: string, usuarioId: number): Promise<RecibirOrdenResult> {
    const orden = await db.ordenCompra.findUnique({
      where: { id: parseInt(id) },
      include: INCLUDE,
    }) as unknown as OrdenRow | null;
    if (!orden) throw new Error('Orden no encontrada');

    const movimientos: RecibirOrdenResult['movimientos'] = [];
    let productosCreados = 0;

    for (const item of orden.lista) {
      let productoId: number;
      const precioCompra = Number(item.costoUnitario);

      if (item.esNuevoProducto || !item.productoId) {
        const catId = item.categoriaId
          ?? (await db.categoria.findFirst({ where: { estado: true } }))!.id;

        const codigoBarras = await generarEan13Unico();
        const precioVenta = item.precioVentaSugerido
          ? Number(item.precioVentaSugerido)
          : Math.round(precioCompra * 1.3 * 100) / 100;

        const nuevo = await db.producto.create({
          data: {
            codigo: randomUUID(),
            codigoBarras,
            descripcion:  item.descripcion,
            detalle:      item.detalles ?? null,
            precioCompra,
            precioVenta,
            stock:        0,
            stockMinimo:  0,
            stockMaximo:  0,
            puntoReorden: 0,
            categoria:  { connect: { id: catId } },
            proveedor:  { connect: { id: orden.proveedorId } },
          },
        });
        productoId = nuevo.id;
        productosCreados++;

        await db.ordenCompraItem.update({
          where: { id: item.id },
          data: { productoId: nuevo.id },
        });
      } else {
        productoId = item.productoId;
      }

      const producto = await db.producto.findUniqueOrThrow({ where: { id: productoId } });
      const cantidadOrdenada = item.cantidad;

      const cantidadAceptada = producto.stockMaximo > 0
        ? Math.min(cantidadOrdenada, Math.max(0, producto.stockMaximo - producto.stock))
        : cantidadOrdenada;

      const stockNuevo = producto.stock + cantidadAceptada;

      if (cantidadAceptada > 0) {
        await db.producto.update({
          where: { id: productoId },
          data: { stock: stockNuevo, precioCompra },
        });
        await db.movimientoInventario.create({
          data: {
            productoId,
            tipo:          'entrada_compra',
            cantidad:      cantidadAceptada,
            stockAnterior: producto.stock,
            stockNuevo,
            referenciaId:   parseInt(id),
            referenciaTipo: 'orden_compra',
            observacion:   `Recepción orden ${orden.numero}`,
            usuarioId,
          },
        });
      }

      await db.ordenCompraItem.update({
        where: { id: item.id },
        data: { cantidadRecibida: cantidadAceptada },
      });

      movimientos.push({
        productoNombre:    item.descripcion,
        cantidadOrdenada,
        cantidadAceptada,
        stockFinal:        stockNuevo,
      });
    }

    const actualizada = await db.ordenCompra.update({
      where: { id: parseInt(id) },
      data: { estado: 'recibida', fechaRecepcion: new Date() },
      include: INCLUDE,
    });

    return {
      orden: toResumen(actualizada as unknown as OrdenRow),
      productosCreados,
      movimientos,
    };
  },
};

async function generarEan13Unico(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const prefix = '789';
    const mid = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
    const raw = prefix + mid;
    const cs = raw.split('').reduce((s, d, idx) => s + parseInt(d) * (idx % 2 === 0 ? 1 : 3), 0);
    const bc = raw + String((10 - (cs % 10)) % 10);
    if (!await db.producto.findUnique({ where: { codigoBarras: bc } })) return bc;
  }
  return `789${Date.now()}`;
}

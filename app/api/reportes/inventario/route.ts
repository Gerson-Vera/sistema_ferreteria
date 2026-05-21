import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import db from '@/lib/db';
import { ok, serverError } from '@/lib/api/response';

const filterSchema = z.object({
  search:   z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo:   z.string().optional(),
  status:   z.enum(['todos', 'activo', 'inactivo']).default('todos'),
  export:   z.enum(['excel']).optional(),
});

const querySchema = filterSchema.extend({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20),
});

const include = {
  categoria:    { select: { codigo: true } },
  marca:        { select: { nombre: true } },
  unidadMedida: { select: { codigo: true } },
  almacen:      { select: { nombre: true } },
};

function buildWhere(p: z.infer<typeof querySchema>) {
  const where: Record<string, unknown> = {};
  if (p.status === 'activo')   where.estado = true;
  if (p.status === 'inactivo') where.estado = false;
  if (p.dateFrom || p.dateTo) {
    where.creadoEn = {
      ...(p.dateFrom && { gte: new Date(p.dateFrom) }),
      ...(p.dateTo   && { lte: new Date(p.dateTo + 'T23:59:59') }),
    };
  }
  if (p.search) {
    where.OR = [
      { codigo:      { contains: p.search, mode: 'insensitive' } },
      { descripcion: { contains: p.search, mode: 'insensitive' } },
      { codigoBarras: { contains: p.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

type ProductoRaw = Awaited<ReturnType<typeof db.producto.findMany>>[number] & {
  categoria:    { codigo: string };
  marca:        { nombre: string } | null;
  unidadMedida: { codigo: string } | null;
  almacen:      { nombre: string } | null;
};

function toRow(r: ProductoRaw) {
  return {
    id:           String(r.id),
    codigo:       r.codigo,
    descripcion:  r.descripcion,
    categoria:    r.categoria.codigo,
    marca:        r.marca?.nombre ?? null,
    unidad:       r.unidadMedida?.codigo ?? null,
    almacen:      r.almacen?.nombre ?? null,
    stock:        r.stock,
    stockMinimo:  r.stockMinimo,
    stockMaximo:  r.stockMaximo,
    puntoReorden: r.puntoReorden,
    precioCompra: Number(r.precioCompra),
    precioVenta:  Number(r.precioVenta),
    estado:       r.estado,
    creadoEn:     r.creadoEn.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const raw = Object.fromEntries(req.nextUrl.searchParams);
    const isExport = raw.export === 'excel';
    const params = isExport ? { ...filterSchema.parse(raw), page: 1, limit: 20 } : querySchema.parse(raw);
    const where = buildWhere(params);

    if (isExport) {
      const rows = await db.producto.findMany({ where, orderBy: { descripcion: 'asc' }, include }) as ProductoRaw[];
      const wsData = rows.map(r => ({
        'Código':          r.codigo,
        'Descripción':     r.descripcion,
        'Categoría':       r.categoria.codigo,
        'Marca':           r.marca?.nombre ?? '-',
        'Unidad':          r.unidadMedida?.codigo ?? '-',
        'Almacén':         r.almacen?.nombre ?? '-',
        'Stock':           r.stock,
        'Stock Mín.':      r.stockMinimo,
        'Stock Máx.':      r.stockMaximo,
        'Punto Reorden':   r.puntoReorden,
        'P. Compra (S/)':  Number(r.precioCompra),
        'P. Venta (S/)':   Number(r.precioVenta),
        'Estado':          r.estado ? 'Activo' : 'Inactivo',
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(wsData);
      ws['!cols'] = [12, 36, 14, 16, 8, 18, 8, 10, 10, 14, 14, 14, 10].map(w => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
      const raw: Uint8Array = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      return new NextResponse(Buffer.from(raw), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="reporte-inventario.xlsx"',
        },
      });
    }

    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const [rawRows, total] = await Promise.all([
      db.producto.findMany({ where, skip, take: limit, orderBy: { descripcion: 'asc' }, include }),
      db.producto.count({ where }),
    ]);

    return ok({
      data: (rawRows as ProductoRaw[]).map(toRow),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return serverError(e);
  }
}

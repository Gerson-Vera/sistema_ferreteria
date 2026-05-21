import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import db from '@/lib/db';
import { ok, serverError } from '@/lib/api/response';

const filterSchema = z.object({
  search:   z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo:   z.string().optional(),
  status:   z.enum(['todos', 'entrada', 'salida']).default('todos'),
  export:   z.enum(['excel']).optional(),
});

const querySchema = filterSchema.extend({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20),
});

const include = {
  producto: { select: { descripcion: true, codigo: true } },
  usuario:  { select: { nombre: true } },
};

function buildWhere(p: z.infer<typeof querySchema>) {
  const where: Record<string, unknown> = {};
  if (p.status === 'entrada') where.tipo = { startsWith: 'entrada' };
  if (p.status === 'salida')  where.tipo = { startsWith: 'salida'  };
  if (p.dateFrom || p.dateTo) {
    where.creadoEn = {
      ...(p.dateFrom && { gte: new Date(p.dateFrom) }),
      ...(p.dateTo   && { lte: new Date(p.dateTo + 'T23:59:59') }),
    };
  }
  if (p.search) {
    where.OR = [
      { producto: { descripcion: { contains: p.search, mode: 'insensitive' } } },
      { producto: { codigo:      { contains: p.search, mode: 'insensitive' } } },
      { observacion: { contains: p.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

type MovimientoRaw = Awaited<ReturnType<typeof db.movimientoInventario.findMany>>[number] & {
  producto: { descripcion: string; codigo: string };
  usuario:  { nombre: string };
};

function toRow(r: MovimientoRaw) {
  return {
    id:            String(r.id),
    fecha:         r.creadoEn.toISOString(),
    producto:      r.producto.descripcion,
    codigoProducto: r.producto.codigo,
    tipo:          r.tipo,
    cantidad:      r.cantidad,
    stockAnterior: r.stockAnterior,
    stockNuevo:    r.stockNuevo,
    referenciaTipo: r.referenciaTipo ?? null,
    referenciaId:  r.referenciaId ?? null,
    usuario:       r.usuario.nombre,
    observacion:   r.observacion ?? null,
    estado:        r.estado,
  };
}

const TIPO_LABEL: Record<string, string> = {
  entrada_compra:  'Entrada Compra',
  salida_venta:    'Salida Venta',
  entrada_ajuste:  'Entrada Ajuste',
  salida_ajuste:   'Salida Ajuste',
  entrada_manual:  'Entrada Manual',
  salida_manual:   'Salida Manual',
};

export async function GET(req: NextRequest) {
  try {
    const raw = Object.fromEntries(req.nextUrl.searchParams);
    const isExport = raw.export === 'excel';
    const params = isExport ? { ...filterSchema.parse(raw), page: 1, limit: 20 } : querySchema.parse(raw);
    const where = buildWhere(params);

    if (isExport) {
      const rows = await db.movimientoInventario.findMany({ where, orderBy: { creadoEn: 'desc' }, include }) as MovimientoRaw[];
      const wsData = rows.map(r => ({
        'Fecha':         r.creadoEn.toLocaleDateString('es-PE'),
        'Hora':          r.creadoEn.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        'Código Prod.':  r.producto.codigo,
        'Producto':      r.producto.descripcion,
        'Tipo':          TIPO_LABEL[r.tipo] ?? r.tipo,
        'Cantidad':      r.cantidad,
        'Stock Anterior': r.stockAnterior,
        'Stock Nuevo':   r.stockNuevo,
        'Diferencia':    r.stockNuevo - r.stockAnterior,
        'Ref. Tipo':     r.referenciaTipo ?? '-',
        'Ref. ID':       r.referenciaId ?? '-',
        'Usuario':       r.usuario.nombre,
        'Observación':   r.observacion ?? '-',
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(wsData);
      ws['!cols'] = [14, 8, 12, 36, 16, 10, 14, 12, 10, 14, 8, 20, 36].map(w => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');
      const raw: Uint8Array = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      return new NextResponse(Buffer.from(raw), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="reporte-movimientos.xlsx"',
        },
      });
    }

    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const [rawRows, total] = await Promise.all([
      db.movimientoInventario.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include }),
      db.movimientoInventario.count({ where }),
    ]);

    return ok({
      data: (rawRows as MovimientoRaw[]).map(toRow),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return serverError(e);
  }
}

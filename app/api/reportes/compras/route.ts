import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import db from '@/lib/db';
import { ok, serverError } from '@/lib/api/response';

const filterSchema = z.object({
  search:   z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo:   z.string().optional(),
  status:   z.enum(['todos', 'pendiente', 'recibida', 'anulada']).default('todos'),
  export:   z.enum(['excel']).optional(),
});

const querySchema = filterSchema.extend({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20),
});

const include = {
  proveedor: { select: { descripcion: true } },
  usuario:   { select: { nombre: true } },
  tipoPago:  { select: { nombre: true } },
};

function buildWhere(p: z.infer<typeof querySchema>) {
  const where: Record<string, unknown> = {};
  if (p.status !== 'todos') where.estado = p.status;
  if (p.dateFrom || p.dateTo) {
    where.creadoEn = {
      ...(p.dateFrom && { gte: new Date(p.dateFrom) }),
      ...(p.dateTo   && { lte: new Date(p.dateTo + 'T23:59:59') }),
    };
  }
  if (p.search) {
    where.OR = [
      { numero:    { contains: p.search, mode: 'insensitive' } },
      { proveedor: { descripcion: { contains: p.search, mode: 'insensitive' } } },
    ];
  }
  return where;
}

type CompraRaw = Awaited<ReturnType<typeof db.compra.findMany>>[number] & {
  proveedor: { descripcion: string };
  usuario:   { nombre: string };
  tipoPago:  { nombre: string } | null;
};

function toRow(r: CompraRaw) {
  return {
    id:             String(r.id),
    numero:         r.numero,
    fecha:          r.creadoEn.toISOString(),
    proveedor:      r.proveedor.descripcion,
    usuario:        r.usuario.nombre,
    subtotal:       Number(r.subtotal),
    igv:            Number(r.igv),
    total:          Number(r.total),
    tipoPago:       r.tipoPago?.nombre ?? null,
    numeroFactura:  r.numeroFactura ?? null,
    estado:         r.estado,
  };
}

export async function GET(req: NextRequest) {
  try {
    const raw = Object.fromEntries(req.nextUrl.searchParams);
    const isExport = raw.export === 'excel';
    const params = isExport ? { ...filterSchema.parse(raw), page: 1, limit: 20 } : querySchema.parse(raw);
    const where = buildWhere(params);

    if (isExport) {
      const rows = await db.compra.findMany({ where, orderBy: { creadoEn: 'desc' }, include }) as CompraRaw[];
      const wsData = rows.map(r => ({
        'N° Compra':     r.numero,
        'Fecha':         r.creadoEn.toLocaleDateString('es-PE'),
        'Proveedor':     r.proveedor.descripcion,
        'Usuario':       r.usuario.nombre,
        'N° Factura':    r.numeroFactura ?? '-',
        'Subtotal (S/)': Number(r.subtotal),
        'IGV 18% (S/)':  Number(r.igv),
        'Total (S/)':    Number(r.total),
        'Tipo de Pago':  r.tipoPago?.nombre ?? '-',
        'Estado':        r.estado,
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(wsData);
      ws['!cols'] = [12, 14, 30, 20, 14, 14, 14, 14, 16, 12].map(w => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, 'Compras');
      const raw: Uint8Array = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      return new NextResponse(Buffer.from(raw), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="reporte-compras.xlsx"',
        },
      });
    }

    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const [rawRows, total] = await Promise.all([
      db.compra.findMany({ where, skip, take: limit, orderBy: { creadoEn: 'desc' }, include }),
      db.compra.count({ where }),
    ]);

    return ok({
      data: (rawRows as CompraRaw[]).map(toRow),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return serverError(e);
  }
}

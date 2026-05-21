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
      { descripcion:     { contains: p.search, mode: 'insensitive' } },
      { codigo:          { contains: p.search, mode: 'insensitive' } },
      { numeroDocumento: { contains: p.search, mode: 'insensitive' } },
      { email:           { contains: p.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

type ClienteRaw = Awaited<ReturnType<typeof db.cliente.findMany>>[number];

function toRow(r: ClienteRaw) {
  return {
    id:              String(r.id),
    codigo:          r.codigo,
    descripcion:     r.descripcion,
    tipo:            r.tipo,
    tipoDocumento:   r.tipoDocumento,
    numeroDocumento: r.numeroDocumento,
    email:           r.email ?? null,
    telefono:        r.telefono ?? null,
    direccion:       r.direccion ?? null,
    estado:          r.estado,
    creadoEn:        r.creadoEn.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const raw = Object.fromEntries(req.nextUrl.searchParams);
    const isExport = raw.export === 'excel';
    const params = isExport ? { ...filterSchema.parse(raw), page: 1, limit: 20 } : querySchema.parse(raw);
    const where = buildWhere(params);

    if (isExport) {
      const rows = await db.cliente.findMany({ where, orderBy: { descripcion: 'asc' } });
      const wsData = rows.map(r => ({
        'Código':          r.codigo,
        'Nombre/Razón':    r.descripcion,
        'Tipo Cliente':    r.tipo,
        'Tipo Documento':  r.tipoDocumento,
        'N° Documento':    r.numeroDocumento,
        'Email':           r.email ?? '-',
        'Teléfono':        r.telefono ?? '-',
        'Dirección':       r.direccion ?? '-',
        'Estado':          r.estado ? 'Activo' : 'Inactivo',
        'Registrado':      r.creadoEn.toLocaleDateString('es-PE'),
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(wsData);
      ws['!cols'] = [10, 36, 12, 14, 14, 28, 12, 36, 10, 14].map(w => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
      const raw: Uint8Array = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      return new NextResponse(Buffer.from(raw), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="reporte-clientes.xlsx"',
        },
      });
    }

    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const [rawRows, total] = await Promise.all([
      db.cliente.findMany({ where, skip, take: limit, orderBy: { descripcion: 'asc' } }),
      db.cliente.count({ where }),
    ]);

    return ok({
      data: rawRows.map(toRow),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return serverError(e);
  }
}

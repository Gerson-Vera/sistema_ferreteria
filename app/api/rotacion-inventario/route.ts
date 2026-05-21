import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/api/response';
import db from '@/lib/db';

export type ProductoRotacion = {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  stock: number;
  unidadesVendidas: number;
  ingresoTotal: number;
  rotacionAnual: number;
  diasInventario: number;
  clasificacion: 'A' | 'B' | 'C';
  stockMuerto: boolean;
};

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const dias = Math.min(parseInt(sp.get('dias') ?? '90'), 365);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dias);

    const [productos, ventaItems] = await Promise.all([
      db.producto.findMany({
        where: { estado: true },
        include: { categoria: true },
      }),
      db.ventaItem.findMany({
        where: {
          estado: true,
          venta: { estado: 'completada', creadoEn: { gte: startDate } },
        },
        select: { productoId: true, cantidad: true, subtotal: true },
      }),
    ]);

    // Aggregate sales by product
    const ventasPorProducto = new Map<number, { unidades: number; ingreso: number }>();
    for (const item of ventaItems) {
      const prev = ventasPorProducto.get(item.productoId) ?? { unidades: 0, ingreso: 0 };
      ventasPorProducto.set(item.productoId, {
        unidades: prev.unidades + item.cantidad,
        ingreso: prev.ingreso + Number(item.subtotal),
      });
    }

    // Build product list with sales data
    const lista = productos.map(p => {
      const ventas = ventasPorProducto.get(p.id) ?? { unidades: 0, ingreso: 0 };
      const rotacionAnual = ventas.unidades > 0
        ? (ventas.unidades / dias) * 365
        : 0;
      const diasInventario = ventas.unidades > 0
        ? Math.round(p.stock / (ventas.unidades / dias))
        : p.stock > 0 ? 9999 : 0;

      return {
        id: p.id,
        sku: p.codigo,
        nombre: p.descripcion,
        categoria: p.categoria.descripcion ?? p.categoria.codigo,
        stock: p.stock,
        unidadesVendidas: ventas.unidades,
        ingresoTotal: ventas.ingreso,
        rotacionAnual: Math.round(rotacionAnual * 10) / 10,
        diasInventario,
        stockMuerto: p.stock > 0 && ventas.unidades === 0,
      };
    });

    // ABC classification by revenue
    const totalIngreso = lista.reduce((s, p) => s + p.ingresoTotal, 0);
    const sorted = [...lista].sort((a, b) => b.ingresoTotal - a.ingresoTotal);

    let acumulado = 0;
    const clasificaciones = new Map<number, 'A' | 'B' | 'C'>();
    for (const p of sorted) {
      acumulado += p.ingresoTotal;
      const pct = totalIngreso > 0 ? (acumulado / totalIngreso) * 100 : 100;
      clasificaciones.set(p.id, pct <= 80 ? 'A' : pct <= 95 ? 'B' : 'C');
    }

    const resultado: ProductoRotacion[] = lista.map(p => ({
      ...p,
      id: String(p.id),
      clasificacion: clasificaciones.get(p.id) ?? 'C',
    }));

    const stockMuerto = resultado.filter(p => p.stockMuerto).length;
    const conteoA = resultado.filter(p => p.clasificacion === 'A').length;
    const conteoB = resultado.filter(p => p.clasificacion === 'B').length;
    const conteoC = resultado.filter(p => p.clasificacion === 'C').length;

    return ok({
      productos: resultado,
      resumen: {
        periodo: dias,
        totalProductos: resultado.length,
        stockMuerto,
        clasificacionA: conteoA,
        clasificacionB: conteoB,
        clasificacionC: conteoC,
        totalIngreso,
      },
    });
  } catch (e) {
    return serverError(e);
  }
}

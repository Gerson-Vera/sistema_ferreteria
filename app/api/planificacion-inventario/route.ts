import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/api/response';
import db from '@/lib/db';

export type ProductoPlanificacion = {
  id: string;
  sku: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  puntoReorden: number;
  cantidadSugerida: number;
  costoSugerido: number;
  precioCompra: number;
  estado: 'critico' | 'reorden';
  categoria: string;
  proveedor: { id: string; nombre: string; telefono: string | null } | null;
};

export async function GET(_req: NextRequest) {
  try {
    const productos = await db.producto.findMany({
      where: { estado: true },
      include: {
        categoria: true,
        proveedor: true,
      },
      orderBy: { stock: 'asc' },
    });

    const resultado: ProductoPlanificacion[] = [];

    for (const p of productos) {
      const threshold = p.puntoReorden > 0 ? p.puntoReorden : p.stockMinimo;
      if (p.stock > threshold) continue;

      const estado: 'critico' | 'reorden' =
        p.stock === 0 || p.stock < p.stockMinimo ? 'critico' : 'reorden';

      const cantidadSugerida = p.stockMaximo > 0
        ? Math.max(p.stockMaximo - p.stock, 0)
        : Math.max(p.stockMinimo * 2 - p.stock, 1);

      resultado.push({
        id: String(p.id),
        sku: p.codigo,
        nombre: p.descripcion,
        stock: p.stock,
        stockMinimo: p.stockMinimo,
        stockMaximo: p.stockMaximo,
        puntoReorden: p.puntoReorden,
        cantidadSugerida,
        costoSugerido: cantidadSugerida * Number(p.precioCompra),
        precioCompra: Number(p.precioCompra),
        estado,
        categoria: p.categoria.descripcion ?? p.categoria.codigo,
        proveedor: p.proveedor
          ? { id: String(p.proveedor.id), nombre: p.proveedor.descripcion, telefono: p.proveedor.telefono }
          : null,
      });
    }

    const totalCosto = resultado.reduce((s, p) => s + p.costoSugerido, 0);
    const criticos = resultado.filter(p => p.estado === 'critico').length;
    const reorden = resultado.filter(p => p.estado === 'reorden').length;

    return ok({ productos: resultado, resumen: { total: resultado.length, criticos, reorden, totalCosto } });
  } catch (e) {
    return serverError(e);
  }
}

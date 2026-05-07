import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/api/response';
import { productosRepository } from '@/modules/productos/server/productos.repository';

export async function GET(_req: NextRequest) {
  try {
    const productos = await productosRepository.findLowStock();
    return ok({
      count: productos.length,
      productos: productos.map(p => ({
        id: p.id,
        sku: p.sku,
        nombre: p.nombre,
        stock: p.stock,
        stockMinimo: p.stockMinimo,
        codigoBarras: p.codigoBarras,
      })),
    });
  } catch {
    return serverError('Error al obtener productos con stock bajo');
  }
}

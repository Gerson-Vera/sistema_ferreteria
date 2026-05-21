import { AppError } from '@/lib/errors/AppError';
import { sendEmail, buildOrdenCompraEmail } from '@/lib/email';
import db from '@/lib/db';
import { comprasRepository } from './compras.repository';
import type { CreateCompraDto } from '../types';
import type { QueryCompraInput } from '../schemas';

function generarNumeroCompra(): string {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `C-${anio}${mes}-${random}`;
}

export const comprasService = {
  async getAll(params: QueryCompraInput) {
    return comprasRepository.findMany(params);
  },

  async getById(id: string) {
    const compra = await comprasRepository.findById(id);
    if (!compra) throw AppError.notFound('Compra');
    return compra;
  },

  async create(data: CreateCompraDto, usuarioId: number) {
    const numero = generarNumeroCompra();
    const compra = await comprasRepository.create(data, numero, usuarioId);

    // Envío de correo al proveedor (no bloquea la respuesta si falla)
    try {
      const productoIds = data.items.map(i => parseInt(i.productoId));
      const [proveedor, productos, usuario] = await Promise.all([
        db.proveedor.findUnique({
          where: { id: parseInt(data.proveedorId) },
          select: { descripcion: true, email: true },
        }),
        db.producto.findMany({
          where: { id: { in: productoIds } },
          select: { id: true, descripcion: true },
        }),
        db.usuario.findUnique({
          where: { id: usuarioId },
          select: { nombre: true },
        }),
      ]);

      if (proveedor?.email) {
        const descMap = new Map(productos.map(p => [p.id, p.descripcion]));
        const fecha = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
        const html = buildOrdenCompraEmail({
          numero,
          proveedor: proveedor.descripcion,
          fecha,
          items: compra.items.map(i => ({
            descripcion: descMap.get(parseInt(i.productoId)) ?? `Producto #${i.productoId}`,
            cantidad: i.cantidad,
            costoUnitario: i.costoUnitario,
            subtotal: i.subtotal,
          })),
          subtotal: compra.subtotal,
          igv: compra.igv,
          total: compra.total,
          observaciones: compra.observaciones,
          solicitante: usuario?.nombre ?? '',
        });
        await sendEmail({
          to: proveedor.email,
          subject: `Compra registrada ${numero} — Ferretería`,
          html,
        });
      }
    } catch (err) {
      console.error('[compras] Error enviando email al proveedor:', err);
    }

    return compra;
  },

  async recibir(id: string, itemIds?: number[]) {
    const compra = await this.getById(id);
    if (compra.estado !== 'pendiente') throw AppError.badRequest('Solo se pueden recibir compras pendientes');
    if (itemIds !== undefined && itemIds.length === 0) throw AppError.badRequest('Debe confirmar al menos un producto');
    return comprasRepository.recibir(id, itemIds);
  },

  async anular(id: string) {
    const compra = await this.getById(id);
    if (compra.estado === 'anulada') throw AppError.badRequest('La compra ya está anulada');
    return comprasRepository.anular(id);
  },
};

import { AppError } from '@/lib/errors/AppError';
import { sendEmail, buildOrdenCompraEmail } from '@/lib/email';
import { ordenesCompraRepository } from './ordenes-compra.repository';
import type { CreateOrdenCompraDto } from '../types';
import type { QueryOrdenInput } from '../schemas';

function generarNumero(): string {
  const now = new Date();
  const anio = now.getFullYear();
  const seq = Math.floor(Math.random() * 9000 + 1000);
  return `OC-${anio}-${seq}`;
}

export const ordenesCompraService = {
  async getAll(params: QueryOrdenInput) {
    return ordenesCompraRepository.findMany(params);
  },

  async getById(id: string) {
    const orden = await ordenesCompraRepository.findById(id);
    if (!orden) throw AppError.notFound('Orden de compra');
    return orden;
  },

  async create(data: CreateOrdenCompraDto, usuarioId: number) {
    const numero = generarNumero();
    return ordenesCompraRepository.create(data, numero, usuarioId);
  },

  async enviar(id: string, solicitante: string) {
    const orden = await this.getById(id);
    if (orden.estado !== 'borrador') {
      throw AppError.badRequest('Solo se pueden enviar órdenes en estado borrador');
    }
    if (!orden.proveedorEmail) {
      throw AppError.badRequest('El proveedor no tiene email registrado');
    }

    const fecha = new Date().toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    const html = buildOrdenCompraEmail({
      numero: orden.numero,
      proveedor: orden.proveedorNombre,
      fecha,
      items: orden.items.map(i => ({
        descripcion: i.descripcion,
        cantidad: i.cantidad,
        costoUnitario: i.costoUnitario,
        subtotal: i.subtotal,
      })),
      subtotal: orden.subtotal,
      igv: orden.igv,
      total: orden.total,
      observaciones: orden.observaciones,
      solicitante,
    });

    await sendEmail({
      to: orden.proveedorEmail,
      subject: `Orden de Compra ${orden.numero} — Inversiones Andrew Valentino E.I.R.L.`,
      html,
    });

    return ordenesCompraRepository.marcarEnviada(id);
  },

  async recibir(id: string, usuarioId: number) {
    const orden = await this.getById(id);
    if (orden.estado !== 'enviada' && orden.estado !== 'borrador') {
      throw AppError.badRequest('Solo se pueden recibir órdenes enviadas o en borrador');
    }
    return ordenesCompraRepository.recibir(id, usuarioId);
  },

  async anular(id: string) {
    const orden = await this.getById(id);
    if (orden.estado === 'recibida') {
      throw AppError.badRequest('No se puede anular una orden ya recibida');
    }
    if (orden.estado === 'anulada') {
      throw AppError.badRequest('La orden ya está anulada');
    }
    return ordenesCompraRepository.anular(id);
  },
};

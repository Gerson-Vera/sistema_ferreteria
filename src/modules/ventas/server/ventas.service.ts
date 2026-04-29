import { AppError } from '@/lib/errors/AppError';
import { ventasRepository } from './ventas.repository';
import type { CreateVentaDto } from '../types';
import type { QueryVentaInput } from '../schemas';

function generarNumeroVenta(): string {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `V-${anio}${mes}-${random}`;
}

export const ventasService = {
  async getAll(params: QueryVentaInput) {
    return ventasRepository.findMany(params);
  },

  async getById(id: string) {
    const venta = await ventasRepository.findById(id);
    if (!venta) throw AppError.notFound('Venta');
    return venta;
  },

  async create(data: CreateVentaDto) {
    const numero = generarNumeroVenta();
    return ventasRepository.create(data, numero);
  },

  async anular(id: string) {
    const venta = await this.getById(id);
    if (venta.estado === 'anulada') throw AppError.badRequest('La venta ya está anulada');
    return ventasRepository.anular(id);
  },
};

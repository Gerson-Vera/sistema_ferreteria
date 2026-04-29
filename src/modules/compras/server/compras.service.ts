import { AppError } from '@/lib/errors/AppError';
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

  async create(data: CreateCompraDto) {
    const numero = generarNumeroCompra();
    return comprasRepository.create(data, numero);
  },

  async recibir(id: string) {
    const compra = await this.getById(id);
    if (compra.estado !== 'pendiente') throw AppError.badRequest('Solo se pueden recibir compras pendientes');
    return comprasRepository.recibir(id);
  },

  async anular(id: string) {
    const compra = await this.getById(id);
    if (compra.estado === 'anulada') throw AppError.badRequest('La compra ya está anulada');
    return comprasRepository.anular(id);
  },
};

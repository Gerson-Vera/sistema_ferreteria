import { AppError } from '@/lib/errors/AppError';
import { tiposPagoRepository } from './tipos-pago.repository';
import type { CreateTipoPagoDto, UpdateTipoPagoDto } from '../types';

export const tiposPagoService = {
  async getAll(activo?: boolean) {
    return tiposPagoRepository.findMany(activo);
  },

  async getById(id: string) {
    const tipoPago = await tiposPagoRepository.findById(id);
    if (!tipoPago) throw AppError.notFound('Tipo de pago');
    return tipoPago;
  },

  async create(data: CreateTipoPagoDto) {
    const existing = await tiposPagoRepository.findByNombre(data.nombre);
    if (existing && existing.activo) {
      throw AppError.conflict(`Ya existe el tipo de pago "${data.nombre}"`);
    }
    return tiposPagoRepository.create(data);
  },

  async update(id: string, data: UpdateTipoPagoDto) {
    await this.getById(id);
    return tiposPagoRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return tiposPagoRepository.delete(id);
  },
};

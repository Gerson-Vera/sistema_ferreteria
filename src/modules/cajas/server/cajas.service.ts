import { AppError } from '@/lib/errors/AppError';
import { cajasRepository } from './cajas.repository';
import type { CreateCajaDto, UpdateCajaDto } from '../types';

export const cajasService = {
  async getAll(activo?: boolean) {
    return cajasRepository.findMany(activo);
  },

  async getById(id: string) {
    const caja = await cajasRepository.findById(id);
    if (!caja) throw AppError.notFound('Caja');
    return caja;
  },

  async create(data: CreateCajaDto) {
    const existing = await cajasRepository.findByNombre(data.nombre);
    if (existing && existing.activo) {
      throw AppError.conflict(`Ya existe la caja "${data.nombre}"`);
    }
    return cajasRepository.create(data);
  },

  async update(id: string, data: UpdateCajaDto) {
    await this.getById(id);
    return cajasRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return cajasRepository.delete(id);
  },
};

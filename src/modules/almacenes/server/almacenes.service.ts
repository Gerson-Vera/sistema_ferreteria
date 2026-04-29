import { AppError } from '@/lib/errors/AppError';
import { almacenesRepository } from './almacenes.repository';
import type { CreateAlmacenDto, UpdateAlmacenDto } from '../types';

export const almacenesService = {
  async getAll(activo?: boolean) {
    return almacenesRepository.findMany(activo);
  },

  async getById(id: string) {
    const almacen = await almacenesRepository.findById(id);
    if (!almacen) throw AppError.notFound('Almacén');
    return almacen;
  },

  async create(data: CreateAlmacenDto) {
    const existing = await almacenesRepository.findByNombre(data.nombre);
    if (existing && existing.activo) {
      throw AppError.conflict(`Ya existe el almacén "${data.nombre}"`);
    }
    return almacenesRepository.create(data);
  },

  async update(id: string, data: UpdateAlmacenDto) {
    await this.getById(id);
    return almacenesRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return almacenesRepository.delete(id);
  },
};

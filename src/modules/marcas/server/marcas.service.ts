import { AppError } from '@/lib/errors/AppError';
import { marcasRepository } from './marcas.repository';
import type { CreateMarcaDto, UpdateMarcaDto } from '../types';

export const marcasService = {
  async getAll(activo?: boolean) {
    return marcasRepository.findMany(activo);
  },

  async getById(id: string) {
    const marca = await marcasRepository.findById(id);
    if (!marca) throw AppError.notFound('Marca');
    return marca;
  },

  async create(data: CreateMarcaDto) {
    const existing = await marcasRepository.findByNombre(data.nombre);
    if (existing && existing.activo) {
      throw AppError.conflict(`Ya existe la marca "${data.nombre}"`);
    }
    return marcasRepository.create(data);
  },

  async update(id: string, data: UpdateMarcaDto) {
    await this.getById(id);
    return marcasRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return marcasRepository.delete(id);
  },
};

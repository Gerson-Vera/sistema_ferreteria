import { AppError } from '@/lib/errors/AppError';
import { categoriasRepository } from './categorias.repository';
import type { CreateCategoriaDto, UpdateCategoriaDto } from '../types';

export const categoriasService = {
  async getAll() {
    return categoriasRepository.findMany();
  },

  async getById(id: string) {
    const categoria = await categoriasRepository.findById(id);
    if (!categoria) throw AppError.notFound('Categoría');
    return categoria;
  },

  async create(data: CreateCategoriaDto) {
    const existing = await categoriasRepository.findByNombre(data.nombre);
    if (existing) throw AppError.conflict(`Ya existe la categoría "${data.nombre}"`);
    return categoriasRepository.create(data);
  },

  async update(id: string, data: UpdateCategoriaDto) {
    await this.getById(id);
    return categoriasRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return categoriasRepository.delete(id);
  },
};

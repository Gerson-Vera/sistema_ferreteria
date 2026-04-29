import { AppError } from '@/lib/errors/AppError';
import { unidadesMedidaRepository } from './unidades-medida.repository';
import type { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from '../types';

export const unidadesMedidaService = {
  async getAll(activo?: boolean) {
    return unidadesMedidaRepository.findMany(activo);
  },

  async getById(id: string) {
    const unidad = await unidadesMedidaRepository.findById(id);
    if (!unidad) throw AppError.notFound('Unidad de medida');
    return unidad;
  },

  async create(data: CreateUnidadMedidaDto) {
    const existing = await unidadesMedidaRepository.findByCodigo(data.codigo);
    if (existing && existing.activo) {
      throw AppError.conflict(`Ya existe la unidad de medida con código "${data.codigo}"`);
    }
    return unidadesMedidaRepository.create(data);
  },

  async update(id: string, data: UpdateUnidadMedidaDto) {
    await this.getById(id);
    return unidadesMedidaRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return unidadesMedidaRepository.delete(id);
  },
};

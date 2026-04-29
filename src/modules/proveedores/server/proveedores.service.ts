import { AppError } from '@/lib/errors/AppError';
import { proveedoresRepository } from './proveedores.repository';
import type { CreateProveedorDto, UpdateProveedorDto } from '../types';
import type { QueryParams } from '@/shared/types';

export const proveedoresService = {
  async getAll(params: QueryParams) {
    return proveedoresRepository.findMany(params);
  },

  async getById(id: string) {
    const proveedor = await proveedoresRepository.findById(id);
    if (!proveedor) throw AppError.notFound('Proveedor');
    return proveedor;
  },

  async create(data: CreateProveedorDto) {
    if (data.ruc) {
      const existing = await proveedoresRepository.findByRuc(data.ruc);
      if (existing) throw AppError.conflict(`Ya existe un proveedor con RUC "${data.ruc}"`);
    }
    return proveedoresRepository.create(data);
  },

  async update(id: string, data: UpdateProveedorDto) {
    await this.getById(id);
    return proveedoresRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return proveedoresRepository.delete(id);
  },
};

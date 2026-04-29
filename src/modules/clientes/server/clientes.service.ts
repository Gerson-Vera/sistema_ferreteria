import { AppError } from '@/lib/errors/AppError';
import { clientesRepository } from './clientes.repository';
import type { CreateClienteDto, UpdateClienteDto } from '../types';
import type { QueryParams } from '@/shared/types';

export const clientesService = {
  async getAll(params: QueryParams) {
    return clientesRepository.findMany(params);
  },

  async getById(id: string) {
    const cliente = await clientesRepository.findById(id);
    if (!cliente) throw AppError.notFound('Cliente');
    return cliente;
  },

  async create(data: CreateClienteDto) {
    const existing = await clientesRepository.findByDocumento(data.numeroDocumento);
    if (existing) throw AppError.conflict(`Ya existe un cliente con documento "${data.numeroDocumento}"`);
    return clientesRepository.create(data);
  },

  async update(id: string, data: UpdateClienteDto) {
    await this.getById(id);
    return clientesRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return clientesRepository.delete(id);
  },
};

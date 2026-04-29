import type { Compra, CreateCompraDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryCompraInput } from '../schemas';

export const comprasRepository = {
  async findMany(params: QueryCompraInput): Promise<PaginatedResponse<Compra>> {
    throw new Error('Not implemented: conectar con DB');
  },

  async findById(id: string): Promise<Compra | null> {
    throw new Error('Not implemented: conectar con DB');
  },

  async create(data: CreateCompraDto, numero: string): Promise<Compra> {
    throw new Error('Not implemented: conectar con DB');
  },

  async recibir(id: string): Promise<Compra> {
    throw new Error('Not implemented: conectar con DB');
  },

  async anular(id: string): Promise<Compra> {
    throw new Error('Not implemented: conectar con DB');
  },
};

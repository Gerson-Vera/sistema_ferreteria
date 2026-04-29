import type { Venta, CreateVentaDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';
import type { QueryVentaInput } from '../schemas';

export const ventasRepository = {
  async findMany(params: QueryVentaInput): Promise<PaginatedResponse<Venta>> {
    throw new Error('Not implemented: conectar con DB');
  },

  async findById(id: string): Promise<Venta | null> {
    throw new Error('Not implemented: conectar con DB');
  },

  async findByNumero(numero: string): Promise<Venta | null> {
    throw new Error('Not implemented: conectar con DB');
  },

  async create(data: CreateVentaDto, numero: string): Promise<Venta> {
    throw new Error('Not implemented: conectar con DB');
  },

  async anular(id: string): Promise<Venta> {
    throw new Error('Not implemented: conectar con DB');
  },

  async getTotalHoy(): Promise<number> {
    throw new Error('Not implemented: conectar con DB');
  },
};

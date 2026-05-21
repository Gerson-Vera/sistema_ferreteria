import { AppError } from '@/lib/errors/AppError';
import { productosRepository } from './productos.repository';
import type { CreateProductoDto, UpdateProductoDto } from '../types';
import type { QueryParams } from '@/shared/types';

export const productosService = {
  async getAll(params: QueryParams & { categoriaId?: string; almacenId?: string; proveedorId?: string; activo?: boolean }) {
    return productosRepository.findMany(params);
  },

  async getById(id: string) {
    const producto = await productosRepository.findById(id);
    if (!producto) throw AppError.notFound('Producto');
    return producto;
  },

  async getByCodigoBarras(codigoBarras: string) {
    const producto = await productosRepository.findByCodigoBarras(codigoBarras);
    if (!producto) throw AppError.notFound('Producto');
    return producto;
  },

  async create(data: CreateProductoDto) {
    return productosRepository.create(data);
  },

  async update(id: string, data: UpdateProductoDto) {
    await this.getById(id);
    return productosRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return productosRepository.delete(id);
  },
};

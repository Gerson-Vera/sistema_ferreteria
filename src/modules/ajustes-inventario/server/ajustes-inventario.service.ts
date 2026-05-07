import { AppError } from '@/lib/errors/AppError';
import { ajustesInventarioRepository } from './ajustes-inventario.repository';
import type { CreateAjusteInventarioDto } from '../types';
import type { QueryAjusteInput } from '../schemas';

function generarNumeroAjuste(): string {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `AJ-${anio}${mes}-${random}`;
}

export const ajustesInventarioService = {
  async getAll(params: QueryAjusteInput) {
    return ajustesInventarioRepository.findMany(params);
  },

  async getById(id: string) {
    const ajuste = await ajustesInventarioRepository.findById(id);
    if (!ajuste) throw AppError.notFound('Ajuste de inventario');
    return ajuste;
  },

  async create(data: CreateAjusteInventarioDto, usuarioId: number) {
    const numero = generarNumeroAjuste();
    return ajustesInventarioRepository.create(data, numero, usuarioId);
  },

  async aplicar(id: string) {
    const ajuste = await this.getById(id);
    if (ajuste.estado !== 'borrador') throw AppError.badRequest('Solo se pueden aplicar ajustes en borrador');
    return ajustesInventarioRepository.aplicar(id);
  },

  async anular(id: string) {
    const ajuste = await this.getById(id);
    if (ajuste.estado === 'anulado') throw AppError.badRequest('El ajuste ya está anulado');
    return ajustesInventarioRepository.anular(id);
  },
};

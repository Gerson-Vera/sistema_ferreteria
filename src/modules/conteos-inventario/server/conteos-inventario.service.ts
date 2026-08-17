import { AppError } from '@/lib/errors/AppError';
import { conteosInventarioRepository } from './conteos-inventario.repository';
import type { CreateConteoDto, RegistrarConteoItemDto } from '../types';
import type { QueryConteoInput } from '../schemas';

function generarNumeroConteo(): string {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `CT-${anio}${mes}-${random}`;
}

export const conteosInventarioService = {
  async getAll(params: QueryConteoInput) {
    return conteosInventarioRepository.findMany(params);
  },

  async getById(id: string) {
    const conteo = await conteosInventarioRepository.findById(id);
    if (!conteo) throw AppError.notFound('Conteo');
    return conteo;
  },

  async create(data: CreateConteoDto, usuarioId: number) {
    const numero = generarNumeroConteo();
    return conteosInventarioRepository.create(data, numero, usuarioId);
  },

  async registrar(id: string, items: RegistrarConteoItemDto[]) {
    const conteo = await this.getById(id);
    if (conteo.estado !== 'abierto') {
      throw AppError.badRequest('Solo se pueden registrar conteos en planillas abiertas');
    }
    return conteosInventarioRepository.registrar(id, items);
  },

  async aplicar(id: string, usuarioId: number) {
    const conteo = await this.getById(id);
    if (conteo.estado !== 'abierto') {
      throw AppError.badRequest('Solo se pueden aplicar planillas abiertas');
    }
    if (conteo.contados === 0) {
      throw AppError.badRequest('No hay productos contados; registre el conteo físico antes de aplicar');
    }
    return conteosInventarioRepository.aplicar(id, usuarioId);
  },

  async anular(id: string) {
    const conteo = await this.getById(id);
    if (conteo.estado !== 'abierto') {
      throw AppError.badRequest('Solo se pueden anular planillas abiertas');
    }
    return conteosInventarioRepository.anular(id);
  },
};

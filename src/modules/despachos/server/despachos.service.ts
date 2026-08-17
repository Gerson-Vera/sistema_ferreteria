import { AppError } from '@/lib/errors/AppError';
import { despachosRepository } from './despachos.repository';
import type { CreateDespachoDto, EstadoDespacho } from '../types';
import type { QueryDespachoInput } from '../schemas';

function generarNumeroDespacho(): string {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `DE-${anio}${mes}-${random}`;
}

/** Transiciones válidas del flujo de despacho. */
const SIGUIENTE: Partial<Record<EstadoDespacho, EstadoDespacho>> = {
  pendiente: 'en_preparacion',
  en_preparacion: 'despachado',
  despachado: 'entregado',
};

export const despachosService = {
  async getAll(params: QueryDespachoInput) {
    return despachosRepository.findMany(params);
  },

  async getById(id: string) {
    const despacho = await despachosRepository.findById(id);
    if (!despacho) throw AppError.notFound('Despacho');
    return despacho;
  },

  async create(data: CreateDespachoDto, usuarioId: number) {
    const existente = await despachosRepository.findActivoPorVenta(parseInt(data.ventaId));
    if (existente) {
      throw AppError.conflict(`La venta ya tiene el despacho ${existente.numero} en curso`);
    }
    const numero = generarNumeroDespacho();
    return despachosRepository.create(data, numero, usuarioId);
  },

  /** Avanza el despacho al siguiente estado del flujo. */
  async avanzar(id: string) {
    const despacho = await this.getById(id);
    const siguiente = SIGUIENTE[despacho.estado];
    if (!siguiente) {
      throw AppError.badRequest(`Un despacho ${despacho.estado} no puede avanzar de estado`);
    }
    return despachosRepository.cambiarEstado(id, siguiente);
  },

  async anular(id: string) {
    const despacho = await this.getById(id);
    if (despacho.estado === 'entregado') {
      throw AppError.badRequest('No se puede anular un despacho ya entregado');
    }
    if (despacho.estado === 'anulado') {
      throw AppError.badRequest('El despacho ya está anulado');
    }
    return despachosRepository.cambiarEstado(id, 'anulado');
  },
};

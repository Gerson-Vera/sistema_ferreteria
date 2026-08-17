import { AppError } from '@/lib/errors/AppError';
import { devolucionesRepository } from './devoluciones.repository';
import type { CreateDevolucionDto, TipoDevolucion } from '../types';
import type { QueryDevolucionInput } from '../schemas';

function generarNumeroDevolucion(tipo: TipoDevolucion): string {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  const prefijo = tipo === 'venta' ? 'DV' : 'DC';
  return `${prefijo}-${anio}${mes}-${random}`;
}

export const devolucionesService = {
  async getAll(params: QueryDevolucionInput) {
    return devolucionesRepository.findMany(params);
  },

  async getById(id: string, tipo: TipoDevolucion) {
    const devolucion = await devolucionesRepository.findById(id, tipo);
    if (!devolucion) throw AppError.notFound('Devolución');
    return devolucion;
  },

  async create(data: CreateDevolucionDto, usuarioId: number) {
    const numero = generarNumeroDevolucion(data.tipo);
    return data.tipo === 'venta'
      ? devolucionesRepository.createVenta(data, numero, usuarioId)
      : devolucionesRepository.createCompra(data, numero, usuarioId);
  },

  async anular(id: string, tipo: TipoDevolucion, usuarioId: number) {
    const devolucion = await this.getById(id, tipo);
    if (devolucion.estado === 'anulada') throw AppError.badRequest('La devolución ya está anulada');
    return devolucionesRepository.anular(id, tipo, usuarioId);
  },
};

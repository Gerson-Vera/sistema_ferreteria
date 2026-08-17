import { AppError } from '@/lib/errors/AppError';
import { transferenciasRepository } from './transferencias.repository';
import type { CreateTransferenciaDto } from '../types';
import type { QueryTransferenciaInput } from '../schemas';

function generarNumeroTransferencia(): string {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `TR-${anio}${mes}-${random}`;
}

export const transferenciasService = {
  async getAll(params: QueryTransferenciaInput) {
    return transferenciasRepository.findMany(params);
  },

  async getById(id: string) {
    const transferencia = await transferenciasRepository.findById(id);
    if (!transferencia) throw AppError.notFound('Transferencia');
    return transferencia;
  },

  async create(data: CreateTransferenciaDto, usuarioId: number) {
    if (data.almacenOrigenId === data.almacenDestinoId) {
      throw AppError.badRequest('El almacén de origen y destino deben ser distintos');
    }
    const numero = generarNumeroTransferencia();
    return transferenciasRepository.create(data, numero, usuarioId);
  },

  async enviar(id: string, usuarioId: number) {
    const transf = await this.getById(id);
    if (transf.estado !== 'pendiente') {
      throw AppError.badRequest('Solo se pueden enviar transferencias pendientes');
    }
    return transferenciasRepository.enviar(id, usuarioId);
  },

  async recibir(id: string, usuarioId: number) {
    const transf = await this.getById(id);
    if (transf.estado !== 'enviada') {
      throw AppError.badRequest('Solo se pueden recibir transferencias enviadas');
    }
    return transferenciasRepository.recibir(id, usuarioId);
  },

  async anular(id: string, usuarioId: number) {
    const transf = await this.getById(id);
    if (transf.estado === 'recibida') {
      throw AppError.badRequest('No se puede anular una transferencia ya recibida');
    }
    if (transf.estado === 'anulada') {
      throw AppError.badRequest('La transferencia ya está anulada');
    }
    return transferenciasRepository.anular(id, usuarioId);
  },
};

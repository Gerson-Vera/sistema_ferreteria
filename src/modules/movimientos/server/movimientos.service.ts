import { movimientosRepository } from './movimientos.repository';
import type { QueryMovimientoInput } from '../schemas';

export const movimientosService = {
  async getAll(params: QueryMovimientoInput) {
    return movimientosRepository.findMany(params);
  },
};

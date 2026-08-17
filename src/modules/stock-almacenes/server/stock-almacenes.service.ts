import { stockAlmacenesRepository } from './stock-almacenes.repository';
import type { QueryStockAlmacenInput } from '../schemas';

export const stockAlmacenesService = {
  async getAll(params: QueryStockAlmacenInput) {
    return stockAlmacenesRepository.findMany(params);
  },
};

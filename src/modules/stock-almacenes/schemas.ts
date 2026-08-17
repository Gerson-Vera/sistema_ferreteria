import { z } from 'zod';

export const queryStockAlmacenSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(20),
  almacenId: z.string().optional(),
  productoId: z.string().optional(),
  search: z.string().optional(),
});

export type QueryStockAlmacenInput = z.infer<typeof queryStockAlmacenSchema>;

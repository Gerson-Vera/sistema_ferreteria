import { z } from 'zod';

export const queryMovimientoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  productoId: z.string().optional(),
  almacenId: z.string().optional(),
  tipo: z.enum([
    'entrada_compra', 'salida_venta',
    'entrada_ajuste', 'salida_ajuste',
    'entrada_manual', 'salida_manual',
    'entrada_transferencia', 'salida_transferencia',
    'entrada_devolucion_venta', 'salida_devolucion_compra',
  ]).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});

export type QueryMovimientoInput = z.infer<typeof queryMovimientoSchema>;

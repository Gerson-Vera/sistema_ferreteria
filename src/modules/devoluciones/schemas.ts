import { z } from 'zod';

const devolucionItemSchema = z.object({
  productoId: z.string().min(1, 'Producto requerido'),
  cantidad: z.number().int().positive('Cantidad debe ser mayor a 0'),
});

export const createDevolucionSchema = z.object({
  tipo: z.enum(['venta', 'compra']),
  referenciaId: z.string().min(1, 'Documento de referencia requerido'),
  almacenId: z.string().min(1, 'Almacén requerido'),
  motivo: z.string().min(3, 'Motivo requerido').max(200),
  observaciones: z.string().max(500).optional(),
  items: z.array(devolucionItemSchema).min(1, 'La devolución debe tener al menos un producto'),
});

export const queryDevolucionSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  tipo: z.enum(['venta', 'compra']).default('venta'),
  estado: z.enum(['registrada', 'anulada']).optional(),
});

export type CreateDevolucionInput = z.infer<typeof createDevolucionSchema>;
export type QueryDevolucionInput = z.infer<typeof queryDevolucionSchema>;

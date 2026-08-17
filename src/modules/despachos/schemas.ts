import { z } from 'zod';

export const createDespachoSchema = z.object({
  ventaId: z.string().min(1, 'Venta requerida'),
  direccionEntrega: z.string().min(5, 'Dirección de entrega requerida').max(300),
  contacto: z.string().max(100).optional(),
  telefono: z.string().max(30).optional(),
  transportista: z.string().max(100).optional(),
  observaciones: z.string().max(500).optional(),
});

export const queryDespachoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  estado: z.enum(['pendiente', 'en_preparacion', 'despachado', 'entregado', 'anulado']).optional(),
});

export type CreateDespachoInput = z.infer<typeof createDespachoSchema>;
export type QueryDespachoInput = z.infer<typeof queryDespachoSchema>;

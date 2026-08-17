import { z } from 'zod';

const transferenciaItemSchema = z.object({
  productoId: z.string().min(1, 'Producto requerido'),
  cantidad: z.number().int().positive('Cantidad debe ser mayor a 0'),
});

export const createTransferenciaSchema = z.object({
  almacenOrigenId: z.string().min(1, 'Almacén de origen requerido'),
  almacenDestinoId: z.string().min(1, 'Almacén de destino requerido'),
  observaciones: z.string().max(500).optional(),
  items: z.array(transferenciaItemSchema).min(1, 'La transferencia debe tener al menos un producto'),
}).refine(d => d.almacenOrigenId !== d.almacenDestinoId, {
  message: 'El almacén de origen y destino deben ser distintos',
  path: ['almacenDestinoId'],
});

export const queryTransferenciaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  estado: z.enum(['pendiente', 'enviada', 'recibida', 'anulada']).optional(),
  almacenId: z.string().optional(),
});

export type CreateTransferenciaInput = z.infer<typeof createTransferenciaSchema>;
export type QueryTransferenciaInput = z.infer<typeof queryTransferenciaSchema>;

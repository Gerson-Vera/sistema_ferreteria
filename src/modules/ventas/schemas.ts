import { z } from 'zod';

const ventaItemSchema = z.object({
  productoId: z.string().min(1, 'ID de producto requerido'),
  cantidad: z.number().int().positive('Cantidad debe ser mayor a 0'),
  precioUnitario: z.number().positive('Precio debe ser mayor a 0'),
  unidadMedidaId: z.string().optional(),
});

export const createVentaSchema = z.object({
  clienteId: z.string().min(1, 'ID de cliente requerido'),
  tipoPagoId: z.string().optional(),
  almacenId: z.string().min(1, 'Almacén requerido'),
  items: z.array(ventaItemSchema).min(1, 'La venta debe tener al menos un item'),
  observaciones: z.string().max(500).optional(),
});

export const queryVentaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  clienteId: z.string().optional(),
  estado: z.enum(['pendiente', 'completada', 'anulada']).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});

export type CreateVentaInput = z.infer<typeof createVentaSchema>;
export type QueryVentaInput = z.infer<typeof queryVentaSchema>;

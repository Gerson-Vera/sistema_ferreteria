import { z } from 'zod';

const compraItemSchema = z.object({
  productoId: z.string().min(1, 'ID de producto requerido'),
  cantidad: z.number().int().positive('Cantidad debe ser mayor a 0'),
  costoUnitario: z.number().positive('Costo debe ser mayor a 0'),
  unidadMedidaId: z.string().optional(),
});

export const createCompraSchema = z.object({
  proveedorId: z.string().min(1, 'ID de proveedor requerido'),
  tipoPagoId: z.string().optional(),
  almacenId: z.string().min(1, 'Almacén requerido'),
  items: z.array(compraItemSchema).min(1, 'La compra debe tener al menos un item'),
  numeroFactura: z.string().max(50).optional(),
  observaciones: z.string().max(500).optional(),
});

export const queryCompraSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  proveedorId: z.string().optional(),
  estado: z.enum(['pendiente', 'recibida', 'anulada']).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});

export type CreateCompraInput = z.infer<typeof createCompraSchema>;
export type QueryCompraInput = z.infer<typeof queryCompraSchema>;

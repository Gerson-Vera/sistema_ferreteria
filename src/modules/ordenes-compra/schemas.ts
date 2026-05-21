import { z } from 'zod';

export const createOrdenItemSchema = z.object({
  productoId: z.string().optional(),
  descripcion: z.string().min(1, 'Descripción requerida').max(300),
  detalles: z.string().max(500).optional(),
  cantidad: z.number().int().positive('Cantidad debe ser mayor a 0'),
  costoUnitario: z.number().positive('Costo debe ser mayor a 0'),
  esNuevoProducto: z.boolean(),
  precioVentaSugerido: z.number().positive().optional(),
  categoriaId: z.string().optional(),
});

export const createOrdenCompraSchema = z.object({
  proveedorId: z.string().min(1, 'Proveedor requerido'),
  observaciones: z.string().max(1000).optional(),
  items: z.array(createOrdenItemSchema).min(1, 'Debe tener al menos un ítem'),
});

export const queryOrdenSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(20),
  estado: z.enum(['borrador', 'enviada', 'recibida', 'anulada']).optional(),
  proveedorId: z.string().optional(),
  search: z.string().optional(),
});

export type CreateOrdenCompraInput = z.infer<typeof createOrdenCompraSchema>;
export type QueryOrdenInput = z.infer<typeof queryOrdenSchema>;

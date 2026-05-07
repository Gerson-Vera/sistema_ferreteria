import { z } from 'zod';

const ajusteItemSchema = z.object({
  productoId: z.string().min(1, 'Producto requerido'),
  stockFisico: z.number().int().min(0, 'Stock físico no puede ser negativo'),
});

export const createAjusteSchema = z.object({
  motivo: z.string().min(3, 'Motivo requerido').max(200),
  observaciones: z.string().max(500).optional(),
  items: z.array(ajusteItemSchema).min(1, 'El ajuste debe tener al menos un producto'),
});

export const queryAjusteSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  estado: z.enum(['borrador', 'aplicado', 'anulado']).optional(),
});

export type CreateAjusteInput = z.infer<typeof createAjusteSchema>;
export type QueryAjusteInput = z.infer<typeof queryAjusteSchema>;

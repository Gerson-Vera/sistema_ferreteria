import { z } from 'zod';

export const createUnidadMedidaSchema = z.object({
  codigo: z.string().min(1, 'Código requerido').max(10).toUpperCase(),
  nombre: z.string().min(1, 'Nombre requerido').max(100),
});

export const updateUnidadMedidaSchema = createUnidadMedidaSchema.partial();

export const unidadMedidaQuerySchema = z.object({
  activo: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : undefined),
    z.boolean().optional(),
  ),
});

export type CreateUnidadMedidaInput = z.infer<typeof createUnidadMedidaSchema>;
export type UpdateUnidadMedidaInput = z.infer<typeof updateUnidadMedidaSchema>;
export type UnidadMedidaQueryInput = z.infer<typeof unidadMedidaQuerySchema>;

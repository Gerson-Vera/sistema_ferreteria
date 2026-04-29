import { z } from 'zod';

export const createMarcaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100),
});

export const updateMarcaSchema = createMarcaSchema.partial();

export const marcaQuerySchema = z.object({
  activo: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : undefined),
    z.boolean().optional(),
  ),
});

export type CreateMarcaInput = z.infer<typeof createMarcaSchema>;
export type UpdateMarcaInput = z.infer<typeof updateMarcaSchema>;
export type MarcaQueryInput = z.infer<typeof marcaQuerySchema>;

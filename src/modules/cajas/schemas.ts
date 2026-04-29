import { z } from 'zod';

export const createCajaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(150),
  descripcion: z.string().max(300).optional(),
});

export const updateCajaSchema = createCajaSchema.partial();

export const cajaQuerySchema = z.object({
  activo: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : undefined),
    z.boolean().optional(),
  ),
});

export type CreateCajaInput = z.infer<typeof createCajaSchema>;
export type UpdateCajaInput = z.infer<typeof updateCajaSchema>;
export type CajaQueryInput = z.infer<typeof cajaQuerySchema>;

import { z } from 'zod';

export const createCategoriaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100),
  descripcion: z.string().max(300).optional(),
});

export const updateCategoriaSchema = createCategoriaSchema.partial();

export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>;

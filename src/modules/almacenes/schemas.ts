import { z } from 'zod';

export const createAlmacenSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(150),
  descripcion: z.string().max(300).optional(),
  direccion: z.string().max(300).optional(),
});

export const updateAlmacenSchema = createAlmacenSchema.partial();

export const almacenQuerySchema = z.object({
  activo: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : undefined),
    z.boolean().optional(),
  ),
});

export type CreateAlmacenInput = z.infer<typeof createAlmacenSchema>;
export type UpdateAlmacenInput = z.infer<typeof updateAlmacenSchema>;
export type AlmacenQueryInput = z.infer<typeof almacenQuerySchema>;

import { z } from 'zod';

export const createProveedorSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(200),
  ruc: z.string().length(11, 'RUC debe tener 11 dígitos').regex(/^\d+$/, 'RUC solo dígitos').optional(),
  contacto: z.string().max(100).optional(),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string().max(20).optional(),
  direccion: z.string().max(300).optional(),
});

export const updateProveedorSchema = createProveedorSchema.partial();

export type CreateProveedorInput = z.infer<typeof createProveedorSchema>;
export type UpdateProveedorInput = z.infer<typeof updateProveedorSchema>;

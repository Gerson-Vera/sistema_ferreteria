import { z } from 'zod';

export const createClienteSchema = z.object({
  tipo: z.enum(['natural', 'juridica']),
  tipoDocumento: z.enum(['DNI', 'RUC', 'CE', 'Carnet_Extranjeria']),
  numeroDocumento: z.string().min(8).max(11),
  nombre: z.string().min(1, 'Nombre requerido').max(200),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string().max(20).optional(),
  direccion: z.string().max(300).optional(),
});

export const updateClienteSchema = createClienteSchema.partial();

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;

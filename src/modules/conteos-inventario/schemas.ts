import { z } from 'zod';

export const createConteoSchema = z.object({
  almacenId: z.string().min(1, 'Almacén requerido'),
  categoriaId: z.string().optional(),
  observaciones: z.string().max(500).optional(),
});

export const registrarConteoSchema = z.object({
  items: z.array(z.object({
    itemId: z.string().min(1),
    stockFisico: z.number().int().min(0, 'El conteo no puede ser negativo'),
  })).min(1, 'Debe registrar al menos un conteo'),
});

export const queryConteoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  almacenId: z.string().optional(),
  estado: z.enum(['abierto', 'aplicado', 'anulado']).optional(),
});

export type CreateConteoInput = z.infer<typeof createConteoSchema>;
export type RegistrarConteoInput = z.infer<typeof registrarConteoSchema>;
export type QueryConteoInput = z.infer<typeof queryConteoSchema>;

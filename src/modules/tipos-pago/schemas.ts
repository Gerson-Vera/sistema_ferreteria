import { z } from 'zod';

export const createTipoPagoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100),
});

export const updateTipoPagoSchema = createTipoPagoSchema.partial();

export const tipoPagoQuerySchema = z.object({
  activo: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : undefined),
    z.boolean().optional(),
  ),
});

export type CreateTipoPagoInput = z.infer<typeof createTipoPagoSchema>;
export type UpdateTipoPagoInput = z.infer<typeof updateTipoPagoSchema>;
export type TipoPagoQueryInput = z.infer<typeof tipoPagoQuerySchema>;

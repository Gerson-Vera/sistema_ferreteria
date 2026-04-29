import { z } from 'zod';

export const createProductoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(200),
  descripcion: z.string().max(500).optional(),
  precioCompra: z.number().positive('Precio de compra debe ser mayor a 0'),
  precioVenta: z.number().positive('Precio de venta debe ser mayor a 0'),
  stock: z.number().int().min(0, 'Stock no puede ser negativo'),
  stockMinimo: z.number().int().min(0, 'Stock mínimo no puede ser negativo'),
  categoriaId: z.string().min(1, 'Categoría requerida'),
  proveedorId: z.string().min(1).optional(),
});

export const updateProductoSchema = createProductoSchema.partial();

export const queryProductoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  categoriaId: z.string().min(1).optional(),
  activo: z.preprocess(
    v => v === 'true' ? true : v === 'false' ? false : undefined,
    z.boolean().optional()
  ),
  orderBy: z.enum(['nombre', 'sku', 'stock', 'precioVenta', 'creadoEn']).default('nombre'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateProductoInput = z.infer<typeof createProductoSchema>;
export type UpdateProductoInput = z.infer<typeof updateProductoSchema>;
export type QueryProductoInput = z.infer<typeof queryProductoSchema>;

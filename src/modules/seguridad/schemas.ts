import { z } from 'zod';

export const createUsuarioSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50)
    .regex(/^\w+$/, 'Solo letras, números y guión bajo'),
  email: z.string().email('Email inválido'),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  roles: z.array(z.string()).optional(),
});

export const updateUsuarioSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  roles: z.array(z.string()).optional(),
});

export const createRolSchema = z.object({
  codigo: z.string().min(2).max(50).transform(v => v.toUpperCase()),
  descripcion: z.string().min(2, 'Mínimo 2 caracteres').max(200),
});

export const updateRolSchema = z.object({
  descripcion: z.string().min(2).max(200).optional(),
  menus: z.array(z.string()).optional(),
});

export const createMenuSchema = z.object({
  codigo: z.string().min(2).max(50).transform(v => v.toUpperCase()),
  descripcion: z.string().min(2).max(200),
  url: z.string().max(200).optional(),
  icono: z.string().max(100).optional(),
  orden: z.number().int().min(0).default(0),
  menuPadreId: z.string().optional(),
});

export const updateMenuSchema = z.object({
  descripcion: z.string().min(2).max(200).optional(),
  url: z.string().max(200).nullable().optional(),
  icono: z.string().max(100).nullable().optional(),
  orden: z.number().int().min(0).optional(),
  menuPadreId: z.string().nullable().optional(),
});

export const queryUsuariosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  rolId: z.string().optional(),
  estado: z.enum(['todos', 'activo', 'inactivo']).default('todos'),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
export type CreateRolInput = z.infer<typeof createRolSchema>;
export type UpdateRolInput = z.infer<typeof updateRolSchema>;
export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
export type QueryUsuariosInput = z.infer<typeof queryUsuariosSchema>;

export type RolBasico = {
  id: string;
  codigo: string;
  descripcion: string;
  estado: boolean;
};

export type UsuarioAdmin = {
  id: string;
  username: string;
  email: string;
  nombre: string;
  estado: boolean;
  roles: RolBasico[];
  creadoEn: Date;
};

export type RolAdmin = {
  id: string;
  codigo: string;
  descripcion: string;
  estado: boolean;
  totalUsuarios: number;
  menus: { id: string; codigo: string; descripcion: string }[];
  creadoEn: Date;
};

export type MenuAdmin = {
  id: string;
  codigo: string;
  descripcion: string;
  url: string | null;
  icono: string | null;
  orden: number;
  menuPadreId: string | null;
  estado: boolean;
  hijos: MenuAdmin[];
  creadoEn: Date;
};

export type CreateUsuarioDto = {
  username: string;
  email: string;
  nombre: string;
  password: string;
  roles?: string[];
};

export type UpdateUsuarioDto = {
  nombre?: string;
  email?: string;
  password?: string;
  roles?: string[];
};

export type CreateRolDto = {
  codigo: string;
  descripcion: string;
};

export type UpdateRolDto = {
  descripcion?: string;
  menus?: string[];
};

export type CreateMenuDto = {
  codigo: string;
  descripcion: string;
  url?: string;
  icono?: string;
  orden?: number;
  menuPadreId?: string;
};

export type UpdateMenuDto = {
  descripcion?: string;
  url?: string | null;
  icono?: string | null;
  orden?: number;
  menuPadreId?: string | null;
};

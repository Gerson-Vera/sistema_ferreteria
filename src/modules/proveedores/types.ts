export type Proveedor = {
  id: string;
  codigo: string;
  nombre: string;
  ruc: string | null;
  contacto: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateProveedorDto = {
  nombre: string;
  ruc?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
};

export type UpdateProveedorDto = Partial<CreateProveedorDto>;

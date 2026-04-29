export type Almacen = {
  id: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateAlmacenDto = {
  nombre: string;
  descripcion?: string;
  direccion?: string;
};

export type UpdateAlmacenDto = Partial<CreateAlmacenDto>;

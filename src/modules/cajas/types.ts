export type Caja = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateCajaDto = {
  nombre: string;
  descripcion?: string;
};

export type UpdateCajaDto = Partial<CreateCajaDto>;

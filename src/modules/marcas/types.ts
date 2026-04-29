export type Marca = {
  id: string;
  nombre: string;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateMarcaDto = {
  nombre: string;
};

export type UpdateMarcaDto = Partial<CreateMarcaDto>;

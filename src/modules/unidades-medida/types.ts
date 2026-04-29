export type UnidadMedida = {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateUnidadMedidaDto = {
  codigo: string;
  nombre: string;
};

export type UpdateUnidadMedidaDto = Partial<CreateUnidadMedidaDto>;

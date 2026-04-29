export type TipoPago = {
  id: string;
  nombre: string;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateTipoPagoDto = {
  nombre: string;
};

export type UpdateTipoPagoDto = Partial<CreateTipoPagoDto>;

export type EstadoAjuste = 'borrador' | 'aplicado' | 'anulado';

export type AjusteInventarioItem = {
  id: string;
  ajusteId: string;
  productoId: string;
  stockSistema: number;
  stockFisico: number;
  diferencia: number;
};

export type AjusteInventario = {
  id: string;
  numero: string;
  motivo: string;
  usuarioId: string;
  estado: EstadoAjuste;
  observaciones: string | null;
  items: AjusteInventarioItem[];
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateAjusteItemDto = {
  productoId: string;
  stockFisico: number;
};

export type CreateAjusteInventarioDto = {
  motivo: string;
  observaciones?: string;
  items: CreateAjusteItemDto[];
};

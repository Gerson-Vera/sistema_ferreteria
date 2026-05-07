export type TipoMovimiento =
  | 'entrada_compra'
  | 'salida_venta'
  | 'entrada_ajuste'
  | 'salida_ajuste'
  | 'entrada_manual'
  | 'salida_manual';

export type MovimientoInventario = {
  id: string;
  productoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  referenciaId: string | null;
  referenciaTipo: string | null;
  observacion: string | null;
  usuarioId: string;
  creadoEn: Date;
};

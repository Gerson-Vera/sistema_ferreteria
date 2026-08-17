export type TipoMovimiento =
  | 'entrada_compra'
  | 'salida_venta'
  | 'entrada_ajuste'
  | 'salida_ajuste'
  | 'entrada_manual'
  | 'salida_manual'
  | 'entrada_transferencia'
  | 'salida_transferencia'
  | 'entrada_devolucion_venta'
  | 'salida_devolucion_compra';

export type MovimientoInventario = {
  id: string;
  productoId: string;
  productoNombre: string;
  almacenId: string | null;
  almacenNombre: string | null;
  tipo: TipoMovimiento;
  cantidad: number;
  costoUnitario: number | null;
  stockAnterior: number;
  stockNuevo: number;
  referenciaId: string | null;
  referenciaTipo: string | null;
  observacion: string | null;
  usuarioId: string;
  creadoEn: Date;
};

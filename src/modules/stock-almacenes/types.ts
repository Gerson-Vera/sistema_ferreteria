export type StockAlmacen = {
  id: string;
  productoId: string;
  productoNombre: string;
  productoSku: string;
  stockMinimo: number;
  costoPromedio: number;
  almacenId: string;
  almacenNombre: string;
  stock: number;
  /** Comprometido por transferencias pendientes. */
  stockReservado: number;
  /** stock − stockReservado. */
  disponible: number;
  /** stock × costo promedio del producto. */
  valor: number;
  actualizadoEn: Date;
};

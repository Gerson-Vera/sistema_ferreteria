export type Producto = {
  id: string;
  sku: string;
  codigoBarras: string | null;
  nombre: string;
  descripcion: string | null;
  img: string | null;
  precioCompra: number;
  precioVenta: number;
  costoPromedio: number;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  puntoReorden: number;
  ubicacion: string | null;
  categoriaId: string;
  marcaId: string | null;
  unidadMedidaId: string | null;
  proveedorId: string | null;
  almacenId: string | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateProductoDto = {
  nombre: string;
  descripcion?: string;
  codigoBarras?: string;
  img?: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  stockMaximo?: number;
  puntoReorden?: number;
  ubicacion?: string;
  categoriaId: string;
  marcaId?: string;
  unidadMedidaId?: string;
  proveedorId?: string;
  almacenId?: string;
};

export type UpdateProductoDto = Partial<CreateProductoDto>;

/** Unidad alternativa del producto: 1 <unidad> = <factor> unidades base. */
export type ProductoConversion = {
  id: string;
  unidadMedidaId: string;
  unidadCodigo: string;
  unidadNombre: string;
  factor: number;
};

export type SetConversionDto = {
  unidadMedidaId: string;
  factor: number;
};

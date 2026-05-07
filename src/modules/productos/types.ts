export type Producto = {
  id: string;
  sku: string;
  codigoBarras: string | null;
  nombre: string;
  descripcion: string | null;
  img: string | null;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
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
  ubicacion?: string;
  categoriaId: string;
  marcaId?: string;
  unidadMedidaId?: string;
  proveedorId?: string;
  almacenId?: string;
};

export type UpdateProductoDto = Partial<CreateProductoDto>;

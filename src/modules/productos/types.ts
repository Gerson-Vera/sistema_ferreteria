export type Producto = {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  categoriaId: string;
  proveedorId: string | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateProductoDto = {
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  categoriaId: string;
  proveedorId?: string;
};

export type UpdateProductoDto = Partial<CreateProductoDto>;

export type Categoria = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateCategoriaDto = {
  nombre: string;
  descripcion?: string;
};

export type UpdateCategoriaDto = Partial<CreateCategoriaDto>;

export type CategoriaConfig = {
  unidadMedidaId: string | null;
  almacenId: string | null;
  marcaIds: string[];
  proveedorIds: string[];
};

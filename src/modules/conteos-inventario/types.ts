export type EstadoConteo = 'abierto' | 'aplicado' | 'anulado';

export type ConteoItem = {
  id: string;
  conteoId: string;
  productoId: string;
  productoNombre: string;
  productoSku: string;
  /** Stock del sistema capturado al generar la planilla (unidades base). */
  stockSistema: number;
  /** Stock contado físicamente; null = aún sin contar. */
  stockFisico: number | null;
  /** stockFisico − stockSistema (null si aún no se contó). */
  diferencia: number | null;
};

export type Conteo = {
  id: string;
  numero: string;
  almacenId: string;
  almacenNombre: string;
  usuarioId: string;
  usuarioNombre: string;
  estado: EstadoConteo;
  observaciones: string | null;
  fechaAplicacion: Date | null;
  items: ConteoItem[];
  /** Ítems ya contados / total. */
  contados: number;
  totalItems: number;
  /** Ítems contados con diferencia ≠ 0. */
  conDiferencia: number;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateConteoDto = {
  almacenId: string;
  /** Limitar la planilla a una categoría (conteo cíclico por categoría). */
  categoriaId?: string;
  observaciones?: string;
};

export type RegistrarConteoItemDto = {
  itemId: string;
  stockFisico: number;
};

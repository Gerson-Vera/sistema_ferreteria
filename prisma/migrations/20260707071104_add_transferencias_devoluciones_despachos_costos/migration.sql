-- CreateEnum
CREATE TYPE "EstadoTransferencia" AS ENUM ('pendiente', 'enviada', 'recibida', 'anulada');

-- CreateEnum
CREATE TYPE "EstadoDevolucion" AS ENUM ('registrada', 'anulada');

-- CreateEnum
CREATE TYPE "EstadoDespacho" AS ENUM ('pendiente', 'en_preparacion', 'despachado', 'entregado', 'anulado');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoMovimiento" ADD VALUE 'entrada_transferencia';
ALTER TYPE "TipoMovimiento" ADD VALUE 'salida_transferencia';
ALTER TYPE "TipoMovimiento" ADD VALUE 'entrada_devolucion_venta';
ALTER TYPE "TipoMovimiento" ADD VALUE 'salida_devolucion_compra';

-- AlterTable
ALTER TABLE "movimientos_inventario" ADD COLUMN     "costo_unitario" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "costo_promedio" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "transferencias_almacen" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "almacen_origen_id" INTEGER NOT NULL,
    "almacen_destino_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "estado" "EstadoTransferencia" NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "fecha_envio" TIMESTAMP(3),
    "fecha_recepcion" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transferencias_almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferencia_almacen_items" (
    "id" SERIAL NOT NULL,
    "transferencia_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "transferencia_almacen_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devoluciones_venta" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "almacen_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "EstadoDevolucion" NOT NULL DEFAULT 'registrada',
    "observaciones" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devoluciones_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devolucion_venta_items" (
    "id" SERIAL NOT NULL,
    "devolucion_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "devolucion_venta_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devoluciones_compra" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "compra_id" INTEGER NOT NULL,
    "almacen_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "EstadoDevolucion" NOT NULL DEFAULT 'registrada',
    "observaciones" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devoluciones_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devolucion_compra_items" (
    "id" SERIAL NOT NULL,
    "devolucion_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "costo_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "devolucion_compra_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despachos" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "direccion_entrega" TEXT NOT NULL,
    "contacto" TEXT,
    "telefono" TEXT,
    "transportista" TEXT,
    "observaciones" TEXT,
    "estado" "EstadoDespacho" NOT NULL DEFAULT 'pendiente',
    "fecha_despacho" TIMESTAMP(3),
    "fecha_entrega" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "despachos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transferencias_almacen_numero_key" ON "transferencias_almacen"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "devoluciones_venta_numero_key" ON "devoluciones_venta"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "devoluciones_compra_numero_key" ON "devoluciones_compra"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "despachos_numero_key" ON "despachos"("numero");

-- AddForeignKey
ALTER TABLE "transferencias_almacen" ADD CONSTRAINT "transferencias_almacen_almacen_origen_id_fkey" FOREIGN KEY ("almacen_origen_id") REFERENCES "almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_almacen" ADD CONSTRAINT "transferencias_almacen_almacen_destino_id_fkey" FOREIGN KEY ("almacen_destino_id") REFERENCES "almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_almacen" ADD CONSTRAINT "transferencias_almacen_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencia_almacen_items" ADD CONSTRAINT "transferencia_almacen_items_transferencia_id_fkey" FOREIGN KEY ("transferencia_id") REFERENCES "transferencias_almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencia_almacen_items" ADD CONSTRAINT "transferencia_almacen_items_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_venta" ADD CONSTRAINT "devoluciones_venta_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_venta" ADD CONSTRAINT "devoluciones_venta_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_venta" ADD CONSTRAINT "devoluciones_venta_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_venta_items" ADD CONSTRAINT "devolucion_venta_items_devolucion_id_fkey" FOREIGN KEY ("devolucion_id") REFERENCES "devoluciones_venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_venta_items" ADD CONSTRAINT "devolucion_venta_items_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_compra" ADD CONSTRAINT "devoluciones_compra_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "compras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_compra" ADD CONSTRAINT "devoluciones_compra_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_compra" ADD CONSTRAINT "devoluciones_compra_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_compra_items" ADD CONSTRAINT "devolucion_compra_items_devolucion_id_fkey" FOREIGN KEY ("devolucion_id") REFERENCES "devoluciones_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_compra_items" ADD CONSTRAINT "devolucion_compra_items_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ══════════════════════════════════════════
--  BACKFILL DE DATOS
-- ══════════════════════════════════════════

-- 1. Costo promedio inicial = precio de compra actual
UPDATE "productos" SET "costo_promedio" = "precio_compra" WHERE "costo_promedio" = 0;

-- 2. Menús nuevos
INSERT INTO "menus" ("codigo", "descripcion", "url", "icono", "orden", "menu_padre_id", "estado", "creado_en", "actualizado_en")
SELECT 'TRANSFERENCIAS', 'Transferencias', '/dashboard/transferencias', 'SwapHoriz', 12, (SELECT "id" FROM "menus" WHERE "codigo" = 'INV'), true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "menus" WHERE "codigo" = 'TRANSFERENCIAS');

INSERT INTO "menus" ("codigo", "descripcion", "url", "icono", "orden", "menu_padre_id", "estado", "creado_en", "actualizado_en")
SELECT 'DEVOLUCIONES', 'Devoluciones', '/dashboard/devoluciones', 'AssignmentReturn', 4, (SELECT "id" FROM "menus" WHERE "codigo" = 'S_VENTAS'), true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "menus" WHERE "codigo" = 'DEVOLUCIONES');

INSERT INTO "menus" ("codigo", "descripcion", "url", "icono", "orden", "menu_padre_id", "estado", "creado_en", "actualizado_en")
SELECT 'DESPACHOS', 'Despachos', '/dashboard/despachos', 'LocalShipping', 5, (SELECT "id" FROM "menus" WHERE "codigo" = 'S_VENTAS'), true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "menus" WHERE "codigo" = 'DESPACHOS');

-- 3. Accesos por rol (ADMIN tiene acceso total sin registro)
--    ALMACEN: transferencias | VENDEDOR: devoluciones y despachos
INSERT INTO "menu_roles" ("menu_id", "rol_id", "estado", "creado_en")
SELECT m."id", r."id", true, CURRENT_TIMESTAMP
FROM "menus" m JOIN "roles" r ON (
  (m."codigo" = 'TRANSFERENCIAS' AND r."codigo" = 'ALMACEN') OR
  (m."codigo" IN ('DEVOLUCIONES', 'DESPACHOS') AND r."codigo" = 'VENDEDOR')
)
WHERE NOT EXISTS (SELECT 1 FROM "menu_roles" mr WHERE mr."menu_id" = m."id" AND mr."rol_id" = r."id");

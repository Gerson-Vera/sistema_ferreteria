-- AlterTable
ALTER TABLE "ajustes_inventario" ADD COLUMN     "almacen_id" INTEGER;

-- AlterTable
ALTER TABLE "compras" ADD COLUMN     "almacen_id" INTEGER;

-- AlterTable
ALTER TABLE "movimientos_inventario" ADD COLUMN     "almacen_id" INTEGER;

-- AlterTable
ALTER TABLE "ventas" ADD COLUMN     "almacen_id" INTEGER;

-- CreateTable
CREATE TABLE "stock_almacenes" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "almacen_id" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_almacenes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_almacenes_producto_id_almacen_id_key" ON "stock_almacenes"("producto_id", "almacen_id");

-- AddForeignKey
ALTER TABLE "stock_almacenes" ADD CONSTRAINT "stock_almacenes_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_almacenes" ADD CONSTRAINT "stock_almacenes_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ajustes_inventario" ADD CONSTRAINT "ajustes_inventario_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ══════════════════════════════════════════
--  BACKFILL DE DATOS
-- ══════════════════════════════════════════

-- 1. Asegurar que exista al menos un almacén
INSERT INTO "almacenes" ("nombre", "descripcion", "estado", "creado_en", "actualizado_en")
SELECT 'Almacén Principal', 'Creado automáticamente al activar stock por almacén', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "almacenes");

-- 2. Poblar stock_almacenes con el stock actual de cada producto
--    (usa el almacén asignado al producto o el primer almacén activo)
INSERT INTO "stock_almacenes" ("producto_id", "almacen_id", "stock", "creado_en", "actualizado_en")
SELECT p."id",
       COALESCE(
         p."almacen_id",
         (SELECT a."id" FROM "almacenes" a WHERE a."estado" = true ORDER BY a."id" LIMIT 1),
         (SELECT a."id" FROM "almacenes" a ORDER BY a."id" LIMIT 1)
       ),
       p."stock", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "productos" p;

-- 3. Menú "Stock por Almacén" bajo la sección Inventario
INSERT INTO "menus" ("codigo", "descripcion", "url", "icono", "orden", "menu_padre_id", "estado", "creado_en", "actualizado_en")
SELECT 'STOCK_ALMACEN', 'Stock por Almacén', '/dashboard/stock-almacenes', 'Warehouse', 6, (SELECT "id" FROM "menus" WHERE "codigo" = 'INV'), true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "menus" WHERE "codigo" = 'STOCK_ALMACEN');

-- 4. Acceso al menú para el rol ALMACEN (ADMIN tiene acceso total sin registro)
INSERT INTO "menu_roles" ("menu_id", "rol_id", "estado", "creado_en")
SELECT m."id", r."id", true, CURRENT_TIMESTAMP
FROM "menus" m, "roles" r
WHERE m."codigo" = 'STOCK_ALMACEN' AND r."codigo" = 'ALMACEN'
  AND NOT EXISTS (SELECT 1 FROM "menu_roles" mr WHERE mr."menu_id" = m."id" AND mr."rol_id" = r."id");

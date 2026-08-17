-- Conteos cíclicos / inventario físico
CREATE TYPE "EstadoConteo" AS ENUM ('abierto', 'aplicado', 'anulado');

CREATE TABLE "conteos_inventario" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "almacen_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "estado" "EstadoConteo" NOT NULL DEFAULT 'abierto',
    "observaciones" TEXT,
    "fecha_aplicacion" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conteos_inventario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conteo_inventario_items" (
    "id" SERIAL NOT NULL,
    "conteo_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "stock_sistema" INTEGER NOT NULL,
    "stock_fisico" INTEGER,

    CONSTRAINT "conteo_inventario_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conteos_inventario_numero_key" ON "conteos_inventario"("numero");
CREATE UNIQUE INDEX "conteo_inventario_items_conteo_id_producto_id_key" ON "conteo_inventario_items"("conteo_id", "producto_id");

ALTER TABLE "conteos_inventario" ADD CONSTRAINT "conteos_inventario_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conteos_inventario" ADD CONSTRAINT "conteos_inventario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conteo_inventario_items" ADD CONSTRAINT "conteo_inventario_items_conteo_id_fkey" FOREIGN KEY ("conteo_id") REFERENCES "conteos_inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conteo_inventario_items" ADD CONSTRAINT "conteo_inventario_items_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Menú: Conteos de inventario (grupo INV), acceso para rol ALMACEN (ADMIN accede sin registro)
INSERT INTO "menus" ("codigo", "descripcion", "url", "icono", "orden", "menu_padre_id", "estado", "creado_en", "actualizado_en")
SELECT 'CONTEOS', 'Conteos de Inventario', '/dashboard/conteos-inventario', 'FactCheck', 13, (SELECT "id" FROM "menus" WHERE "codigo" = 'INV'), true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "menus" WHERE "codigo" = 'CONTEOS');

INSERT INTO "menu_roles" ("menu_id", "rol_id", "estado", "creado_en")
SELECT m."id", r."id", true, CURRENT_TIMESTAMP
FROM "menus" m JOIN "roles" r ON m."codigo" = 'CONTEOS' AND r."codigo" = 'ALMACEN'
WHERE NOT EXISTS (SELECT 1 FROM "menu_roles" mr WHERE mr."menu_id" = m."id" AND mr."rol_id" = r."id");

# Sistema Ferretería — Flujos y Procesos de Inventario y Logística

Este documento explica **cómo funciona el sistema por dentro**: los procesos, los estados de cada documento y cómo cada operación afecta el stock, el kardex y los costos. Está dirigido a administradores y a quien necesite entender la lógica del negocio.

---

## 1. Conceptos base

### 1.1 Stock por almacén
- Cada producto tiene su stock controlado **por almacén** (tabla Stock por Almacén).
- El stock que se ve en la ficha del producto es el **total agregado** de todos los almacenes.
- Toda venta, compra, ajuste, transferencia, devolución y conteo indica **en qué almacén** ocurre.

### 1.2 Stock reservado y disponible
```
Disponible = Stock físico − Stock reservado
```
- Al crear una **transferencia** (aún no enviada), la mercadería queda **reservada** en el almacén de origen: sigue físicamente ahí, pero ya no se puede vender ni comprometer en otra transferencia.
- Las **ventas validan contra el disponible**, no contra el stock físico.
- Al enviar o anular la transferencia, la reserva se libera.

### 1.3 Unidades base y conversiones
- El stock **siempre se controla en la unidad base** del producto (ej. unidad).
- Un producto puede tener **unidades alternativas** con factor de conversión (ej. 1 Caja = 12 unidades).
- Los documentos (venta/compra) guardan la cantidad **en la unidad usada**; el stock y el kardex se mueven **en unidades base**:
  - Comprar 2 CJA (×12) → ingresan **24** unidades base.
  - Vender 1 CJA (×12) → salen **12** unidades base.
- Si se intenta vender/comprar en una unidad sin conversión configurada, el sistema lo rechaza.

### 1.4 Costo promedio ponderado (CP)
- Cada producto mantiene un **costo promedio** en unidades base.
- Solo las **entradas por compra** recalculan el CP:
```
Nuevo CP = (stock actual × CP + cantidad entrante × costo entrante) / (stock actual + cantidad entrante)
```
- Si se compra por caja, el costo se convierte a costo por unidad base antes de promediar (costo caja ÷ factor).
- Las salidas (ventas, transferencias, ajustes) **no cambian** el CP; se registran en el kardex valorizadas al CP vigente.

### 1.5 Kardex (Movimientos de Inventario)
Todo movimiento de stock queda registrado con: producto, almacén, tipo, cantidad (en unidades base), costo unitario, stock anterior/nuevo **del almacén**, referencia al documento origen y usuario.

Tipos de movimiento:

| Tipo | Origen |
|---|---|
| `entrada_compra` | Recepción de compra / OC |
| `salida_venta` | Venta |
| `entrada_ajuste` / `salida_ajuste` | Ajustes manuales y **conteos físicos** |
| `entrada_manual` / `salida_manual` | Movimientos manuales y reversas de devoluciones |
| `salida_transferencia` / `entrada_transferencia` | Transferencias entre almacenes |
| `entrada_devolucion_venta` | Cliente devuelve mercadería |
| `salida_devolucion_compra` | Se devuelve mercadería al proveedor |

---

## 2. Proceso de COMPRAS (con recepción parcial)

### 2.1 Flujo
```
        crear                    recibir (parcial)              recibir (saldo)
Compra ───────► PENDIENTE ─────────────────────► PARCIAL ─────────────────► RECIBIDA
                    │                               │
                    │ anular                        │ (no se puede anular:
                    ▼                               │  ya entró mercadería →
                 ANULADA                            │  usar Devolución de compra)
```

### 2.2 Reglas
1. **Crear compra** (`pendiente`): registra el documento con proveedor, almacén de destino e ítems (cantidad, costo, unidad). **No mueve stock**. Se envía correo al proveedor si tiene email.
2. **Recibir**: se indica **cuánto llegó de cada ítem** ("Recibir ahora" ≤ pendiente).
   - Por cada cantidad recibida: se recalcula el CP y se genera `entrada_compra` en el almacén de la compra (en unidades base, a costo base).
   - Cada ítem acumula su `cantidadRecibida`. Si todo está completo → `recibida`; si falta algo → `parcial` (backorder visible en la columna "Pendiente").
   - Se puede recibir en tantas tandas como sea necesario.
3. **Anular**: solo compras `pendiente`. Una compra `parcial` o `recibida` ya afectó el stock; para regularizar se usa **Devolución de compra**.
4. **Devolución de compra**: valida contra lo **recibido** (no lo pedido) menos lo ya devuelto.

### 2.3 Órdenes de compra (OC)
Documento previo a la compra dirigido al proveedor:
```
BORRADOR ──enviar (email)──► ENVIADA ──recibir──► RECIBIDA
    │                            │
    └────────── anular ──────────┘──► ANULADA
```
- La recepción de una OC ingresa stock igual que una compra (recalcula CP, kardex `entrada_compra`) y puede **crear productos nuevos** incluidos en la OC.
- Las OC pueden generarse **automáticamente desde Planificación** (ver §6).

---

## 3. Proceso de VENTAS (con escáner)

### 3.1 Flujo
1. Se selecciona **cliente, almacén y forma de pago**.
2. Se agregan productos por tres vías:
   - **Pistola USB**: el lector escribe el código + Enter en el campo de escaneo.
   - **Escáner con cámara**: lectura en vivo (QR, EAN-13, Code 128…) o **subiendo una foto** del código. Cada lectura agrega el producto (modo pistoleo continuo con pitido de confirmación).
   - **Buscador por nombre**.
   - La búsqueda por código acepta el **código de barras** o el **SKU interno**.
3. Por línea se puede elegir la **unidad** (base o alternativa, ej. caja) — el precio se sugiere proporcional al factor.
4. Validación de stock: `cantidad × factor ≤ disponible` del almacén elegido (el stock reservado por transferencias no se puede vender).
5. Al registrar: se genera `salida_venta` por línea (unidades base, valorizada al CP) y se descarga la **boleta PDF** automáticamente.

### 3.2 Devolución de venta
- Se registra contra una venta existente; valida `cantidad ≤ vendida − ya devuelta` (por producto).
- Reingresa stock con `entrada_devolucion_venta` (convierte con el factor del ítem original: devolver 1 caja reingresa 12 unidades base).
- El precio se toma del documento original. Anular la devolución revierte el stock.

---

## 4. TRANSFERENCIAS entre almacenes

```
        crear                enviar                    recibir
Transf ─────► PENDIENTE ────────────► ENVIADA ────────────────► RECIBIDA
              (reserva stock         (libera reserva,           (entrada al
               en el ORIGEN)          salida del origen:         destino)
                  │                   stock EN TRÁNSITO)
                  │ anular               │ anular
                  ▼                      ▼
               ANULADA               ANULADA (el stock
              (libera reserva)        retorna al origen)
```
- **Pendiente**: la mercadería queda reservada en el origen (no se puede vender).
- **Enviada**: el stock salió del origen y aún no entra al destino → está **en tránsito**.
- **Recibida**: no se puede anular.
- Movimientos: `salida_transferencia` (origen) y `entrada_transferencia` (destino), valorizados al CP.

---

## 5. DESPACHOS (entregas a domicilio)

Documento de seguimiento por venta (no mueve stock — el stock salió al registrar la venta):
```
PENDIENTE ──► EN PREPARACIÓN ──► DESPACHADO ──► ENTREGADO
     │               │                │
     └───────────────┴── anular ──────┘──► ANULADO   (entregado no se anula)
```
- Registra dirección de entrega, contacto, teléfono y transportista.
- Solo puede existir **un despacho activo por venta**.

---

## 6. PLANIFICACIÓN DE INVENTARIO y reposición automática

### 6.1 Cálculo
Para cada producto activo:
```
Demanda diaria      = unidades vendidas (kardex salida_venta) últimos 90 días / 90
Punto de reorden    = el MANUAL si está definido (> 0)
      (efectivo)      si no: ⌈demanda diaria × lead time del proveedor⌉ + stock mínimo
Aparece en la lista si: stock ≤ punto de reorden efectivo
Estado              = CRÍTICO si stock = 0 o stock < stock mínimo; si no REORDEN
Cantidad sugerida   = stock máximo − stock   (si hay stock máximo definido)
                      si no: max(stock mínimo × 2, punto de reorden) − stock
```
- El **lead time** (días de entrega) se configura en la ficha del **proveedor**.
- Con esto el sistema avisa comprar **antes** de quedarse sin stock durante la espera del proveedor.

### 6.2 Generar OC con un clic
- En la pantalla de Planificación se marcan los productos (checkbox) y el botón **Generar OC** crea **una orden de compra en borrador por cada proveedor**, con las cantidades sugeridas y el costo de compra actual.
- Los productos **sin proveedor asignado** no se pueden marcar (asignar proveedor en la ficha del producto).
- Las OC quedan en `borrador` para revisarlas/editarlas antes de enviarlas.

---

## 7. CONTEOS CÍCLICOS / inventario físico

### 7.1 Flujo
```
         generar planilla          registrar conteos           aplicar
Conteo ───────────────► ABIERTO ──(varias sesiones)── ABIERTO ────────► APLICADO
                           │                                             (ajusta stock
                           │ anular                                       + kardex)
                           ▼
                        ANULADO (no toca stock)
```

### 7.2 Reglas
1. **Generar planilla**: se elige almacén y opcionalmente **una categoría** (esa es la esencia del conteo cíclico: contar por partes rotativas en lugar de cerrar la tienda para un inventario general). La planilla **captura el stock del sistema** de cada producto en ese momento.
2. **Registrar**: se anota el stock físico contado; se puede guardar por avances (los productos sin contar quedan como "sin contar"). La diferencia se ve al instante.
3. **Aplicar**:
   - Solo los productos **contados** se ajustan; los no contados no se tocan.
   - El ajuste se calcula contra el **stock actual** del almacén (si hubo ventas entre el conteo y la aplicación, el conteo físico es la verdad final).
   - Genera `entrada_ajuste` (sobrante) o `salida_ajuste` (faltante) valorizados al CP, con referencia `ConteoInventario`.
   - Una planilla aplicada es inmutable.
4. **Anular**: solo planillas abiertas; no afecta stock.

---

## 8. Módulos de análisis

| Módulo | Qué muestra |
|---|---|
| **Stock por Almacén** | Stock físico, reservado, disponible, costo promedio y **valor** (stock × CP) por producto y almacén |
| **Movimientos (Kardex)** | Historial completo con filtros por tipo/almacén, costo unitario y valor de cada movimiento |
| **Control de Stock** | Semáforo de productos vs stock mínimo/máximo |
| **Planificación** | Qué comprar, cuánto y a quién (ver §6) |
| **Rotación (ABC)** | Clasificación de productos por velocidad de venta |
| **Reportes** | Ventas, compras y análisis general |

---

## 9. Roles y accesos

- **ADMIN**: acceso total (no requiere registros de menú).
- **ALMACEN**: inventario completo (productos, movimientos, ajustes, stock por almacén, transferencias, **conteos**, planificación, rotación) + compras/OC/proveedores.
- **VENDEDOR**: ventas, clientes, cajas, **devoluciones**, **despachos**, productos y reportes.

El menú lateral se construye desde la base de datos (tablas `menus` y `menu_roles`); los accesos por página se validan en el servidor (`requireMenuAccess`).

---

## 10. Reglas de integridad (invariantes)

1. `Producto.stock` = suma del stock de todos sus almacenes (se mantiene automáticamente).
2. Ninguna salida puede dejar el stock de un almacén por debajo de su stock reservado (excepto la aplicación de un conteo físico, que es la verdad final).
3. Todo movimiento de stock pasa por el helper central `aplicarMovimientoStock` → siempre hay kardex.
4. Las cantidades del kardex están **siempre en unidades base**; los documentos conservan la unidad usada.
5. Solo se devuelve lo efectivamente recibido (compras) o vendido (ventas), menos lo ya devuelto.
6. Documentos con numeración única (formato `PREFIJO-AAAAMM-XXXX`): `V-` ventas, `C-` compras, `AJ-` ajustes, `TR-` transferencias, `DV-`/`DC-` devoluciones, `DE-` despachos, `CT-` conteos; las órdenes usan `OC-AAAA-XXXX`.

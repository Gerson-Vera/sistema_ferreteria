# Manual de Usuario — Sistema Ferretería

Este manual explica **paso a paso** cómo usar el sistema en el día a día. Está escrito para el personal de mostrador y almacén; no necesitas conocimientos técnicos.

> **Idea clave para entender todo el sistema:** el stock se mueve solo cuando ocurre algo real: recibes mercadería, vendes, transfieres, devuelves o cuentas. Cada uno de esos hechos se registra en una pantalla distinta, y el sistema guarda el historial completo en **Movimientos** (el "kardex").

---

## Índice

1. [Vender (con escáner)](#1-vender)
2. [Comprar y recibir mercadería (aunque llegue incompleta)](#2-comprar-y-recibir-mercadería)
3. [Saber qué comprar: Planificación](#3-saber-qué-comprar-planificación)
4. [Mover mercadería entre almacenes](#4-mover-mercadería-entre-almacenes)
5. [Devoluciones](#5-devoluciones)
6. [Entregas a domicilio (Despachos)](#6-entregas-a-domicilio-despachos)
7. [Contar el inventario físico (Conteos)](#7-contar-el-inventario-físico)
8. [Vender por caja y por unidad](#8-vender-por-caja-y-por-unidad)
9. [Consultar stock y movimientos](#9-consultar-stock-y-movimientos)
10. [Preguntas frecuentes](#10-preguntas-frecuentes)

---

## 1. Vender

**Menú: Ventas → Nueva Venta**

1. Elige el **cliente** (busca por nombre o documento).
2. Elige el **almacén** del que sale la mercadería y la **forma de pago**.
3. Agrega los productos. Tienes 3 formas:

   **a) Con pistola lectora (la más rápida):** haz clic en el campo *"Escanear código de barras"* y dispara la pistola sobre el código del producto. El producto se agrega solo. Escanea el siguiente, y el siguiente…

   **b) Con la cámara o una foto:** pulsa el **botón de cámara** 📷 que está dentro del campo de escaneo. Se abre una ventana con dos opciones:
   - **Cámara en vivo**: apunta la cámara al código QR o de barras. No hay que pulsar nada: cuando el sistema lo lee, suena un **pitido** y el producto se agrega a la venta. Puedes seguir escaneando productos uno tras otro; abajo verás la lista de lo que se fue agregando. Al terminar pulsa **Listo**.
   - **Subir imagen**: elige una foto donde se vea el código completo y enfocado. Si no se detecta nada, prueba con una foto más cercana.
   - Si suena un pitido **grave**, el código no corresponde a ningún producto registrado.

   **c) Por nombre:** escribe en *"Buscar por nombre"* y pulsa **Agregar**.

4. Ajusta cantidades y precios si hace falta. Si un producto aparece en rojo, estás pidiendo **más de lo disponible** en ese almacén.
5. Pulsa **Registrar Venta y Descargar Boleta**. El stock se descuenta y la boleta PDF se descarga sola.

> 💡 Si el sistema dice que no hay stock suficiente pero tú "ves" mercadería en el almacén, puede estar **reservada** para una transferencia pendiente. Revisa en *Stock por Almacén* la columna "Reservado".

---

## 2. Comprar y recibir mercadería

**Menú: Compras → Compras (Facturas)**

### 2.1 Registrar la compra
1. Pulsa **Nueva Compra**.
2. Elige el **proveedor**, el **almacén** donde entrará la mercadería y agrega los productos con su cantidad y costo.
3. Guarda. La compra queda en estado **Pendiente** — todavía **no** entra nada al stock (la mercadería aún no llegó).

### 2.2 Recibir la mercadería (¡puede llegar incompleta!)
Cuando el proveedor entrega:

1. En la lista de compras, pulsa el botón verde ✅ **Registrar recepción**.
2. Verás cada producto con: **Pedido / Recibido / Pendiente / Recibir ahora**.
3. En *"Recibir ahora"* escribe **cuánto llegó realmente** de cada producto (el sistema propone todo lo pendiente).
   - ¿Llegaron 8 de 10 sacos? Escribe 8. Recién entonces esos 8 entran al stock.
4. Confirma. Si recibiste todo, la compra queda **Recibida** (verde). Si faltó algo, queda **Parcial** (azul) y el saldo aparece como pendiente.
5. Cuando llegue el resto, vuelve a pulsar el mismo botón ✅ y registra lo que llegó. Puedes hacerlo tantas veces como haga falta.

> ⚠️ Una compra que ya tiene mercadería recibida **no se puede anular**. Si necesitas regresarle algo al proveedor, usa **Devoluciones** (pestaña Compras).

---

## 3. Saber qué comprar: Planificación

**Menú: Inventario → Planificación de Inventario**

Esta pantalla te dice **qué productos se están acabando y cuánto comprar**, calculado con las ventas reales de los últimos 90 días y el tiempo de entrega de cada proveedor.

- **Crítico** (rojo): sin stock o por debajo del mínimo. Comprar ya.
- **Reorden** (ámbar): llegó al punto donde hay que pedir, porque si esperas más te quedarás sin stock mientras el proveedor entrega.
- **Demanda/día**: cuántas unidades se venden por día en promedio.
- **P. Reorden**: dice "manual" si lo definiste tú en la ficha del producto, o "auto" si el sistema lo calculó con la demanda y los días de entrega del proveedor.

### Generar las órdenes de compra con un clic
1. Marca con el **checkbox** los productos que quieres reponer (puedes marcar todos con el checkbox de arriba).
2. Pulsa **Generar OC** (arriba a la derecha; muestra cuántos productos y el costo estimado).
3. El sistema crea **una orden de compra por cada proveedor**, en borrador, con las cantidades sugeridas.
4. Ve a **Compras → Órdenes a Proveedor** para revisarlas, ajustarlas y enviarlas por correo al proveedor.

> 💡 Para que el cálculo automático funcione bien: pon el **proveedor** a cada producto (sin proveedor no se puede marcar el checkbox) y el **tiempo de entrega en días** en la ficha del proveedor.

---

## 4. Mover mercadería entre almacenes

**Menú: Inventario → Transferencias**

1. Pulsa **Nueva Transferencia**, elige **origen**, **destino** y los productos con su cantidad.
2. Al crearla queda **Pendiente**: la mercadería sigue en el origen pero queda **reservada** (nadie la puede vender por error mientras la preparas).
3. Cuando el camión sale, pulsa **Enviar** ➤: el stock sale del origen y queda "en tránsito".
4. Cuando llega al destino, pulsa **Recibir** 📦: el stock entra al almacén destino.
5. ¿Te arrepentiste? **Anular** funciona mientras no esté recibida:
   - Si estaba pendiente: solo se libera la reserva.
   - Si estaba enviada: el stock regresa al origen.

---

## 5. Devoluciones

**Menú: Ventas → Devoluciones** (pestañas *Ventas* y *Compras*)

### El cliente devuelve algo (pestaña Ventas)
1. Pulsa **Nueva Devolución**, busca la **venta** original.
2. Indica qué productos y cuántos devuelve, y el **motivo**.
3. Al registrar, la mercadería **reingresa al stock** del almacén que elijas.
- El sistema no deja devolver más de lo que se vendió (descontando devoluciones anteriores).

### Devolver al proveedor (pestaña Compras)
Igual, pero contra una **compra**: la mercadería **sale del stock**. Solo se puede devolver lo que efectivamente **recibiste** de esa compra.

---

## 6. Entregas a domicilio (Despachos)

**Menú: Ventas → Despachos**

Sirve para hacer seguimiento de las ventas que se entregan a domicilio (el stock ya salió al registrar la venta; esto es solo el seguimiento del reparto).

1. Pulsa **Nuevo Despacho**, elige la **venta** y completa dirección, contacto, teléfono y transportista.
2. Ve avanzando el estado con el botón de avance según ocurra:
   `Pendiente → En preparación → Despachado → Entregado`
3. Se puede anular mientras no esté **Entregado**. Solo puede haber un despacho activo por venta.

---

## 7. Contar el inventario físico

**Menú: Inventario → Conteos de Inventario**

Sirve para comparar lo que dice el sistema con lo que **realmente hay en el estante**, y corregir las diferencias. La recomendación es hacer **conteos cíclicos**: contar una categoría por semana, en lugar de cerrar la tienda para contar todo.

### Paso 1 — Generar la planilla
1. Pulsa **Nuevo Conteo**.
2. Elige el **almacén** y, si quieres, **una categoría** (ej. "esta semana solo tornillería").
3. Al generar, el sistema anota cuánto stock "debería haber" de cada producto.

### Paso 2 — Contar y registrar
1. En la lista, pulsa el botón ✏️ **Registrar conteo físico**.
2. Ve producto por producto y escribe en *"Conteo físico"* lo que contaste en el estante. Usa el buscador para ubicarlos rápido.
3. La columna **Diferencia** te muestra al instante: `OK` (coincide), `+N` (sobra) o `−N` (falta).
4. Pulsa **Guardar conteo**. Puedes guardar avances y seguir contando otro día — la planilla queda **Abierta**.

### Paso 3 — Aplicar
1. Cuando termines, pulsa ✔️ **Aplicar diferencias al stock** y confirma.
2. El sistema ajusta el stock de los productos contados para que quede **igual a lo que contaste**, y deja el rastro en Movimientos como "Conteo físico CT-…".
3. Los productos que no contaste **no se tocan**. Una planilla aplicada ya no se puede modificar.

> ⚠️ Si te equivocaste al crear la planilla, usa **Anular** (solo mientras esté abierta): no toca el stock.

---

## 8. Vender por caja y por unidad

### Configurar la equivalencia (una sola vez por producto)
1. **Menú: Inventario → Productos** → busca el producto → pulsa el botón morado de **balanza** ⚖️.
2. Agrega la unidad alternativa y su factor: ej. **Caja = 12** (1 caja trae 12 unidades).

### Al vender o comprar
- En la línea del producto aparece un selector de **Unidad**: elige "CJA (×12)".
- El precio/costo se sugiere multiplicado por el factor y debajo verás la equivalencia: *"= 24 unid. base"*.
- El stock siempre se controla en unidades sueltas: vender 2 cajas descuenta 24 unidades.

---

## 9. Consultar stock y movimientos

| Quiero saber… | Voy a… |
|---|---|
| Cuánto hay de cada producto **en cada almacén**, cuánto está reservado y cuánto vale | **Inventario → Stock por Almacén** (columnas Stock, Reservado, Disponible, Costo Prom., Valor) |
| **Todo lo que pasó** con un producto (entradas, salidas, quién, cuándo, a qué costo) | **Inventario → Movimientos** (filtra por producto, tipo o almacén) |
| Qué productos están **bajos de stock** | **Inventario → Control de Stock** (o la campana 🔔 de alertas arriba) |
| Qué **comprar** y cuánto | **Inventario → Planificación de Inventario** |
| Qué productos **rotan más** (se venden más rápido) | **Inventario → Rotación de Inventario** |

---

## 10. Preguntas frecuentes

**"El sistema no me deja vender y sí hay stock."**
Ese stock probablemente está **reservado** por una transferencia pendiente. Revisa *Stock por Almacén* → columna Reservado. Envía o anula la transferencia para liberarlo.

**"Escaneé un producto y suena el pitido grave / dice 'no encontrado'."**
Ese código no está registrado. Abre la ficha del producto (Inventario → Productos → editar) y pega el código en el campo **Código de barras** (puedes escanearlo con la pistola dentro del campo). Desde entonces se agregará solo.

**"El proveedor me trajo menos de lo que pedí."**
Recibe **solo lo que llegó** (sección 2.2). La compra queda *Parcial* y el resto queda pendiente para recibirlo después. No registres una compra nueva por el saldo.

**"Quiero anular una compra que ya recibí."**
No se puede anular porque la mercadería ya entró. Registra una **Devolución de compra** con los productos a regresar.

**"¿Por qué el sistema me sugiere comprar si aún tengo stock?"**
Porque con tu ritmo de ventas y los días que tarda el proveedor, ese stock se acabará **antes** de que llegue el nuevo pedido. Es la señal para comprar a tiempo.

**"Conté mal y ya apliqué el conteo."**
Una planilla aplicada no se edita. Genera un **nuevo conteo** de esa categoría y aplícalo con los valores correctos (o usa un Ajuste de Inventario puntual).

**"¿La cámara no enciende en el escáner?"**
El navegador pide **permiso de cámara** la primera vez — acéptalo. Si lo denegaste, habilítalo en el candado de la barra de direcciones, o usa la opción **Subir imagen**.

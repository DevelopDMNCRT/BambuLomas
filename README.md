# Bambú Lomas 🎋

Proyecto integral para la gestión, punto de venta y tienda de **Bambú Lomas**. Este repositorio contiene una arquitectura monorepo dividida en tres módulos principales: un cliente público, un panel de administración/Punto de Venta (POS), y un servidor backend centralizado.

---

## 🏗 Arquitectura del Proyecto

El proyecto está dividido en tres carpetas principales:

1. **/admin** (Frontend Administrativo & POS)
   - **Tecnologías:** Vue 3, Vite, TailwindCSS 4, TypeScript.
   - **Propósito:** Panel de control para administradores y cajeros. Incluye el Punto de Venta (POS), manejo de Cuentas por Cobrar (CXC), inventarios, compras, gestión de mesas, escaneo de QR para fidelidad y un tablero Kanban para el control de órdenes online.
2. **/client** (Frontend Público)
   - **Tecnologías:** Vue 3, Vite, TailwindCSS.
   - **Propósito:** Aplicación pública donde los clientes pueden ver el menú y sus recompensas.
3. **/server** (Backend & API)
   - **Tecnologías:** Node.js, Express, PostgreSQL (alojado en Neon).
   - **Propósito:** Servidor centralizado. Gestiona la lógica de negocio, base de datos, autenticación, procesamiento de órdenes, CXC y manejo de inventarios/compras.

---

## 🚀 Guía de Inicio Rápido (Para Desarrolladores)

Sigue estos pasos para echar a andar todo el repositorio en tu entorno local.

### 1. Requisitos Previos
- **Node.js** (v18 o superior).
- Base de datos **PostgreSQL** (actualmente configurada usando Neon Tech).

### 2. Configuración de Entorno (.env)
Deberás configurar las variables de entorno en el servidor. Crea un archivo `.env` en la carpeta `/server` basado en el entorno de producción/desarrollo:
```env
PORT=3000
DATABASE_URL=postgres://usuario:password@dominio-neon.tech/bambu_lomas?sslmode=require
JWT_SECRET=tu_secreto_aqui
```

### 3. Instalación y Ejecución

Abre tres terminales (una para cada módulo) y ejecuta los siguientes comandos:

**Terminal 1 (Backend - Server):**
```bash
cd server
npm install
npm run dev
```
*(El servidor correrá en `http://localhost:3000`)*

**Terminal 2 (Frontend - Admin/POS):**
```bash
cd admin
npm install
npm run dev
```
*(El panel de admin correrá típicamente en `http://localhost:5173`)*

**Terminal 3 (Frontend - Client):**
```bash
cd client
npm install
npm run dev
```

---

## 📝 Últimos Cambios y Contexto Actual (Julio 2026)

- **Integración Kanban → POS:** Se rediseñó el flujo de las órdenes online. Ahora, al dar clic en "Cobrar en POS" desde la columna *En entrega* del tablero Kanban, el sistema pasa la orden directamente al Punto de Venta (POS). El POS precarga el cliente, el método de pago original y mapea perfectamente los productos y sus variantes seleccionadas. Al pagar, se actualiza la orden a `Completada` sin generar duplicados en la base de datos.
- **Historial de Inventario y Compras:** Se corrigió el enlace entre el Historial de Inventarios y el detalle de la compra. Ahora, al dar clic sobre el número de factura en el historial, el frontend (`ComprasForm.vue`) consulta el nuevo endpoint `GET /api/compras/by-factura/:factura` para mostrar el desglose exacto de la compra de la cual provino ese lote de inventario.
- **Cuentas por Cobrar (CXC):** El POS ahora maneja un flujo especializado para pagar cuentas por cobrar, validando a los clientes desde la base de datos y liquidando deudas de manera controlada directamente desde la caja.
- **Limpieza de Sesiones Locales:** Se resolvieron problemas de puertos duplicados y "stale instances" (procesos zombi) de Node que causaban conflictos de hot-reload y problemas de login por caché vieja en la base de datos de Neon.

### 🗓 07 de Julio 2026

- **Nuevo Dashboard de Estadísticas (`Ecommerce.vue`):** Se implementó desde cero la sección de estadísticas del panel de administración. Características:
  - Filtro por **Día** (estado inicial: hoy) o por **Mes** mediante botones de modo.
  - **Card de Ingresos:** suma total de ventas del período seleccionado.
  - **Card de Compras:** total gastado en compras del período.
  - **Card de Gastos:** total de gastos operativos del período.
  - **Card de Cortesías:** total en cortesías/descuentos del período.
  - **Card de Balance General:** calculado como `Ingresos - Compras - Gastos` (CXC y cortesías no se consideran ya que no representan flujo de caja real).
  - **Card de CXC (Cuentas por Cobrar):** muestra siempre el acumulado histórico global, sin importar el filtro de fecha activo.
  - **Tabla Top 5 Platillos más vendidos** del período seleccionado.
  - **Tabla Top 5 Clientes con más deuda CXC** acumulada (para identificar quién debe más).
  - Nuevo endpoint `GET /api/estadisticas/resumen` en el backend que centraliza todos los cálculos con una sola llamada, soportando parámetros `?modo=dia|mes` y `?fecha=YYYY-MM-DD|YYYY-MM`.

- **Corrección del Selector de Fechas en Estadísticas:** Los selectores de Día y Mes ahora conviven visibles simultáneamente. Al hacer clic directamente en cualquiera de ellos se activa automáticamente su modo, sin necesidad de usar los botones de cambio. Se integró `monthSelectPlugin` de Flatpickr para mostrar una cuadrícula real de meses/año en lugar del calendario de días. Se eliminó la restricción `maxDate` que bloqueaba la selección de meses anteriores.

- **Corrección de Bug Crítico — Inventario Dinámico (POS):** Se identificó y resolvió un bug que impedía que el inventario se descontara al realizar ventas desde el POS.
  - **Causa raíz:** El POS enviaba el nombre del platillo vendido en el campo `producto`, pero el servidor solo buscaba `prod.nombre || prod.name`, causando que la búsqueda de la receta siempre fallara silenciosamente.
  - **Corrección (`server/index.js`):** La resolución del nombre ahora es `prod.nombre || prod.name || prod.producto`, cubriendo el POS, el cliente web y cualquier otra fuente.
  - **Resultado:** Al vender cualquier platillo de la carta que tenga una receta vinculada, sus ingredientes se descuentan automáticamente del stock de inventario en la tabla `inventario_salidas`.

- **Corrección de Estilos del PDF de Inventario:** Se ajustó el gradiente de fondo del encabezado en el reporte PDF del inventario (`InventarioView.vue`). El gradiente anterior era demasiado oscuro y uniforme, haciendo que el logo blanco se confundiera con el fondo verde. Se cambió a un gradiente con dirección `to top` que genera más contraste en la zona del logo.

### 🗓 09 de Julio 2026

- **Iconografía de Ludoteca**: Se cambió el icono de la sección **Ludoteca** en el menú rápido de administración por un icono de virrete de graduación (`GraduationCapIcon`).
- **Título de Pestaña (Estadísticas)**: Se actualizó el título de la ruta de inicio en el router del administrador (`/`) de `'eCommerce Dashboard'` a `'Estadísticas'`, logrando que la pestaña del navegador muestre `"Estadísticas | Bambu Cloud - Admin"`.
- **Renombramiento de Rol (Cajero ➔ Operativo)**: Se cambió el rol de usuario `'Cajero'` por `'Operativo'` en toda la plataforma (formulario de usuarios, vistas de corte del día, filtros de checador/nómina, endpoint de backend y registros existentes en la base de datos de Neon).
- **Campo "Descripción" en CRUD de Gastos**:
  - Se alteró la tabla `gastos` en PostgreSQL agregando la columna `descripcion` (tipo `TEXT`).
  - Se integró la lectura y persistencia del campo en los endpoints del servidor (`GET`, `POST`, `PUT`) e interfaces TypeScript.
  - Se implementó un nuevo input para **Descripción** en el formulario de la UI y su respectiva columna con tooltip en la tabla del historial de gastos.
- **Filtros de Fecha en Gastos**: Se eliminó el filtro "Sin Desglose" en el CRUD de gastos, dejando únicamente los filtros por fecha: **Hoy** (como opción por defecto inicial), **Mes** y **Día** (con calendario).
---

## 📂 Notas Importantes

- **Base de Datos:** El proyecto utiliza `pg` directo para consultas SQL (no un ORM pesado) lo cual otorga control total sobre queries complejos como el tracking de compras y CXC.
- **Variables y Extras (POS):** Al trabajar con productos en el POS y las órdenes, presta especial atención a la estructura `variablesSeleccionadas`, la cual difiere levemente entre el catálogo puro, el carrito del POS y cómo lo guarda el Tablero Kanban. Existen funciones parseadoras (`ordenItemsToCart`) dentro de `PosView.vue` que se encargan de esta traducción.
- **Autenticación:** Las contraseñas están encriptadas con `bcryptjs`. Si necesitas resetear una cuenta directamente en DB, recuerda generar el hash usando scripts de bcrypt de Node (no encriptación plana ni MD5).

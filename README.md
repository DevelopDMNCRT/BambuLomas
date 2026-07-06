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

- **Integración Kanban -> POS:** Se rediseñó el flujo de las órdenes online. Ahora, al dar clic en "Cobrar en POS" desde la columna *En entrega* del tablero Kanban, el sistema pasa la orden directamente al Punto de Venta (POS). El POS precarga el cliente, el método de pago original y mapea perfectamente los productos y sus variantes seleccionadas. Al pagar, se actualiza la orden a `Completada` sin generar duplicados en la base de datos.
- **Historial de Inventario y Compras:** Se corrigió el enlace entre el Historial de Inventarios y el detalle de la compra. Ahora, al dar clic sobre el número de factura en el historial, el frontend (`ComprasForm.vue`) consulta el nuevo endpoint `GET /api/compras/by-factura/:factura` para mostrar el desglose exacto de la compra de la cual provino ese lote de inventario.
- **Cuentas por Cobrar (CXC):** El POS ahora maneja un flujo especializado para pagar cuentas por cobrar, validando a los clientes desde la base de datos y liquidando deudas de manera controlada directamente desde la caja.
- **Limpieza de Sesiones Locales:** Se resolvieron problemas de puertos duplicados y "stale instances" (procesos zombi) de Node que causaban conflictos de hot-reload y problemas de login por caché vieja en la base de datos de Neon.

---

## 📂 Notas Importantes

- **Base de Datos:** El proyecto utiliza `pg` directo para consultas SQL (no un ORM pesado) lo cual otorga control total sobre queries complejos como el tracking de compras y CXC.
- **Variables y Extras (POS):** Al trabajar con productos en el POS y las órdenes, presta especial atención a la estructura `variablesSeleccionadas`, la cual difiere levemente entre el catálogo puro, el carrito del POS y cómo lo guarda el Tablero Kanban. Existen funciones parseadoras (`ordenItemsToCart`) dentro de `PosView.vue` que se encargan de esta traducción.
- **Autenticación:** Las contraseñas están encriptadas con `bcryptjs`. Si necesitas resetear una cuenta directamente en DB, recuerda generar el hash usando scripts de bcrypt de Node (no encriptación plana ni MD5).

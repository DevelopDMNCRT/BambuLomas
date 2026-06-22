import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { sendSubscriberEmail, sendRewardEmail } from './mailer.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'bambu_cloud_fallback_secret';

// DB connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json());

// Crear tabla de ordenes si no existe
const createOrdenesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ordenes (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        numero_pedido VARCHAR(50) NOT NULL,
        cliente_nombre VARCHAR(255) NOT NULL,
        cliente_telefono VARCHAR(50),
        cliente_email VARCHAR(255),
        cliente_direccion TEXT,
        cliente_referencias TEXT,
        pago_metodo VARCHAR(50) DEFAULT 'Efectivo',
        tipo_entrega VARCHAR(50) DEFAULT 'domicilio',
        total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        costo_envio NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        estado VARCHAR(50) NOT NULL DEFAULT 'Nuevo',
        productos JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT now(),
        edited_at TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'ordenes' verificada en la base de datos.");
  } catch (err) {
    console.error("❌ Error al crear la tabla 'ordenes':", err);
  }
};
createOrdenesTable();

// Crear tabla de horarios semanales si no existe
const createHorariosSemanalesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS horarios_semanales (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
        tipo VARCHAR(20) NOT NULL DEFAULT 'laboral',
        hora_entrada TIME,
        hora_salida TIME,
        created_at TIMESTAMP DEFAULT now(),
        edited_at TIMESTAMP,
        UNIQUE (usuario_id, dia_semana)
      );
    `);
    console.log("✅ Tabla 'horarios_semanales' verificada en la base de datos.");
  } catch (err) {
    console.error("❌ Error al crear la tabla 'horarios_semanales':", err);
  }
};
createHorariosSemanalesTable();

// ── UPLOAD DE IMAGENES ────────────────────────────────────

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'BambuLomas' },
    (error, result) => {
      if (error) {
        console.error('Error uploading to Cloudinary:', error);
        return res.status(500).json({ error: 'Error al subir la imagen' });
      }
      res.json({ url: result.secure_url });
    }
  );

  uploadStream.end(req.file.buffer);
});// ── UTILIDADES ────────────────────────────────────────────

/**
 * Normaliza texto: minúsculas, sin acentos, sin caracteres especiales.
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s]/g, '')     // Solo letras, números y espacios
    .replace(/\s+/g, ' ')            // Colapsar espacios múltiples
    .trim();
}

/**
 * Palabras genéricas de relleno que NO aportan identidad al producto.
 * Se eliminan antes de calcular similitud para maximizar precisión.
 */
const STOPWORDS = new Set([
  // Preposiciones / artículos
  'con', 'de', 'del', 'al', 'en', 'para', 'por', 'el', 'la', 'los', 'las',
  'un', 'una', 'unos', 'unas', 'y', 'e', 'o', 'u', 'a', 'que', 'se', 'su',
  'sin', 'mas', 'o', 'ni',
  // Envases / presentaciones genéricas
  'carton', 'envase', 'caja', 'bolsa', 'botella', 'lata', 'tarro', 'frasco',
  'paquete', 'sobre', 'barra', 'rollo', 'saco', 'costal', 'jarra', 'bote',
  'galon', 'cubierta', 'estuche',
  // Formas largas de unidades (se normalizan a cortas en UNIT_MAP)
  'litro', 'litros', 'kilogramo', 'kilogramos', 'gramo', 'gramos',
  'mililitro', 'mililitros', 'pieza', 'piezas', 'unidad', 'unidades',
]);

/**
 * Normaliza formas largas de unidades a sus abreviaciones estándar.
 * Permite que "1 litro" y "1l" coincidan en keywords.
 */
const UNIT_MAP = {
  'lt': 'l',  'lts': 'l',  'litro': 'l',   'litros': 'l',
  'kg': 'kg', 'kilo': 'kg', 'kilos': 'kg',
  'kilogramo': 'kg', 'kilogramos': 'kg',
  'gr': 'g',  'grs': 'g',  'gramo': 'g',   'gramos': 'g', 'gram': 'g',
  'ml': 'ml', 'mililitro': 'ml', 'mililitros': 'ml',
  'pza': 'pz', 'pzas': 'pz', 'pieza': 'pz', 'piezas': 'pz',
  'paq': 'pq', 'paquete': 'pq', 'paquetes': 'pq',
  'ud': 'ud', 'unidad': 'ud', 'unidades': 'ud',
};

/**
 * Stemming conservador para español: reduce plurales a singular.
 * Solo aplica reglas seguras y comunes en nombres de productos de restaurante.
 *
 * Reglas:
 *   vocal + s      → quitar s    ("tapas"→"tapa", "vasos"→"vaso")
 *   vocal + es     → quitar s    ("calientes"→"caliente", "series"→"serie")
 *   consonante + es → quitar es  ("colores"→"color", "tapones"→"tapon")
 *
 * Se preservan palabras cortas (≤3 chars) para evitar falsas reducciones.
 */
function stemSpanish(word) {
  if (!word || word.length <= 3) return word;

  // Termina en 'es' con longitud > 4
  if (word.length > 4 && word.endsWith('es')) {
    const beforeEs = word[word.length - 3]; // char antes de 'es'
    if ('aeiou'.includes(beforeEs)) {
      // vocal + es → quitar solo 's'  (calientes → caliente)
      return word.slice(0, -1);
    }
    // consonante + es → quitar 'es'  (colores → color, tapones → tapon)
    const stem = word.slice(0, -2);
    if (stem.length > 2) return stem;
  }

  // Termina en 's' (no 'es') con vocal antes
  if (!word.endsWith('es') && word.endsWith('s') && word.length > 3) {
    const beforeS = word[word.length - 2];
    if ('aeiou'.includes(beforeS)) {
      // tapas → tapa, vasos → vaso, leches (no aplica, termina en 'es')
      return word.slice(0, -1);
    }
  }

  return word;
}

/**
 * Extrae palabras clave de una descripción de producto:
 * 1. Normaliza el texto (minúsculas, sin acentos)
 * 2. Separa en tokens
 * 3. Normaliza unidades (litro → l, kilogramo → kg, etc.)
 * 4. Aplica stemming: reduce plurales a singular (tapas → tapa)
 * 5. Elimina stopwords
 * 6. Deduplica y ordena alfabéticamente (invariante al orden)
 *
 * Ejemplo:
 *   "Tapas para Vaso de Bebida Caliente" → "bebida caliente tapa vaso"
 *   "Tapa para vasos desechables"        → "desechable tapa vaso"
 *   → similarity mucho más alta que sin stemming
 */
function extractKeywords(text) {
  if (!text) return '';
  const normalized = normalizeText(text);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const keywords = new Set();
  for (const token of tokens) {
    const mapped = UNIT_MAP[token] || token;   // normalizar unidades
    const stemmed = stemSpanish(mapped);        // reducir plural → singular
    // Filtrar stopwords (en su forma stemmed/base) y tokens de 1 char
    if (!STOPWORDS.has(stemmed) && !STOPWORDS.has(mapped) &&
        (stemmed.length > 1 || stemmed === 'l' || stemmed === 'g')) {
      keywords.add(stemmed);
    }
  }
  return [...keywords].sort().join(' ');
}

// ── AUTENTICACIÓN ─────────────────────────────────────────

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { usuario, contraseña } = req.body;
  if (!usuario || !contraseña) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, usuario, correo, telefono, rol, contraseña
       FROM usuarios
       WHERE usuario = $1 AND deleted_at IS NULL`,
      [usuario]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    // Generar token JWT con los datos del usuario (sin contraseña)
    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        correo: user.correo,
        rol: user.rol,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        correo: user.correo,
        rol: user.rol,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// ── USUARIOS ──────────────────────────────────────────────

// GET /api/usuarios — lista todos (no eliminados)
app.get('/api/usuarios', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, usuario, correo, telefono, rol, created_at
       FROM usuarios
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// GET /api/usuarios/:id — obtiene uno
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, usuario, correo, telefono, rol, created_at
       FROM usuarios WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// POST /api/usuarios — crea uno nuevo
app.post('/api/usuarios', async (req, res) => {
  const { nombre, usuario, correo, telefono, rol, contraseña } = req.body;
  if (!nombre || !usuario || !correo || !contraseña) {
    return res.status(400).json({ error: 'Campos obligatorios: nombre, usuario, correo, contraseña' });
  }
  try {
    // Hashear la contraseña con bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedContraseña = await bcrypt.hash(contraseña, salt);

    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, usuario, correo, telefono, rol, contraseña)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, usuario, correo, telefono, rol, created_at`,
      [nombre, usuario, correo, telefono || null, rol || 'Cajero', hashedContraseña]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(409).json({ error: 'El usuario o correo ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }
});

// PUT /api/usuarios/:id — actualiza
app.put('/api/usuarios/:id', async (req, res) => {
  const { nombre, usuario, correo, telefono, rol, contraseña } = req.body;
  try {
    let query, params;
    if (contraseña) {
      // Hashear la contraseña con bcryptjs si viene en la petición
      const salt = await bcrypt.genSalt(10);
      const hashedContraseña = await bcrypt.hash(contraseña, salt);

      query = `UPDATE usuarios
               SET nombre=$1, usuario=$2, correo=$3, telefono=$4, rol=$5, contraseña=$6, edited_at=now()
               WHERE id=$7 AND deleted_at IS NULL
               RETURNING id, nombre, usuario, correo, telefono, rol`;
      params = [nombre, usuario, correo, telefono || null, rol, hashedContraseña, req.params.id];
    } else {
      query = `UPDATE usuarios
               SET nombre=$1, usuario=$2, correo=$3, telefono=$4, rol=$5, edited_at=now()
               WHERE id=$6 AND deleted_at IS NULL
               RETURNING id, nombre, usuario, correo, telefono, rol`;
      params = [nombre, usuario, correo, telefono || null, rol, req.params.id];
    }
    const { rows } = await pool.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/usuarios/:id — soft delete
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE usuarios SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// ── COMPRAS ───────────────────────────────────────────────

// GET /api/compras — lista todas las compras
app.get('/api/compras', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, factura, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, proveedor, forma_pago, total, created_at
       FROM compras
       WHERE deleted_at IS NULL
       ORDER BY fecha DESC, id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
});

// GET /api/compras/:id — obtiene una compra y sus detalles
app.get('/api/compras/:id', async (req, res) => {
  try {
    const compraRes = await pool.query(
      `SELECT id, factura, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, proveedor, forma_pago, total, created_at
       FROM compras
       WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!compraRes.rows.length) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    const compra = compraRes.rows[0];

    const detallesRes = await pool.query(
      `SELECT id, cantidad, medida, producto, precio_unitario as "precioUnitario", descuento
       FROM compras_detalles
       WHERE compra_id = $1
       ORDER BY id ASC`,
      [compra.id]
    );

    // Mapear números para evitar strings de pg NUMERIC tipo
    compra.items = detallesRes.rows.map(item => ({
      ...item,
      cantidad: parseFloat(item.cantidad),
      precioUnitario: parseFloat(item.precioUnitario),
      descuento: parseFloat(item.descuento)
    }));
    compra.total = parseFloat(compra.total);

    res.json(compra);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los detalles de la compra' });
  }
});

// POST /api/compras — crea una compra con sus detalles en una transacción
app.post('/api/compras', async (req, res) => {
  const { factura, fecha, proveedor, formaPago, total, items } = req.body;
  if (!factura || !fecha || !proveedor || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Campos obligatorios: factura, fecha, proveedor, items' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Evitar duplicidad: checar si ya existe factura para el proveedor
    if (factura.toUpperCase() !== 'S/N' && factura.trim() !== '') {
      const checkRes = await client.query(
        `SELECT id FROM compras WHERE factura = $1 AND proveedor = $2 AND deleted_at IS NULL`,
        [factura, proveedor]
      );
      if (checkRes.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: `La factura ${factura} del proveedor ${proveedor} ya está registrada.` });
      }
    }

    // Insertar cabecera de la compra
    const compraRes = await client.query(
      `INSERT INTO compras (factura, fecha, proveedor, forma_pago, total)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, factura, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, proveedor, forma_pago as "formaPago", total, created_at`,
      [factura, fecha, proveedor, formaPago || 'EFE', total || 0.00]
    );
    const compra = compraRes.rows[0];

    // Insertar los detalles
    for (const item of items) {
      await client.query(
        `INSERT INTO compras_detalles (compra_id, cantidad, medida, producto, precio_unitario, descuento, product_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          compra.id,
          item.cantidad,
          item.medida,
          item.producto,
          item.precioUnitario !== undefined ? item.precioUnitario : item.precio_unitario,
          item.descuento || 0.00,
          item.productId || null
        ]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(compra);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la compra' });
  } finally {
    client.release();
  }
});

// PUT /api/compras/:id — actualiza cabecera y detalles en una transacción
app.put('/api/compras/:id', async (req, res) => {
  const { factura, fecha, proveedor, formaPago, total, items } = req.body;
  const compraId = req.params.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Actualizar cabecera
    const updateRes = await client.query(
      `UPDATE compras
       SET factura=$1, fecha=$2, proveedor=$3, forma_pago=$4, total=$5, edited_at=now()
       WHERE id=$6 AND deleted_at IS NULL
       RETURNING id, factura, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, proveedor, forma_pago as "formaPago", total`,
      [factura, fecha, proveedor, formaPago, total, compraId]
    );

    if (!updateRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    const compra = updateRes.rows[0];

    // Eliminar los detalles anteriores
    await client.query(`DELETE FROM compras_detalles WHERE compra_id = $1`, [compraId]);

    // Insertar los nuevos detalles
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await client.query(
          `INSERT INTO compras_detalles (compra_id, cantidad, medida, producto, precio_unitario, descuento, product_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            compra.id,
            item.cantidad,
            item.medida,
            item.producto,
            item.precioUnitario !== undefined ? item.precioUnitario : item.precio_unitario,
            item.descuento || 0.00,
            item.productId || null
          ]
        );
      }
    }

    await client.query('COMMIT');
    res.json(compra);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la compra' });
  } finally {
    client.release();
  }
});

// DELETE /api/compras/:id — soft delete de compras
app.delete('/api/compras/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE compras SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json({ message: 'Compra eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar compra' });
  }
});

// ── INVENTARIO ────────────────────────────────────────────

// GET /api/inventario — lista productos maestros con su stock consolidado
// Si el producto tiene un product_id enlazado agrupa por ese ID (maestro),
// de lo contrario cae back al nombre literal (filas no migradas).
app.get('/api/inventario', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `WITH master_stock AS (
         -- Compras enlazadas a un Producto Maestro
         SELECT
           p.id            AS master_id,
           p.name          AS nombre,
           SUM(cd.cantidad) AS total_stock,
           p.unit          AS medida,
           MAX(c.fecha)    AS ultima_compra
         FROM compras_detalles cd
         JOIN compras c ON cd.compra_id = c.id
         JOIN products p ON cd.product_id = p.id
         WHERE c.deleted_at IS NULL AND p.deleted_at IS NULL
         GROUP BY p.id, p.name, p.unit
       ),
       legacy_stock AS (
         -- Compras sin product_id (aún no migradas)
         SELECT
           NULL::INTEGER    AS master_id,
           cd.producto      AS nombre,
           SUM(cd.cantidad) AS total_stock,
           cd.medida        AS medida,
           MAX(c.fecha)     AS ultima_compra
         FROM compras_detalles cd
         JOIN compras c ON cd.compra_id = c.id
         WHERE c.deleted_at IS NULL AND cd.product_id IS NULL
         GROUP BY cd.producto, cd.medida
       ),
       combined AS (
         SELECT * FROM master_stock
         UNION ALL
         SELECT * FROM legacy_stock
       )
       SELECT
         combined.master_id,
         combined.nombre,
         combined.total_stock AS "stockVal",
         combined.medida,
         TO_CHAR(combined.ultima_compra, 'YYYY-MM-DD') AS "ultimaCompra",
         (
           SELECT cd2.precio_unitario
           FROM compras_detalles cd2
           JOIN compras c2 ON cd2.compra_id = c2.id
           WHERE (
             (combined.master_id IS NOT NULL AND cd2.product_id = combined.master_id)
             OR
             (combined.master_id IS NULL AND cd2.producto = combined.nombre AND cd2.product_id IS NULL)
           )
           AND c2.deleted_at IS NULL
           ORDER BY c2.fecha DESC, cd2.id DESC
           LIMIT 1
         ) AS "costoReal"
       FROM combined
       ORDER BY combined.nombre ASC`
    );

    const formatted = rows.map((row, idx) => {
      const seq = String(idx + 1).padStart(4, '0');
      const id = row.master_id ? `MP${String(row.master_id).padStart(5, '0')}` : `INV260${seq}`;
      const stockVal = parseFloat(row.stockVal) || 0;
      const costoReal = parseFloat(row.costoReal) || 0;
      const minimosVal = Math.max(1, Math.ceil(stockVal * 0.25));

      return {
        id,
        nombre: row.nombre,
        stock: `${stockVal} ${row.medida}`,
        stockVal,
        ultimaCompra: row.ultimaCompra || '',
        minimos: `${minimosVal} ${row.medida}`,
        minimosVal,
        costoReal,
        medida: row.medida,
        esMaestro: row.master_id !== null
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el inventario' });
  }
});

// GET /api/inventario/historial — historial de compras de un producto (por nombre o por product_id maestro)
app.get('/api/inventario/historial', async (req, res) => {
  const { nombre } = req.query;
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del producto es obligatorio' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
         TO_CHAR(c.fecha, 'YYYY-MM-DD') as fecha,
         cd.precio_unitario as costo,
         cd.producto as descripcion_proveedor,
         c.proveedor,
         c.factura
       FROM compras_detalles cd
       JOIN compras c ON cd.compra_id = c.id
       WHERE c.deleted_at IS NULL
         AND (
           -- Buscar por nombre maestro (si ya está enlazado)
           cd.product_id IN (
             SELECT id FROM products WHERE name = $1 AND deleted_at IS NULL
           )
           OR
           -- Fallback: buscar por nombre literal (productos no migrados)
           (cd.product_id IS NULL AND cd.producto = $1)
         )
       ORDER BY c.fecha DESC, cd.id DESC`,
      [nombre]
    );

    const formatted = rows.map(row => ({
      fecha: row.fecha,
      costo: parseFloat(row.costo) || 0,
      descripcionProveedor: row.descripcion_proveedor,
      proveedor: row.proveedor,
      factura: row.factura
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el historial de compras' });
  }
});

// ── RECETAS ───────────────────────────────────────────────

// Auxiliar para autogenerar clave de receta REC-NNN
async function getNextRecipeClave() {
  const { rows } = await pool.query(
    `SELECT clave FROM recetas 
     ORDER BY id DESC LIMIT 1`
  );
  if (rows.length === 0) {
    return 'REC-001';
  }
  const lastClave = rows[0].clave;
  const match = lastClave.match(/REC-(\d+)/);
  if (match) {
    const lastNum = parseInt(match[1]);
    return `REC-${String(lastNum + 1).padStart(3, '0')}`;
  }
  return 'REC-001';
}

// GET /api/recetas — lista todas las recetas con sus ingredientes y variantes
app.get('/api/recetas', async (req, res) => {
  try {
    const recetasRes = await pool.query(
      `SELECT id, clave, platillo, descripcion, created_at
       FROM recetas
       WHERE deleted_at IS NULL
       ORDER BY id DESC`
    );
    
    const recetas = recetasRes.rows;
    
    const variantesRes = await pool.query(
      `SELECT id, receta_id as "recetaId", nombre
       FROM recetas_variantes
       ORDER BY id ASC`
    );
    const variantes = variantesRes.rows;

    const detallesRes = await pool.query(
      `SELECT id, receta_id as "recetaId", producto as nombre, cantidad, medida, costo_unitario as "costoUnitario", variante_id as "varianteId"
       FROM recetas_detalles
       ORDER BY id ASC`
    );
    
    const detalles = detallesRes.rows.map(item => ({
      ...item,
      cantidad: parseFloat(item.cantidad),
      costoUnitario: parseFloat(item.costoUnitario)
    }));
    
    const result = recetas.map(r => ({
      ...r,
      variantes: variantes.filter(v => v.recetaId === r.id),
      ingredientes: detalles.filter(d => d.recetaId === r.id)
    }));
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener recetas' });
  }
});

// GET /api/recetas/:id — obtiene una receta, variantes y sus detalles
app.get('/api/recetas/:id', async (req, res) => {
  try {
    const recipeRes = await pool.query(
      `SELECT id, clave, platillo, descripcion, created_at
       FROM recetas
       WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!recipeRes.rows.length) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }
    const receta = recipeRes.rows[0];

    const variantesRes = await pool.query(
      `SELECT id, nombre FROM recetas_variantes WHERE receta_id = $1 ORDER BY id ASC`,
      [receta.id]
    );
    receta.variantes = variantesRes.rows;

    const detallesRes = await pool.query(
      `SELECT id, producto as nombre, cantidad, medida, costo_unitario as "costoUnitario", variante_id as "varianteId"
       FROM recetas_detalles
       WHERE receta_id = $1
       ORDER BY id ASC`,
      [receta.id]
    );

    receta.ingredientes = detallesRes.rows.map(item => ({
      ...item,
      cantidad: parseFloat(item.cantidad),
      costoUnitario: parseFloat(item.costoUnitario)
    }));

    res.json(receta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los detalles de la receta' });
  }
});

// POST /api/recetas — crea una receta con variantes e ingredientes en una transacción
app.post('/api/recetas', async (req, res) => {
  const { platillo, descripcion, ingredientes, variantes } = req.body;
  if (!platillo || !ingredientes || !Array.isArray(ingredientes)) {
    return res.status(400).json({ error: 'Campos obligatorios: platillo, ingredientes' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const clave = await getNextRecipeClave();

    const recipeRes = await client.query(
      `INSERT INTO recetas (clave, platillo, descripcion)
       VALUES ($1, $2, $3)
       RETURNING id, clave, platillo, descripcion, created_at`,
      [clave, platillo, descripcion || null]
    );
    const receta = recipeRes.rows[0];

    // Insertar variantes
    const variantIdMap = {};
    if (variantes && Array.isArray(variantes)) {
      for (const [vIndex, v] of variantes.entries()) {
        if (!v.nombre) continue;
        const vRes = await client.query(
          `INSERT INTO recetas_variantes (receta_id, nombre) VALUES ($1, $2) RETURNING id`,
          [receta.id, v.nombre]
        );
        variantIdMap[vIndex] = vRes.rows[0].id;
      }
    }

    for (const ing of ingredientes) {
      let varId = null;
      if (ing.varianteIndex !== undefined && variantIdMap[ing.varianteIndex]) {
        varId = variantIdMap[ing.varianteIndex];
      }
      
      await client.query(
        `INSERT INTO recetas_detalles (receta_id, producto, cantidad, medida, costo_unitario, variante_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          receta.id,
          ing.nombre || ing.producto,
          ing.cantidad,
          ing.medida,
          ing.costoUnitario || ing.costo_unitario || 0.00,
          varId
        ]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Receta creada' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la receta' });
  } finally {
    client.release();
  }
});

// PUT /api/recetas/:id — actualiza cabecera, variantes y detalles
app.put('/api/recetas/:id', async (req, res) => {
  const { platillo, descripcion, ingredientes, variantes } = req.body;
  const recetaId = req.params.id;

  if (!platillo || !ingredientes || !Array.isArray(ingredientes)) {
    return res.status(400).json({ error: 'Campos obligatorios: platillo, ingredientes' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateRes = await client.query(
      `UPDATE recetas
       SET platillo=$1, descripcion=$2, edited_at=now()
       WHERE id=$3 AND deleted_at IS NULL
       RETURNING id`,
      [platillo, descripcion || null, recetaId]
    );

    if (!updateRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    // Recrear variantes (estrategia simple: borrar y recrear o mapear)
    // Para simplificar, como las variaciones están en recetas_detalles y recetas_variantes (con cascada),
    // borramos todos los detalles, borramos variantes y reinsertamos.
    await client.query(`DELETE FROM recetas_detalles WHERE receta_id = $1`, [recetaId]);
    await client.query(`DELETE FROM recetas_variantes WHERE receta_id = $1`, [recetaId]);

    const variantIdMap = {};
    if (variantes && Array.isArray(variantes)) {
      for (const [vIndex, v] of variantes.entries()) {
        if (!v.nombre) continue;
        const vRes = await client.query(
          `INSERT INTO recetas_variantes (receta_id, nombre) VALUES ($1, $2) RETURNING id`,
          [recetaId, v.nombre]
        );
        variantIdMap[vIndex] = vRes.rows[0].id;
      }
    }

    for (const ing of ingredientes) {
      let varId = null;
      if (ing.varianteIndex !== undefined && variantIdMap[ing.varianteIndex]) {
        varId = variantIdMap[ing.varianteIndex];
      }

      await client.query(
        `INSERT INTO recetas_detalles (receta_id, producto, cantidad, medida, costo_unitario, variante_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          recetaId,
          ing.nombre || ing.producto,
          ing.cantidad,
          ing.medida,
          ing.costoUnitario || ing.costo_unitario || 0.00,
          varId
        ]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Receta actualizada' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la receta' });
  } finally {
    client.release();
  }
});

// DELETE /api/recetas/:id — soft delete de recetas
app.delete('/api/recetas/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE recetas SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Receta no encontrada' });
    res.json({ message: 'Receta eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar receta' });
  }
});

// ── GASTOS ───────────────────────────────────────────────

// Auxiliar para autogenerar folio GSTddmmNNN
async function getNextFolio() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const prefix = `GST${day}${month}`; // GST1905
  
  // Buscar el folio más alto con este prefijo
  const { rows } = await pool.query(
    `SELECT folio FROM gastos 
     WHERE folio LIKE $1 
     ORDER BY folio DESC LIMIT 1`,
    [`${prefix}%`]
  );
  
  if (rows.length === 0) {
    return `${prefix}001`;
  }
  
  const lastFolio = rows[0].folio;
  const lastNum = parseInt(lastFolio.substring(prefix.length)) || 0;
  const nextNum = String(lastNum + 1).padStart(3, '0');
  return `${prefix}${nextNum}`;
}

// GET /api/gastos — lista todos
app.get('/api/gastos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, folio, a_nombre as "aNombreDe", cantidad, forma_pago as "formaPago", TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, created_at
       FROM gastos
       WHERE deleted_at IS NULL
       ORDER BY fecha DESC, id DESC`
    );
    res.json(rows.map(r => ({ ...r, cantidad: parseFloat(r.cantidad) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
});

// GET /api/gastos/:id — obtiene uno
app.get('/api/gastos/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, folio, a_nombre as "aNombreDe", cantidad, forma_pago as "formaPago", TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, created_at
       FROM gastos 
       WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Gasto no encontrado' });
    const gasto = rows[0];
    gasto.cantidad = parseFloat(gasto.cantidad);
    res.json(gasto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener gasto' });
  }
});

// POST /api/gastos — crea uno nuevo
app.post('/api/gastos', async (req, res) => {
  const { fecha, aNombreDe, formaPago, cantidad } = req.body;
  if (!fecha || !aNombreDe || cantidad === undefined) {
    return res.status(400).json({ error: 'Campos obligatorios: fecha, aNombreDe, cantidad' });
  }
  try {
    const folio = await getNextFolio();
    const { rows } = await pool.query(
      `INSERT INTO gastos (folio, fecha, a_nombre, forma_pago, cantidad)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, folio, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, a_nombre as "aNombreDe", forma_pago as "formaPago", cantidad, created_at`,
      [folio, fecha, aNombreDe, formaPago || 'EFE', cantidad]
    );
    const gasto = rows[0];
    gasto.cantidad = parseFloat(gasto.cantidad);
    res.status(201).json(gasto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear gasto' });
  }
});

// PUT /api/gastos/:id — actualiza
app.put('/api/gastos/:id', async (req, res) => {
  const { fecha, aNombreDe, formaPago, cantidad } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE gastos
       SET fecha=$1, a_nombre=$2, forma_pago=$3, cantidad=$4, edited_at=now()
       WHERE id=$5 AND deleted_at IS NULL
       RETURNING id, folio, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, a_nombre as "aNombreDe", forma_pago as "formaPago", cantidad`,
      [fecha, aNombreDe, formaPago, cantidad, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Gasto no encontrado' });
    const gasto = rows[0];
    gasto.cantidad = parseFloat(gasto.cantidad);
    res.json(gasto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar gasto' });
  }
});

// DELETE /api/gastos/:id — soft delete
app.delete('/api/gastos/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE gastos SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json({ message: 'Gasto eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
});

// ── PRODUCTOS MAESTROS ────────────────────────────────────

// GET /api/productos — lista todos los productos maestros
app.get('/api/productos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.unit, p.category, p.created_at,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', pa.id,
                    'supplierDescription', pa.supplier_description,
                    'normalizedDescription', pa.normalized_description
                  ) ORDER BY pa.id ASC
                ) FILTER (WHERE pa.id IS NOT NULL),
                '[]'
              ) AS aliases
       FROM products p
       LEFT JOIN product_aliases pa ON pa.product_id = p.id
       WHERE p.deleted_at IS NULL
       GROUP BY p.id
       ORDER BY p.name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// POST /api/productos — crea un producto maestro
app.post('/api/productos', async (req, res) => {
  const { name, unit, category } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ error: 'Campos obligatorios: name, unit' });
  }
  const keywords = extractKeywords(name);
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, unit, category, keywords)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, unit, category, keywords, created_at`,
      [name.trim(), unit, category || null, keywords]
    );
    res.status(201).json({ ...rows[0], aliases: [] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(409).json({ error: 'Ya existe un producto maestro con ese nombre' });
    } else {
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }
});

// PUT /api/productos/:id — actualiza un producto maestro
app.put('/api/productos/:id', async (req, res) => {
  const { name, unit, category } = req.body;
  const keywords = extractKeywords(name);
  try {
    const { rows } = await pool.query(
      `UPDATE products
       SET name=$1, unit=$2, category=$3, keywords=$4, edited_at=now()
       WHERE id=$5 AND deleted_at IS NULL
       RETURNING id, name, unit, category, keywords`,
      [name.trim(), unit, category || null, keywords, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/productos/:id — soft delete de producto maestro
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE products SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ── ALIAS DE PRODUCTOS ────────────────────────────────────

// POST /api/productos/aliases — agrega un alias a un producto maestro
app.post('/api/productos/aliases', async (req, res) => {
  const { productId, supplierDescription } = req.body;
  if (!productId || !supplierDescription) {
    return res.status(400).json({ error: 'Campos obligatorios: productId, supplierDescription' });
  }
  const normalized = normalizeText(supplierDescription);
  try {
    const { rows } = await pool.query(
      `INSERT INTO product_aliases (product_id, supplier_description, normalized_description)
       VALUES ($1, $2, $3)
       ON CONFLICT (supplier_description) DO UPDATE
         SET product_id = EXCLUDED.product_id,
             normalized_description = EXCLUDED.normalized_description
       RETURNING id, product_id as "productId", supplier_description as "supplierDescription",
                 normalized_description as "normalizedDescription"`,
      [productId, supplierDescription.trim(), normalized]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar alias' });
  }
});

// DELETE /api/productos/aliases/:id — elimina un alias
app.delete('/api/productos/aliases/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM product_aliases WHERE id = $1`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Alias no encontrado' });
    res.json({ message: 'Alias eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar alias' });
  }
});

// ── RESOLUCIÓN DE CONCEPTOS XML ───────────────────────────

// POST /api/productos/resolver-conceptos
// Recibe un array de descripciones de proveedor desde un XML y responde:
//   - mapped: true  → alias exacto encontrado, product_id disponible
//   - mapped: false → lista de sugerencias fuzzy para que el usuario confirme
app.post('/api/productos/resolver-conceptos', async (req, res) => {
  const { conceptos } = req.body;
  if (!conceptos || !Array.isArray(conceptos)) {
    return res.status(400).json({ error: 'Se requiere un array de conceptos' });
  }

  try {
    const results = [];

    for (const concepto of conceptos) {
      if (!concepto || typeof concepto !== 'string') continue;
      const normalized = normalizeText(concepto);

      // Nivel 1 — Coincidencia exacta por alias normalizado
      const aliasRes = await pool.query(
        `SELECT pa.product_id, pa.supplier_description, p.name, p.unit
         FROM product_aliases pa
         JOIN products p ON pa.product_id = p.id
         WHERE pa.normalized_description = $1 AND p.deleted_at IS NULL`,
        [normalized]
      );

      if (aliasRes.rows.length > 0) {
        const match = aliasRes.rows[0];
        results.push({
          supplierDescription: concepto,
          mapped: true,
          confidence: 'exact',
          productId: match.product_id,
          productName: match.name,
          productUnit: match.unit,
          suggestions: []
        });
        continue;
      }

      // Nivel 2 — Búsqueda difusa trigram comparando KEYWORDS vs KEYWORDS
      // Elimina ruido (stopwords, envases, preposiciones) antes de comparar.
      const queryKeywords = extractKeywords(concepto);

      const similarityRes = await pool.query(
        `SELECT
           p.id,
           p.name,
           p.unit,
           p.keywords,
           CASE
             WHEN p.keywords IS NOT NULL AND p.keywords <> ''
               THEN similarity(p.keywords, $3)
             ELSE GREATEST(similarity(p.name, $1), similarity(p.name, $2))
           END AS trigram_score
         FROM products p
         WHERE
           p.deleted_at IS NULL
           AND (
             (p.keywords IS NOT NULL AND p.keywords <> '' AND similarity(p.keywords, $3) > 0.10)
             OR
             (p.keywords IS NULL AND GREATEST(similarity(p.name, $1), similarity(p.name, $2)) > 0.10)
           )
         ORDER BY trigram_score DESC
         LIMIT 5`,
        [concepto, normalized, queryKeywords]
      );

      const qWords = queryKeywords ? queryKeywords.split(' ') : [];

      const suggestions = similarityRes.rows.map(row => {
        let score = parseFloat(row.trigram_score);
        let mWordsLength = 0;
        
        if (row.keywords && qWords.length > 0) {
          const mWords = row.keywords.split(' ');
          mWordsLength = mWords.length;
          
          if (mWordsLength > 0) {
            let matches = 0;
            for (const mw of mWords) {
              if (qWords.includes(mw)) matches++;
            }
            const containment = matches / mWordsLength;
            // Tomamos el mayor entre la similitud trigram y la contención de palabras.
            score = Math.max(score, containment);
          }
        }
        
        return {
          id: row.id,
          name: row.name,
          unit: row.unit,
          mWordsLength,
          score: Math.round(score * 100)
        };
      });

      // Re-ordenar porque el score pudo haber cambiado con la contención.
      // Desempate: el que tenga más palabras maestras (es más específico).
      suggestions.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.mWordsLength - a.mWordsLength;
      });

      const topScore = suggestions[0]?.score ?? 0;

      // >= 80% → mapeo automático (subimos a 80% por seguridad)
      if (topScore >= 80) {
        const top = suggestions[0];
        results.push({
          supplierDescription: concepto,
          mapped: true,
          confidence: 'auto',
          productId: top.id,
          productName: top.name,
          productUnit: top.unit,
          suggestions: []
        });
        continue;
      }

      // < 15% → Se marca para creación automática
      if (topScore < 15) {
        results.push({
          supplierDescription: concepto,
          mapped: false,
          confidence: 'auto_new',
          productId: null,
          productName: null,
          productUnit: null,
          suggestions: []
        });
        continue;
      }

      // 40–79% → sugerencia fuerte
      // 15–39% → low
      const confidence = topScore >= 40 ? 'medium' : 'low';

      results.push({
        supplierDescription: concepto,
        mapped: false,
        confidence,
        productId: null,
        productName: null,
        productUnit: null,
        suggestions
      });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al resolver conceptos' });
  }
});

// ── CHECADOR / ASISTENCIAS ──────────────────────────────────

// Fórmula de Haversine para calcular distancia en metros entre dos coordenadas
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // en metros
}

// Coordenadas del restaurante (por defecto o .env)
const RESTAURANTE_LAT = parseFloat(process.env.RESTAURANTE_LAT || '19.441420172667815');
const RESTAURANTE_LNG = parseFloat(process.env.RESTAURANTE_LNG || '-99.20407554673784');

// POST /api/checador/registro — Registra entrada o salida
app.post('/api/checador/registro', async (req, res) => {
  const { usuarioId, tipo, latitud, longitud, deviceToken } = req.body;

  if (!usuarioId || !tipo || !latitud || !longitud || !deviceToken) {
    return res.status(400).json({ error: 'Faltan datos requeridos (usuarioId, tipo, latitud, longitud, deviceToken).' });
  }

  try {
    // 1. Validar Distancia (Radio de 200 metros)
    const distancia = calculateDistance(RESTAURANTE_LAT, RESTAURANTE_LNG, latitud, longitud);
    if (distancia > 200) {
      return res.status(403).json({ 
        error: `Estás fuera del rango permitido. Distancia actual: ${Math.round(distancia)} metros (Máximo 200m).` 
      });
    }

    // 2. Validar Un Solo Dispositivo
    const userRes = await pool.query('SELECT device_token FROM usuarios WHERE id = $1 AND deleted_at IS NULL', [usuarioId]);
    if (!userRes.rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const savedToken = userRes.rows[0].device_token;
    
    // Si no tiene token, se lo asignamos (primer login en checador)
    if (!savedToken) {
      await pool.query('UPDATE usuarios SET device_token = $1 WHERE id = $2', [deviceToken, usuarioId]);
    } else if (savedToken !== deviceToken) {
      // Si tiene token y no coincide, rechazamos
      return res.status(403).json({ 
        error: 'Este dispositivo no es el registrado para tu cuenta. Contacta a un administrador para cambiar de dispositivo.' 
      });
    }

    // 3. Validar duplicados y secuencia lógica en el día de hoy
    const asistHoyRes = await pool.query(`
      SELECT tipo 
      FROM asistencias 
      WHERE usuario_id = $1 
        AND created_at::date = CURRENT_DATE
    `, [usuarioId]);
    
    const asistenciasHoy = asistHoyRes.rows.map(r => r.tipo);

    if (tipo === 'Entrada') {
      if (asistenciasHoy.includes('Entrada')) {
        return res.status(400).json({ error: 'Ya has registrado tu entrada el día de hoy.' });
      }
    } else if (tipo === 'Salida') {
      if (!asistenciasHoy.includes('Entrada')) {
        return res.status(400).json({ error: 'No puedes registrar salida sin haber registrado tu entrada hoy.' });
      }
      if (asistenciasHoy.includes('Salida')) {
        return res.status(400).json({ error: 'Ya has registrado tu salida el día de hoy.' });
      }
    }

    // 4. Validar horario semanal — fuente de verdad única
    // Calcular día de semana actual en zona horaria local del servidor (0=Lun … 6=Dom)
    const ahora = new Date();
    const diaSemanaJS = ahora.getDay(); // 0=Dom, 1=Lun, …, 6=Sáb
    const diaSemanaDB = diaSemanaJS === 0 ? 6 : diaSemanaJS - 1; // 0=Lun … 6=Dom

    const horarioRes = await pool.query(
      `SELECT tipo, hora_entrada, hora_salida
       FROM horarios_semanales
       WHERE usuario_id = $1 AND dia_semana = $2`,
      [usuarioId, diaSemanaDB]
    );

    if (!horarioRes.rows.length) {
      return res.status(403).json({
        error: 'No tienes un turno programado para hoy. Contacta a tu administrador.'
      });
    }

    const horario = horarioRes.rows[0];

    if (horario.tipo === 'descanso') {
      return res.status(403).json({
        error: 'Hoy es tu día de descanso. No puedes registrar asistencia.'
      });
    }

    // Solo validar ventana de tiempo para Entrada
    if (tipo === 'Entrada' && horario.hora_entrada) {
      // hora_entrada viene como "HH:MM:SS" o "HH:MM" desde PostgreSQL TIME
      const [hh, mm] = horario.hora_entrada.toString().split(':').map(Number);

      // Construir fecha/hora de inicio de turno (hoy a hh:mm)
      const inicioTurno = new Date(ahora);
      inicioTurno.setHours(hh, mm, 0, 0);

      // Límite mínimo: 15 minutos ANTES del inicio de turno
      const limiteMinimo = new Date(inicioTurno.getTime() - 15 * 60 * 1000);

      if (ahora < limiteMinimo) {
        // Formatear la hora mínima para el mensaje
        const hMin = String(limiteMinimo.getHours()).padStart(2, '0');
        const mMin = String(limiteMinimo.getMinutes()).padStart(2, '0');
        const hTurno = String(hh).padStart(2, '0');
        const mTurno = String(mm).padStart(2, '0');
        return res.status(403).json({
          error: `Aún es muy temprano. Tu turno inicia a las ${hTurno}:${mTurno}. Puedes checar a partir de las ${hMin}:${mMin}.`
        });
      }
    }

    // 5. Registrar Asistencia (el TIMESTAMP lo pone la base de datos)
    const { rows } = await pool.query(
      `INSERT INTO asistencias (usuario_id, tipo, latitud, longitud, distancia_metros)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, tipo, distancia_metros, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as fecha_hora`,
      [usuarioId, tipo, latitud, longitud, Math.round(distancia)]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar el registro de asistencia' });
  }
});


// GET /api/checador/historial — Obtener historial de asistencias
app.get('/api/checador/historial', async (req, res) => {
  const { usuarioId } = req.query;
  try {
    let query = `
      SELECT a.id, u.nombre as usuario, a.tipo, a.distancia_metros, TO_CHAR(a.created_at, 'YYYY-MM-DD HH24:MI:SS') as fecha_hora
      FROM asistencias a
      JOIN usuarios u ON a.usuario_id = u.id
    `;
    const params = [];
    if (usuarioId) {
      query += ` WHERE a.usuario_id = $1 `;
      params.push(usuarioId);
    }
    query += ` ORDER BY a.created_at DESC LIMIT 100`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// ==========================================
// RUTAS DE NOMINA
// ==========================================

// GET /api/nomina
app.get('/api/nomina', async (req, res) => {
  const { fecha } = req.query; // YYYY-MM-DD
  if (!fecha) {
    return res.status(400).json({ error: 'La fecha es requerida' });
  }

  try {
    const query = `
      SELECT 
        n.id,
        n.usuario_id,
        u.nombre AS usuario,
        n.rol,
        TO_CHAR(n.hora_entrada, 'HH24:MI') as hora_entrada,
        TO_CHAR(n.hora_salida, 'HH24:MI') as hora_salida,
        TO_CHAR(n.fecha, 'YYYY-MM-DD') as fecha,
        a.created_at AS hora_real_entrada,
        s.created_at AS hora_real_salida
      FROM nomina n
      JOIN usuarios u ON n.usuario_id = u.id
      LEFT JOIN (
        SELECT usuario_id, MIN(created_at) as created_at
        FROM asistencias 
        WHERE tipo = 'Entrada' 
          AND TO_CHAR(created_at, 'YYYY-MM-DD') = $1
        GROUP BY usuario_id
      ) a ON n.usuario_id = a.usuario_id
      LEFT JOIN (
        SELECT usuario_id, MIN(created_at) as created_at
        FROM asistencias 
        WHERE tipo = 'Salida' 
          AND TO_CHAR(created_at, 'YYYY-MM-DD') = $1
        GROUP BY usuario_id
      ) s ON n.usuario_id = s.usuario_id
      WHERE TO_CHAR(n.fecha, 'YYYY-MM-DD') = $1
      ORDER BY n.hora_entrada ASC
    `;
    const { rows } = await pool.query(query, [fecha]);

    const now = new Date();
    
    const result = rows.map(row => {
      let estado = 'pendiente';
      let horaExacta = null;
      let horaExactaSalida = null;

      const horaEntradaDate = new Date(`${fecha}T${row.hora_entrada}:00`);

      // Ventanas de tiempo relativas a hora_entrada
      const ventanaPuntualMin  = new Date(horaEntradaDate.getTime() -  5 * 60000); // -5 min
      const ventanaPuntualMax  = new Date(horaEntradaDate.getTime() +  5 * 60000); // +5 min
      const ventanaRetardoMax  = new Date(horaEntradaDate.getTime() + 15 * 60000); // +15 min
      const ventanaFalta       = new Date(horaEntradaDate.getTime() + 2 * 3600000); // +2 h

      if (row.hora_real_salida) {
        const horaRealS = new Date(row.hora_real_salida);
        horaExactaSalida = horaRealS.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      }

      if (row.hora_real_entrada) {
        // El empleado YA checó → calcular puntualidad
        const horaReal = new Date(row.hora_real_entrada);
        horaExacta = horaReal.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

        if (horaReal >= ventanaPuntualMin && horaReal <= ventanaPuntualMax) {
          estado = 'puntual';        // checó dentro de ±5 min
        } else if (horaReal > ventanaPuntualMax && horaReal <= ventanaRetardoMax) {
          estado = 'retardo';        // checó entre 5 y 15 min tarde
        } else if (horaReal > ventanaRetardoMax) {
          estado = 'retardo_grave';  // checó más de 15 min tarde
        } else {
          // Llegó antes de la ventana puntual mínima (muy temprano, el checador ya lo controla)
          estado = 'puntual';
        }
      } else {
        // El empleado NO ha checado → evaluar por tiempo actual
        if (now >= ventanaFalta) {
          estado = 'falta';      // pasaron 2+ horas sin checar
        } else {
          estado = 'pendiente';  // aún no es su turno o tiene tiempo
        }
      }

      return {
        ...row,
        estadoChecado: estado,
        horaExacta,
        horaExactaSalida
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la nómina' });
  }
});

// POST /api/nomina — acepta un registro o un array de registros (fechas múltiples)
app.post('/api/nomina', async (req, res) => {
  // Soporte para payload único o array
  const payload = req.body;
  const registros = Array.isArray(payload) ? payload : [payload];

  if (!registros.length) {
    return res.status(400).json({ error: 'Se requiere al menos un registro' });
  }

  // Validar cada registro
  for (const r of registros) {
    if (!r.usuario_id || !r.hora_entrada || !r.hora_salida || !r.fecha) {
      return res.status(400).json({ error: 'Faltan datos requeridos en uno o más registros' });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertados = [];
    for (const r of registros) {
      // Evitar duplicados: si ya existe un registro para ese usuario y fecha, se omite
      const existing = await client.query(
        `SELECT id FROM nomina WHERE usuario_id = $1 AND fecha = $2`,
        [r.usuario_id, r.fecha]
      );
      if (existing.rows.length > 0) continue;

      const { rows } = await client.query(
        `INSERT INTO nomina (usuario_id, rol, hora_entrada, hora_salida, fecha)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [r.usuario_id, r.rol || 'N/A', r.hora_entrada, r.hora_salida, r.fecha]
      );
      insertados.push(rows[0]);
    }
    await client.query('COMMIT');
    res.status(201).json(insertados);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al crear registros en nómina' });
  } finally {
    client.release();
  }
});

// ── HORARIOS SEMANALES ────────────────────────────────────

// GET /api/horarios-semanales/:usuario_id
app.get('/api/horarios-semanales/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT
         dia_semana,
         tipo,
         TO_CHAR(hora_entrada, 'HH24:MI') as hora_entrada,
         TO_CHAR(hora_salida,  'HH24:MI') as hora_salida
       FROM horarios_semanales
       WHERE usuario_id = $1
       ORDER BY dia_semana ASC`,
      [usuario_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener horario semanal' });
  }
});

// PUT /api/horarios-semanales/:usuario_id — reemplaza el horario semanal completo
app.put('/api/horarios-semanales/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  const { dias } = req.body; // Array of { dia_semana, tipo, hora_entrada, hora_salida }

  if (!Array.isArray(dias)) {
    return res.status(400).json({ error: 'Se requiere un array de días' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Eliminar el horario anterior del usuario
    await client.query(`DELETE FROM horarios_semanales WHERE usuario_id = $1`, [usuario_id]);
    // Insertar los nuevos
    for (const d of dias) {
      if (d.dia_semana === undefined || d.dia_semana === null) continue;
      await client.query(
        `INSERT INTO horarios_semanales (usuario_id, dia_semana, tipo, hora_entrada, hora_salida)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          usuario_id,
          d.dia_semana,
          d.tipo || 'laboral',
          d.tipo === 'descanso' ? null : (d.hora_entrada || null),
          d.tipo === 'descanso' ? null : (d.hora_salida  || null)
        ]
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Horario semanal guardado correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al guardar horario semanal' });
  } finally {
    client.release();
  }
});

// POST /api/usuarios/:id/reset-device — Limpiar el token de un usuario
app.post('/api/usuarios/:id/reset-device', async (req, res) => {
  try {
    const { rowCount } = await pool.query('UPDATE usuarios SET device_token = NULL WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Dispositivo desvinculado correctamente. El usuario podrá registrar uno nuevo.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al desvincular dispositivo' });
  }
});

// ── CARTA (PLATILLOS) ─────────────────────────────────────

// GET /api/platillos — Lista todos los platillos de la carta
app.get('/api/platillos', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.id, p.nombre, p.descripcion, p.categoria, p.tipo, 
        p.receta_base_id as "recetaBaseId", p.privado, 
        p.precio_base as "precioBase", p.imagen_url as "imagenUrl", 
        p.variables, p.created_at
      FROM platillos p
      WHERE p.deleted_at IS NULL
      ORDER BY p.categoria ASC, p.nombre ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener platillos' });
  }
});

// GET /api/platillos/:id — Obtiene un platillo específico
app.get('/api/platillos/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.id, p.nombre, p.descripcion, p.categoria, p.tipo, 
        p.receta_base_id as "recetaBaseId", p.privado, 
        p.precio_base as "precioBase", p.imagen_url as "imagenUrl", 
        p.variables, p.created_at
      FROM platillos p
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `, [req.params.id]);
    
    if (!rows.length) return res.status(404).json({ error: 'Platillo no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el platillo' });
  }
});

// POST /api/platillos — Crea un nuevo platillo
app.post('/api/platillos', async (req, res) => {
  const { 
    nombre, descripcion, categoria, tipo, recetaBaseId, 
    privado, precioBase, imagenUrl, variables 
  } = req.body;

  if (!nombre || !categoria || !tipo) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, categoria, tipo)' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO platillos 
        (nombre, descripcion, categoria, tipo, receta_base_id, privado, precio_base, imagen_url, variables)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING 
        id, nombre, descripcion, categoria, tipo, receta_base_id as "recetaBaseId", 
        privado, precio_base as "precioBase", imagen_url as "imagenUrl", variables`,
      [
        nombre, 
        descripcion || null, 
        categoria, 
        tipo, 
        recetaBaseId || null, 
        privado || false, 
        precioBase || 0, 
        imagenUrl || null, 
        variables ? JSON.stringify(variables) : '[]'
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear platillo' });
  }
});

// PUT /api/platillos/:id — Actualiza un platillo (ej. toggle privado)
app.put('/api/platillos/:id', async (req, res) => {
  const { 
    privado, nombre, descripcion, categoria, tipo, 
    recetaBaseId, precioBase, imagenUrl, variables 
  } = req.body;

  try {
    // Si solo mandamos "privado" (desde la tabla) hacemos actualización parcial
    if (privado !== undefined && nombre === undefined) {
      const { rows } = await pool.query(
        `UPDATE platillos 
         SET privado = $1, edited_at = now() 
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING id, privado`,
        [privado, req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Platillo no encontrado' });
      return res.json(rows[0]);
    }
    
    // Si mandamos todo el objeto para edición completa
    if (nombre !== undefined && categoria !== undefined) {
      const { rows } = await pool.query(
        `UPDATE platillos 
         SET nombre=$1, descripcion=$2, categoria=$3, tipo=$4, receta_base_id=$5, 
             privado=$6, precio_base=$7, imagen_url=$8, variables=$9, edited_at=now()
         WHERE id=$10 AND deleted_at IS NULL
         RETURNING *`,
        [
          nombre, descripcion || null, categoria, tipo, 
          req.body.recetaBaseId || null, req.body.privado || false, 
          req.body.precioBase || 0, req.body.imagenUrl || null, 
          req.body.variables ? JSON.stringify(req.body.variables) : '[]',
          req.params.id
        ]
      );
      if (!rows.length) return res.status(404).json({ error: 'Platillo no encontrado' });
      return res.json(rows[0]);
    }
    
    return res.status(400).json({ error: 'No se enviaron datos válidos para actualizar' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar platillo' });
  }
});

// DELETE /api/platillos/:id — Soft delete
app.delete('/api/platillos/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE platillos SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Platillo no encontrado' });
    res.json({ message: 'Platillo eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar platillo' });
  }
});

// ── ORDENES KANBAN ────────────────────────────────────────

// GET /api/ordenes — Obtiene las órdenes activas para el tablero Kanban
app.get('/api/ordenes', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, numero_pedido as "numeroPedido", cliente_nombre as "clienteNombre", 
        cliente_telefono as "clienteTelefono", cliente_email as "clienteEmail", 
        cliente_direccion as "clienteDireccion", cliente_referencias as "clienteReferencias", 
        pago_metodo as "pagoMetodo", tipo_entrega as "tipoEntrega", 
        total, costo_envio as "costoEnvio", estado, productos, 
        usuario_cobro as "usuarioCobro",
        hora_entrega as "horaEntrega", notas_pedido as "notasPedido",
        TO_CHAR(created_at, 'HH24:MI') as "horaCreada",
        created_at as "createdAt"
      FROM ordenes 
      WHERE estado IN ('Nuevo', 'En preparación', 'En entrega') 
      ORDER BY id ASC
    `;
    const { rows } = await pool.query(query);
    
    const formatted = rows.map(r => ({
      ...r,
      total: parseFloat(r.total),
      costoEnvio: parseFloat(r.costoEnvio),
      productos: typeof r.productos === 'string' ? JSON.parse(r.productos) : r.productos
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error('Error al obtener órdenes:', err);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// POST /api/ordenes — Crea una nueva orden desde el cliente
app.post('/api/ordenes', async (req, res) => {
  const { 
    clienteNombre, clienteTelefono, clienteEmail, 
    clienteDireccion, clienteReferencias, pagoMetodo, 
    tipoEntrega, total, costoEnvio, productos, usuarioCobro,
    horaEntrega, notasPedido, suscriptorId
  } = req.body;

  if (!clienteNombre || !clienteTelefono || !productos || !Array.isArray(productos)) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes (clienteNombre, clienteTelefono, productos)' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const nextPedQuery = `
      INSERT INTO ordenes 
        (numero_pedido, cliente_nombre, cliente_telefono, cliente_email, 
         cliente_direccion, cliente_referencias, pago_metodo, tipo_entrega, 
         total, costo_envio, estado, productos, usuario_cobro, hora_entrega, notas_pedido)
      VALUES 
        (
          '#' || (COALESCE((SELECT max(id) FROM ordenes), 0) + 2500 + 1),
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $11, $10, $12, $13, $14
        )
      RETURNING 
        id, numero_pedido as "numeroPedido", cliente_nombre as "clienteNombre", 
        cliente_telefono as "clienteTelefono", cliente_email as "clienteEmail", 
        cliente_direccion as "clienteDireccion", cliente_referencias as "clienteReferencias", 
        pago_metodo as "pagoMetodo", tipo_entrega as "tipoEntrega", 
        total, costo_envio as "costoEnvio", estado, productos, 
        hora_entrega as "horaEntrega", notas_pedido as "notasPedido",
        TO_CHAR(created_at, 'HH24:MI') as "horaCreada"
    `;

    const { rows } = await client.query(nextPedQuery, [
      clienteNombre,
      clienteTelefono,
      clienteEmail || null,
      clienteDireccion || null,
      clienteReferencias || null,
      pagoMetodo || 'Efectivo',
      tipoEntrega || 'domicilio',
      total || 0,
      costoEnvio || 0,
      JSON.stringify(productos),
      req.body.estado || 'Nuevo',
      usuarioCobro || null,
      horaEntrega || null,
      notasPedido || null
    ]);

    // Lógica de Lealtad (Atada a la creación de la orden de forma segura)
    if (suscriptorId) {
      const checkQuery = 'SELECT * FROM suscriptores WHERE id = $1';
      const checkRes = await client.query(checkQuery, [suscriptorId]);
      
      if (checkRes.rows.length > 0) {
        const sub = checkRes.rows[0];
        const nuevosPedidos = (sub.pedidos_lealtad || 0) + 1;
        
        const updateQuery = 'UPDATE suscriptores SET pedidos_lealtad = $1 WHERE id = $2 RETURNING *';
        await client.query(updateQuery, [nuevosPedidos, suscriptorId]);
        
        // Si hay reclamo de recompensa en esta orden, incrementamos el contador
        if (req.body.reclamoRecompensa) {
          const updateRecompensaQuery = 'UPDATE suscriptores SET recompensas_reclamadas = COALESCE(recompensas_reclamadas, 0) + 1 WHERE id = $1';
          await client.query(updateRecompensaQuery, [suscriptorId]);
        }
        
        // Si llega a un múltiplo de 10, enviar correo (fuera de la tx principal si es lento, pero lo enviamos aquí)
        if (nuevosPedidos > 0 && nuevosPedidos % 10 === 0 && sub.correo) {
          try {
            // Requiere que sendRewardEmail esté importado/definido
            await sendRewardEmail(sub.correo, sub.nombre, sub.id);
          } catch (e) {
            console.error("Error al enviar correo de recompensa:", e);
          }
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al crear orden:', err);
    res.status(500).json({ error: 'Error al crear orden' });
  } finally {
    client.release();
  }
});

// PUT /api/ordenes/:id/status — Actualiza el estado de la orden
app.put('/api/ordenes/:id/status', async (req, res) => {
  const { estado } = req.body;
  const { id } = req.params;

  if (!estado) {
    return res.status(400).json({ error: 'El estado es obligatorio' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE ordenes
       SET estado = $1, edited_at = now()
       WHERE id = $2
       RETURNING id, estado`,
      [estado, id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar estado de la orden:', err);
    res.status(500).json({ error: 'Error al actualizar estado de la orden' });
  }
});

// ── VENTAS ────────────────────────────────────────────────
// GET /api/ventas — Obtiene todas las ventas (ordenes) en un rango de fechas
app.get('/api/ventas', async (req, res) => {
  let { startDate, endDate } = req.query;
  
  if (!startDate) {
    // Si no se envía fecha, se usa la actual por defecto
    const today = new Date();
    // Ajustar a zona horaria local de México si es necesario, pero como
    // usamos fechas simples, untoISOString() es un punto de partida seguro.
    const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
                      .toISOString().split('T')[0];
    startDate = todayStr;
  }
  if (!endDate) {
    endDate = startDate;
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, numero_pedido as "numeroPedido", cliente_nombre as "clienteNombre", 
              pago_metodo as "pagoMetodo", total, estado,
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as "fechaHora",
              created_at as "createdAt"
       FROM ordenes
       WHERE created_at >= $1::date 
         AND created_at < ($2::date + interval '1 day')
         AND LOWER(pago_metodo) != 'cxc'
       ORDER BY created_at DESC`,
      [startDate, endDate]
    );
    
    const formatted = rows.map(r => ({
      ...r,
      total: parseFloat(r.total)
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error('Error al obtener ventas:', err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// ── CUENTAS POR COBRAR (CXC) ──────────────────────────────

// GET /api/cxc — Obtiene el resumen de deudas por cliente
app.get('/api/cxc', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT UPPER(cliente_nombre) as "nombre",
              COUNT(id) as "ordenesCount",
              MAX(created_at) as "ultimaFecha",
              SUM(total) as "totalDeuda"
       FROM ordenes
       WHERE LOWER(pago_metodo) = 'cxc' AND estado != 'Cancelada'
       GROUP BY UPPER(cliente_nombre)
       ORDER BY "ultimaFecha" DESC`
    );
    
    const formatted = rows.map(r => ({
      ...r,
      ordenesCount: parseInt(r.ordenesCount, 10),
      totalDeuda: parseFloat(r.totalDeuda)
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error('Error al obtener CXC:', err);
    res.status(500).json({ error: 'Error al obtener resumen de cuentas por cobrar' });
  }
});

// GET /api/cxc/:cliente — Obtiene el detalle de órdenes que debe un cliente
app.get('/api/cxc/:cliente', async (req, res) => {
  try {
    const { cliente } = req.params;
    const { rows } = await pool.query(
      `SELECT id, numero_pedido as "numeroPedido", total, 
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as "fechaHora",
              productos
       FROM ordenes
       WHERE LOWER(pago_metodo) = 'cxc' 
         AND UPPER(cliente_nombre) = UPPER($1) 
         AND estado != 'Cancelada'
       ORDER BY created_at ASC`,
      [cliente]
    );
    
    const formatted = rows.map(r => ({
      ...r,
      total: parseFloat(r.total),
      productos: typeof r.productos === 'string' ? JSON.parse(r.productos) : r.productos
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error('Error al obtener detalle CXC:', err);
    res.status(500).json({ error: 'Error al obtener detalle de deuda' });
  }
});

// POST /api/cxc/pagar — Liquida la deuda de un cliente cambiando el método de pago
app.post('/api/cxc/pagar', async (req, res) => {
  try {
    const { clienteNombre, metodoPago } = req.body;
    if (!clienteNombre || !metodoPago) {
      return res.status(400).json({ error: 'Faltan datos requeridos (clienteNombre, metodoPago)' });
    }

    const { rowCount } = await pool.query(
      `UPDATE ordenes
       SET pago_metodo = $1
       WHERE UPPER(cliente_nombre) = UPPER($2) AND LOWER(pago_metodo) = 'cxc' AND estado != 'Cancelada'`,
      [metodoPago, clienteNombre]
    );

    res.json({ message: 'Deuda liquidada correctamente', ordenesActualizadas: rowCount });
  } catch (err) {
    console.error('Error al liquidar deuda CXC:', err);
    res.status(500).json({ error: 'Error al liquidar deuda' });
  }
});

// ── CORTE DE CAJA ──────────────────────────────────────────

// GET /api/corte — Combina ventas y gastos de un día específico
app.get('/api/corte', async (req, res) => {
  try {
    const dateStr = req.query.fecha; // YYYY-MM-DD
    if (!dateStr) return res.status(400).json({ error: 'Se requiere la fecha (YYYY-MM-DD)' });

    const { rows: ventas } = await pool.query(
      `SELECT id, numero_pedido as descripcion, cliente_nombre as entidad, 
              pago_metodo, total as monto, created_at, usuario_cobro
       FROM ordenes
       WHERE DATE(created_at) = $1::date AND estado != 'Cancelada'`,
      [dateStr]
    );

    const { rows: gastos } = await pool.query(
      `SELECT id, folio as descripcion, a_nombre as entidad, 
              forma_pago as pago_metodo, cantidad as monto, fecha as created_at
       FROM gastos
       WHERE DATE(fecha) = $1::date AND deleted_at IS NULL`,
      [dateStr]
    );

    const movimientos = [
      ...ventas.map(v => ({
        id: `v-${v.id}`,
        tipo: 'Ingreso',
        descripcion: `Orden ${v.descripcion}`,
        entidad: v.entidad,
        pago_metodo: v.pago_metodo,
        monto: parseFloat(v.monto),
        fecha: v.created_at,
        usuario: v.usuario_cobro || 'Desconocido'
      })),
      ...gastos.map(g => ({
        id: `g-${g.id}`,
        tipo: 'Egreso',
        descripcion: `Gasto ${g.descripcion || ''}`.trim(),
        entidad: g.entidad,
        pago_metodo: g.pago_metodo,
        monto: parseFloat(g.monto),
        fecha: g.created_at,
        usuario: 'N/A'
      }))
    ];

    movimientos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    res.json(movimientos);
  } catch (err) {
    console.error('Error al obtener corte:', err);
    res.status(500).json({ error: 'Error al obtener el corte de caja' });
  }
});

// ── CLIENTES ──────────────────────────────────────────────

// GET /api/clientes — Lista de clientes (agrupando ordenes por telefono)
app.get('/api/clientes', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `WITH combined AS (
        SELECT 
          id::text as id,
          cliente_nombre as nombre,
          cliente_telefono as telefono,
          created_at as ultimoPedido,
          (estado IN ('Nuevo', 'Preparando')) as cuentaAbierta,
          1 as is_pedido
        FROM ordenes
        WHERE cliente_nombre IS NOT NULL
        
        UNION ALL
        
        SELECT
          id::text as id,
          nombre,
          numero as telefono,
          fecha_alta as ultimoPedido,
          false as cuentaAbierta,
          0 as is_pedido
        FROM suscriptores
      )
      SELECT 
        MAX(id) as id,
        UPPER(MAX(nombre)) as nombre,
        MAX(telefono) as telefono,
        SUM(is_pedido) as pedidos,
        TO_CHAR(MAX(ultimoPedido), 'DD/MM/YYYY HH24:MI') as "ultimoPedido",
        BOOL_OR(cuentaAbierta) as "cuentaAbierta"
      FROM combined
      GROUP BY 
        CASE 
          WHEN telefono IN ('N/A', 'n/a', '', 'null') OR telefono IS NULL THEN UPPER(nombre)
          ELSE telefono
        END
      ORDER BY MAX(ultimoPedido) DESC`
    );

    const clientes = rows.map(r => ({
      id: r.id,
      nombre: r.nombre,
      telefono: r.telefono || 'N/A',
      pedidos: parseInt(r.pedidos, 10),
      ultimoPedido: r.ultimoPedido,
      platilloFavorito: 'Ver historial', // Simplificado
      cuenta: {
        estado: r.cuentaAbierta ? 'Abierta' : 'Cerrada'
      }
    }));

    res.json(clientes);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /api/clientes/ordenes — Historial de ordenes de un cliente
app.get('/api/clientes/ordenes', async (req, res) => {
  try {
    const { telefono, nombre } = req.query;
    let queryStr = '';
    let queryParams = [];

    if (!telefono || telefono.toUpperCase() === 'N/A' || telefono === 'null' || telefono === '') {
      queryStr = `SELECT id, numero_pedido, TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as fecha, productos, total
                  FROM ordenes 
                  WHERE UPPER(cliente_nombre) = UPPER($1) 
                    AND (cliente_telefono IN ('N/A', 'n/a', '', 'null') OR cliente_telefono IS NULL)
                  ORDER BY created_at DESC`;
      queryParams = [nombre];
    } else {
      queryStr = `SELECT id, numero_pedido, TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as fecha, productos, total
                  FROM ordenes WHERE cliente_telefono = $1 ORDER BY created_at DESC`;
      queryParams = [telefono];
    }

    const { rows } = await pool.query(queryStr, queryParams);

    const ordenes = rows.map(r => {
      let prodsArr = [];
      try {
        prodsArr = typeof r.productos === 'string' ? JSON.parse(r.productos) : r.productos;
      } catch (e) {
        prodsArr = [];
      }
      
      const nombresProductos = Array.isArray(prodsArr) 
        ? prodsArr.map(p => p.nombre || p.producto || p.name || 'Producto').join(', ')
        : 'Productos';

      return {
        id: r.numero_pedido || `#ORD-${r.id}`,
        fecha: r.fecha,
        productos: nombresProductos,
        total: parseFloat(r.total) || 0
      };
    });

    res.json(ordenes);
  } catch (err) {
    console.error('Error al obtener historial del cliente:', err);
    res.status(500).json({ error: 'Error al obtener historial del cliente' });
  }
});


// ── SUSCRIPTORES ────────────────────────────────────────────

// GET /api/suscriptores - Obtener lista
app.get('/api/suscriptores', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM suscriptores ORDER BY fecha_alta DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener suscriptores:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/suscriptores - Crear suscriptor y enviar email
app.post('/api/suscriptores', async (req, res) => {
  const { nombre, numero, correo } = req.body;
  if (!nombre || !correo) {
    return res.status(400).json({ error: 'Nombre y correo son requeridos.' });
  }

  try {
    const id = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Insert into DB
    const insertQuery = `
      INSERT INTO suscriptores (id, nombre, numero, correo)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [id, nombre, numero, correo]);

    // Send email
    if (correo) {
      // fire and forget or await
      sendSubscriberEmail(correo, nombre, id).catch(err => console.error("Error envío:", err));
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error al crear suscriptor:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/suscriptores/:id - Actualizar
app.put('/api/suscriptores/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, numero, correo } = req.body;
  try {
    const query = `
      UPDATE suscriptores
      SET nombre = $1, numero = $2, correo = $3
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [nombre, numero, correo, id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Suscriptor no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar suscriptor:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// DELETE /api/suscriptores/:id - Eliminar
app.delete('/api/suscriptores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM suscriptores WHERE id = $1 RETURNING *;';
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Suscriptor no encontrado' });
    res.json({ message: 'Suscriptor eliminado con éxito' });
  } catch (err) {
    console.error('Error al eliminar suscriptor:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// (El endpoint POST /api/suscriptores/:id/lealtad fue eliminado para robustecer el backend; ahora los puntos se suman exclusivamente en POST /api/ordenes)

// POST /api/suscriptores/:id/reclamar - Reclamar recompensa (incrementa reclamadas)
app.post('/api/suscriptores/:id/reclamar', async (req, res) => {
  const { id } = req.params;
  try {
    const checkQuery = 'SELECT * FROM suscriptores WHERE id = $1';
    const checkRes = await pool.query(checkQuery, [id]);
    if (checkRes.rows.length === 0) return res.status(404).json({ error: 'Suscriptor no encontrado' });
    
    const sub = checkRes.rows[0];
    const recompensasGanadas = Math.floor((sub.pedidos_lealtad || 0) / 10);
    const recompensasDisponibles = recompensasGanadas - (sub.recompensas_reclamadas || 0);
    
    if (recompensasDisponibles <= 0) {
      return res.status(400).json({ error: 'No hay recompensas disponibles para reclamar.' });
    }
    
    const nuevasReclamadas = (sub.recompensas_reclamadas || 0) + 1;
    
    const updateQuery = 'UPDATE suscriptores SET recompensas_reclamadas = $1 WHERE id = $2 RETURNING *';
    const updated = await pool.query(updateQuery, [nuevasReclamadas, id]);
    
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Error al reclamar recompensa:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/recompensa/canjear — El POS llama esto al escanear el QR "BAMBUREWARD-{id}"
// Válida, consume la recompensa y reinicia el contador automáticamente
app.post('/api/recompensa/canjear', async (req, res) => {
  const { qr } = req.body;

  if (!qr || !qr.startsWith('BAMBUREWARD-')) {
    return res.status(400).json({ error: 'Código QR de recompensa inválido.' });
  }

  // Extraer el ID del suscriptor del QR
  const suscriptorId = qr.replace('BAMBUREWARD-', '').trim();

  try {
    const checkRes = await pool.query('SELECT * FROM suscriptores WHERE id = $1', [suscriptorId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró ningún suscriptor con este código.' });
    }

    const sub = checkRes.rows[0];
    const recompensasGanadas = Math.floor((sub.pedidos_lealtad || 0) / 10);
    const recompensasDisponibles = recompensasGanadas - (sub.recompensas_reclamadas || 0);

    if (recompensasDisponibles <= 0) {
      return res.status(400).json({
        error: `Este cliente aún no tiene recompensas disponibles. Lleva ${sub.pedidos_lealtad % 10}/10 pedidos en su camino actual.`
      });
    }

    // Consumir la recompensa — el camino se reinicia automáticamente por la lógica matemática
    const nuevasReclamadas = (sub.recompensas_reclamadas || 0) + 1;
    const updated = await pool.query(
      'UPDATE suscriptores SET recompensas_reclamadas = $1 WHERE id = $2 RETURNING *',
      [nuevasReclamadas, suscriptorId]
    );

    const subActualizado = updated.rows[0];
    const progresoNuevo = subActualizado.pedidos_lealtad % 10;

    res.json({
      success: true,
      mensaje: `¡Recompensa canjeada exitosamente! El camino de ${sub.nombre} se reinicia en ${progresoNuevo}/10.`,
      suscriptor: {
        id: subActualizado.id,
        nombre: subActualizado.nombre,
        pedidos_lealtad: subActualizado.pedidos_lealtad,
        recompensas_reclamadas: subActualizado.recompensas_reclamadas,
        progreso_actual: progresoNuevo,
        recompensas_disponibles: Math.floor(subActualizado.pedidos_lealtad / 10) - subActualizado.recompensas_reclamadas
      }
    });
  } catch (err) {
    console.error('Error al canjear recompensa:', err);
    res.status(500).json({ error: 'Error interno al procesar el canje.' });
  }
});

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ─── Rutas de Uber Eats (Sandbox) ────────────────────────────────────────────
// Cargadas con try/catch para que si fallan NO afecten el servidor principal
try {
  const { createUberRouter } = await import('./uber.js');
  app.use('/api/uber', createUberRouter(pool));
  console.log('✅ Rutas de Uber Eats registradas en /api/uber');
} catch (err) {
  console.warn('⚠️  Uber Eats routes no pudieron cargarse (el servidor sigue funcionando normal):', err.message);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

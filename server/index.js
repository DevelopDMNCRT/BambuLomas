import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

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
    // 1. Validar Distancia (Radio de 100 metros)
    const distancia = calculateDistance(RESTAURANTE_LAT, RESTAURANTE_LNG, latitud, longitud);
    if (distancia > 100) {
      return res.status(403).json({ 
        error: `Estás fuera del rango permitido. Distancia actual: ${Math.round(distancia)} metros (Máximo 100m).` 
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

    // 3. Registrar Asistencia (el TIMESTAMP lo pone la base de datos)
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
    const { rows } = await pool.query(
      `SELECT id, numero_pedido as "numeroPedido", cliente_nombre as "clienteNombre", 
              cliente_telefono as "clienteTelefono", cliente_email as "clienteEmail", 
              cliente_direccion as "clienteDireccion", cliente_referencias as "clienteReferencias", 
              pago_metodo as "pagoMetodo", tipo_entrega as "tipoEntrega", 
              total, costo_envio as "costoEnvio", estado, productos,
              TO_CHAR(created_at, 'HH24:MI') as "horaCreada",
              created_at as "createdAt"
       FROM ordenes
       WHERE estado IN ('Nuevo', 'En preparación', 'En entrega')
       ORDER BY id ASC`
    );
    
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
    tipoEntrega, total, costoEnvio, productos 
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
         total, costo_envio, estado, productos)
      VALUES 
        (
          '#' || (COALESCE((SELECT max(id) FROM ordenes), 0) + 2500 + 1),
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 'Nuevo', $10
        )
      RETURNING 
        id, numero_pedido as "numeroPedido", cliente_nombre as "clienteNombre", 
        cliente_telefono as "clienteTelefono", cliente_email as "clienteEmail", 
        cliente_direccion as "clienteDireccion", cliente_referencias as "clienteReferencias", 
        pago_metodo as "pagoMetodo", tipo_entrega as "tipoEntrega", 
        total, costo_envio as "costoEnvio", estado, productos, 
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
      JSON.stringify(productos)
    ]);

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

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

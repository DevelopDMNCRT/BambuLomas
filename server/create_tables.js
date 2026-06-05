import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    console.log('📦 Verificando y creando tablas...');

    // ── TABLAS ORIGINALES ──────────────────────────────────────

    await pool.query(`
      CREATE TABLE IF NOT EXISTS compras (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        factura VARCHAR(255) NOT NULL,
        fecha DATE NOT NULL,
        proveedor VARCHAR(255) NOT NULL,
        forma_pago VARCHAR(50) DEFAULT 'EFE',
        total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT now(),
        edited_at TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'compras' verificada.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS compras_detalles (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        compra_id INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
        cantidad NUMERIC(12, 2) NOT NULL,
        medida VARCHAR(50) NOT NULL,
        producto VARCHAR(255) NOT NULL,
        precio_unitario NUMERIC(12, 2) NOT NULL,
        descuento NUMERIC(12, 2) DEFAULT 0.00,
        product_id INTEGER,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log("✅ Tabla 'compras_detalles' verificada.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS recetas (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        clave VARCHAR(50) UNIQUE NOT NULL,
        platillo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT now(),
        edited_at TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'recetas' verificada.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS recetas_detalles (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        receta_id INTEGER NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
        producto VARCHAR(255) NOT NULL,
        cantidad NUMERIC(12, 4) NOT NULL,
        medida VARCHAR(50) NOT NULL,
        costo_unitario NUMERIC(12, 2) NOT NULL,
        product_id INTEGER,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log("✅ Tabla 'recetas_detalles' verificada.");

    // ── TABLAS DE CARTA (PLATILLOS) ────────────────────────────

    await pool.query(`
      CREATE TABLE IF NOT EXISTS platillos (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        categoria VARCHAR(100),
        tipo VARCHAR(50),
        receta_base_id INTEGER REFERENCES recetas(id) ON DELETE SET NULL,
        privado BOOLEAN DEFAULT false,
        precio_base NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        imagen_url TEXT,
        variables JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT now(),
        edited_at TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'platillos' verificada.");

    // ── TABLAS DE PRODUCTO MAESTRO ─────────────────────────────

    // Activar extensión pg_trgm para búsqueda difusa
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    console.log("✅ Extensión 'pg_trgm' activada.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name VARCHAR(255) UNIQUE NOT NULL,
        unit VARCHAR(50) NOT NULL,
        category VARCHAR(100),
        keywords TEXT,
        created_at TIMESTAMP DEFAULT now(),
        edited_at TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'products' (Producto Maestro) verificada.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_aliases (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        supplier_description VARCHAR(500) UNIQUE NOT NULL,
        normalized_description VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log("✅ Tabla 'product_aliases' verificada.");

    // Índice trigram en products.name para búsquedas rápidas
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_products_name_trgm
      ON products USING gin(name gin_trgm_ops);
    `);
    console.log("✅ Índice trigram en 'products.name' verificado.");

    // Índice trigram en products.keywords (columna de palabras clave limpias)
    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS keywords TEXT;
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_products_keywords_trgm
      ON products USING gin(keywords gin_trgm_ops);
    `);
    console.log("✅ Columna e índice trigram en 'products.keywords' verificados.");

    // Índice para búsqueda exacta rápida de alias normalizados
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aliases_normalized
      ON product_aliases(normalized_description);
    `);
    console.log("✅ Índice en 'product_aliases.normalized_description' verificado.");

    // ── TABLA DE ORDENES (KANBAN) ──────────────────────────────
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
        hora_entrega VARCHAR(50),
        notas_pedido TEXT,
        created_at TIMESTAMP DEFAULT now(),
        edited_at TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'ordenes' (Kanban) verificada.");

    // ── COLUMNAS FK (para bases existentes sin ellas) ──────────

    // Agregar product_id a compras_detalles si no existe
    await pool.query(`
      ALTER TABLE compras_detalles
      ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id);
    `);
    console.log("✅ Columna 'product_id' en 'compras_detalles' verificada.");

    // Agregar usuario_cobro a ordenes si no existe
    await pool.query(`
      ALTER TABLE ordenes
      ADD COLUMN IF NOT EXISTS usuario_cobro VARCHAR(100);
    `);
    console.log("✅ Columna 'usuario_cobro' en 'ordenes' verificada.");

    // Agregar hora_entrega y notas_pedido a ordenes si no existen
    await pool.query(`
      ALTER TABLE ordenes
      ADD COLUMN IF NOT EXISTS hora_entrega VARCHAR(50),
      ADD COLUMN IF NOT EXISTS notas_pedido TEXT;
    `);
    console.log("✅ Columnas 'hora_entrega' y 'notas_pedido' en 'ordenes' verificadas.");

    // Agregar product_id a recetas_detalles si no existe
    await pool.query(`
      ALTER TABLE recetas_detalles
      ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id);
    `);
    console.log("✅ Columna 'product_id' en 'recetas_detalles' verificada.");

    console.log('\n🎉 Todas las tablas están listas. El schema está actualizado.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creando tablas:', err);
    process.exit(1);
  }
}

main();

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
    console.log('📦 Migrando base de datos para Variaciones de Recetas...');

    // 1. Crear tabla recetas_variantes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recetas_variantes (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        receta_id INTEGER NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
        nombre VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log("✅ Tabla 'recetas_variantes' creada o ya existe.");

    // 2. Modificar recetas_detalles para agregar variante_id
    await pool.query(`
      ALTER TABLE recetas_detalles
      ADD COLUMN IF NOT EXISTS variante_id INTEGER REFERENCES recetas_variantes(id) ON DELETE CASCADE;
    `);
    console.log("✅ Columna 'variante_id' agregada a 'recetas_detalles'.");

    console.log('🎉 Migración completada exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en migración:', err);
    process.exit(1);
  }
}

main();

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bambu'
});

async function main() {
  try {
    await pool.query(`ALTER TABLE suscriptores ADD COLUMN IF NOT EXISTS pedidos_lealtad INT DEFAULT 0;`);
    await pool.query(`ALTER TABLE suscriptores ADD COLUMN IF NOT EXISTS recompensas_reclamadas INT DEFAULT 0;`);
    console.log("Columns added successfully");
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

main();

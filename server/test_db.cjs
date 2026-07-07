const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  try {
    const { rows } = await pool.query("SELECT * FROM recetas_detalles WHERE receta_id = 8");
    console.log("Ingredientes receta 8:", rows);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    pool.end();
  }
}
run();

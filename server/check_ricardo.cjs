require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://elmer:password@localhost:5432/bambulomas' });

(async () => {
  try {
    const u = await pool.query("SELECT * FROM usuarios WHERE nombre ILIKE '%ricardo%'");
    
    for (let user of u.rows) {
      const asis = await pool.query("SELECT * FROM asistencias WHERE usuario_id = $1", [user.id]);
      const nom = await pool.query("SELECT * FROM nomina WHERE usuario_id = $1", [user.id]);
      console.log('ID:', user.id, 'Nombre:', user.nombre, 'Borrado:', user.deleted_at);
      console.log(' - Asistencias:', asis.rowCount);
      console.log(' - Nómina:', nom.rowCount);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();

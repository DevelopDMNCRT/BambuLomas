import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const { rows } = await pool.query(`
  SELECT 
    p.id, p.name,
    COUNT(DISTINCT cd.id) AS compras_count,
    COUNT(DISTINCT rd.id) AS recetas_count
  FROM products p
  LEFT JOIN compras_detalles cd ON cd.product_id = p.id
  LEFT JOIN recetas_detalles rd ON rd.product_id = p.id
  WHERE p.deleted_at IS NULL
  GROUP BY p.id, p.name
  ORDER BY p.id
`);

console.log('\n=== PRODUCTOS MAESTROS ACTUALES ===\n');
rows.forEach(r => {
  const usado = (parseInt(r.compras_count) > 0 || parseInt(r.recetas_count) > 0);
  const estado = usado ? '✅ EN USO  ' : '❌ SIN USO';
  console.log(`[${r.id}] ${estado} | compras:${r.compras_count} recetas:${r.recetas_count} | ${r.name.trim()}`);
});

const sinUso = rows.filter(r => parseInt(r.compras_count) === 0 && parseInt(r.recetas_count) === 0);
console.log(`\n→ A ELIMINAR: ${sinUso.length} producto(s) sin ningún uso`);
sinUso.forEach(r => console.log(`   - [${r.id}] ${r.name.trim()}`));

process.exit(0);

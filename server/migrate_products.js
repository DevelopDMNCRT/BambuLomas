/**
 * migrate_products.js
 *
 * Script de migración única para inicializar la arquitectura de Producto Maestro.
 * Toma todos los productos distintos de 'compras_detalles' y los convierte en:
 *   1. Productos Maestros (tabla `products`)
 *   2. Alias automáticos (tabla `product_aliases`)
 *   3. Enlaza `compras_detalles.product_id` y `recetas_detalles.product_id`
 *
 * Ejecución: node migrate_products.js
 */

import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s]/g, '')     // Solo letras, números y espacios
    .replace(/\s+/g, ' ')            // Colapsar espacios múltiples
    .trim();
}

async function main() {
  const client = await pool.connect();
  try {
    console.log('🚀 Iniciando migración de Productos Maestros...\n');

    await client.query('BEGIN');

    // 1. Obtener descripciones distintas de compras
    const { rows: rawProducts } = await client.query(`
      SELECT DISTINCT producto, medida
      FROM compras_detalles
      ORDER BY producto ASC
    `);
    console.log(`📋 Encontrados ${rawProducts.length} productos distintos en compras.`);

    let createdProducts = 0;
    let createdAliases = 0;

    for (const row of rawProducts) {
      const { producto, medida } = row;
      const normalized = normalizeText(producto);

      // 2. Insertar en products si no existe (el nombre es clave única)
      const productRes = await client.query(`
        INSERT INTO products (name, unit)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
        RETURNING id
      `, [producto, medida]);

      let productId;
      if (productRes.rows.length > 0) {
        productId = productRes.rows[0].id;
        createdProducts++;
      } else {
        // Ya existía, obtener su id
        const existing = await client.query(
          `SELECT id FROM products WHERE name = $1`,
          [producto]
        );
        productId = existing.rows[0]?.id;
      }

      if (!productId) continue;

      // 3. Insertar alias exacto de la descripción de proveedor
      const aliasRes = await client.query(`
        INSERT INTO product_aliases (product_id, supplier_description, normalized_description)
        VALUES ($1, $2, $3)
        ON CONFLICT (supplier_description) DO NOTHING
        RETURNING id
      `, [productId, producto, normalized]);

      if (aliasRes.rows.length > 0) {
        createdAliases++;
      }

      // 4. Enlazar las filas existentes de compras_detalles
      await client.query(`
        UPDATE compras_detalles
        SET product_id = $1
        WHERE producto = $2 AND product_id IS NULL
      `, [productId, producto]);
    }

    // 5. Enlazar recetas_detalles con sus productos maestros
    const { rowCount: recetasUpdated } = await client.query(`
      UPDATE recetas_detalles rd
      SET product_id = p.id
      FROM products p
      WHERE rd.producto = p.name AND rd.product_id IS NULL
    `);

    await client.query('COMMIT');

    console.log(`\n✅ Migración completada exitosamente:`);
    console.log(`   • Productos Maestros creados:  ${createdProducts}`);
    console.log(`   • Alias creados:               ${createdAliases}`);
    console.log(`   • Ingredientes de recetas enlazados: ${recetasUpdated}`);
    console.log('\n💡 El inventario ahora consolida productos por su ID maestro.');

    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error durante la migración:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

main();

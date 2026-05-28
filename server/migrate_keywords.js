/**
 * migrate_keywords.js
 *
 * Popula la columna `products.keywords` para todos los productos maestros existentes.
 * Las keywords son la forma normalizada y limpia del nombre del producto:
 * sin stopwords, sin preposiciones, con unidades normalizadas, ordenadas alfabéticamente.
 *
 * Ejecución: node migrate_keywords.js
 */

import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ── Mismas constantes que en index.js ─────────────────────────────────────

const STOPWORDS = new Set([
  'con', 'de', 'del', 'al', 'en', 'para', 'por', 'el', 'la', 'los', 'las',
  'un', 'una', 'unos', 'unas', 'y', 'e', 'o', 'u', 'a', 'que', 'se', 'su',
  'sin', 'mas', 'ni',
  'carton', 'envase', 'caja', 'bolsa', 'botella', 'lata', 'tarro', 'frasco',
  'paquete', 'sobre', 'barra', 'rollo', 'saco', 'costal', 'jarra', 'bote',
  'galon', 'cubierta', 'estuche',
  'litro', 'litros', 'kilogramo', 'kilogramos', 'gramo', 'gramos',
  'mililitro', 'mililitros', 'pieza', 'piezas', 'unidad', 'unidades',
]);

const UNIT_MAP = {
  'lt': 'l',  'lts': 'l',  'litro': 'l',  'litros': 'l',
  'kg': 'kg', 'kilo': 'kg', 'kilos': 'kg',
  'kilogramo': 'kg', 'kilogramos': 'kg',
  'gr': 'g',  'grs': 'g',  'gramo': 'g',  'gramos': 'g', 'gram': 'g',
  'ml': 'ml', 'mililitro': 'ml', 'mililitros': 'ml',
  'pza': 'pz', 'pzas': 'pz', 'pieza': 'pz', 'piezas': 'pz',
  'paq': 'pq', 'paquete': 'pq', 'paquetes': 'pq',
  'ud': 'ud', 'unidad': 'ud', 'unidades': 'ud',
};

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stemSpanish(word) {
  if (!word || word.length <= 3) return word;
  if (word.length > 4 && word.endsWith('es')) {
    const beforeEs = word[word.length - 3];
    if ('aeiou'.includes(beforeEs)) return word.slice(0, -1);
    const stem = word.slice(0, -2);
    if (stem.length > 2) return stem;
  }
  if (!word.endsWith('es') && word.endsWith('s') && word.length > 3) {
    const beforeS = word[word.length - 2];
    if ('aeiou'.includes(beforeS)) return word.slice(0, -1);
  }
  return word;
}

function extractKeywords(text) {
  if (!text) return '';
  const normalized = normalizeText(text);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const keywords = new Set();
  for (const token of tokens) {
    const mapped = UNIT_MAP[token] || token;
    const stemmed = stemSpanish(mapped);
    if (!STOPWORDS.has(stemmed) && !STOPWORDS.has(mapped) &&
        (stemmed.length > 1 || stemmed === 'l' || stemmed === 'g')) {
      keywords.add(stemmed);
    }
  }
  return [...keywords].sort().join(' ');
}

// ── Script principal ───────────────────────────────────────────────────────

async function main() {
  const client = await pool.connect();
  try {
    console.log('🔑 Iniciando migración de palabras clave (keywords)...\n');

    const { rows: products } = await client.query(
      `SELECT id, name FROM products WHERE deleted_at IS NULL ORDER BY id ASC`
    );

    console.log(`📋 ${products.length} productos a procesar:\n`);

    let updated = 0;

    for (const product of products) {
      const keywords = extractKeywords(product.name);
      await client.query(
        `UPDATE products SET keywords = $1 WHERE id = $2`,
        [keywords, product.id]
      );
      console.log(`  ✅ [${product.id}] "${product.name}" → "${keywords}"`);
      updated++;
    }

    console.log(`\n🎉 Migración completada: ${updated} productos actualizados con keywords.`);
    console.log('💡 A partir de ahora la búsqueda de similitud será mucho más precisa.');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error durante la migración de keywords:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

main();

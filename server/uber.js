/**
 * uber.js — Integración completa con la API de Uber Eats
 *
 * Funcionalidades:
 *  1. Apertura/cierre automático de la tienda según horario configurable
 *  2. Sincronización de órdenes de Uber → tabla ordenes de la BD
 *  3. Panel de control desde el admin (horario, sync manual, status)
 */

import express from 'express';
import cron from 'node-cron';

// ─── Estado global del scheduler (en memoria) ────────────────────────────────
let scheduleConfig = {
  openTime:  process.env.UBER_OPEN_TIME  || '10:00',
  closeTime: process.env.UBER_CLOSE_TIME || '22:00',
  autoSyncEnabled: true,
};

let openJob  = null;
let closeJob = null;
let syncJob  = null;

let lastSyncResult = { synced: 0, timestamp: null, error: null };

// ─── Helpers de tiempo ───────────────────────────────────────────────────────
function timeToCron(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return `${m} ${h} * * *`;
}

// ─── Fábrica del router (recibe pool de PG) ───────────────────────────────────
export function createUberRouter(pool) {
  const router = express.Router();

  const UBER_CLIENT_ID     = process.env.UBER_CLIENT_ID;
  const UBER_CLIENT_SECRET = process.env.UBER_CLIENT_SECRET;
  const IS_SANDBOX = (process.env.UBER_ENV || 'sandbox') !== 'production';

  const UBER_AUTH_URL = IS_SANDBOX
    ? 'https://sandbox-login.uber.com/oauth/v2/token'
    : 'https://auth.uber.com/oauth/v2/token';
  const UBER_BASE_URL = IS_SANDBOX
    ? 'https://sandbox-api.uber.com/v1/eats'
    : 'https://api.uber.com/v1/eats';

  console.log(`[Uber Eats] Modo: ${IS_SANDBOX ? '🧪 SANDBOX (sin efecto real)' : '⚠️  PRODUCCIÓN'}`);

  // ── Cache del token ──────────────────────────────────────────────────────
  let cachedToken = null;
  let tokenExpiry = null;

  async function getUberToken() {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300_000) {
      return cachedToken;
    }
    const body = new URLSearchParams({
      client_id:     UBER_CLIENT_ID,
      client_secret: UBER_CLIENT_SECRET,
      grant_type:    'client_credentials',
      scope:         'eats.store eats.order',
    });
    const response = await fetch(UBER_AUTH_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Uber Auth Error ${response.status}: ${errorData}`);
    }
    const data = await response.json();
    cachedToken  = data.access_token;
    tokenExpiry  = Date.now() + data.expires_in * 1000;
    console.log(`[Uber Eats] Token obtenido. Expira en: ${Math.round(data.expires_in / 60)} min`);
    return cachedToken;
  }

  // ── Función: toggle de tienda ─────────────────────────────────────────────
  async function toggleStoreAPI(storeId, open) {
    const token = await getUberToken();
    const payload = { status: open ? 'OPEN' : 'CLOSED' };
    const response = await fetch(`${UBER_BASE_URL}/stores/${storeId}/status`, {
      method:  'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(JSON.stringify(data));
    return data;
  }

  // ── Función: obtener todas las tiendas ────────────────────────────────────
  async function getStores() {
    const token = await getUberToken();
    const response = await fetch(`${UBER_BASE_URL}/stores`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { error: text }; }
    if (!response.ok) throw new Error(data.message || data.error || JSON.stringify(data));
    return data.stores || data.data || [];
  }

  // ── Función: sincronizar órdenes Uber → BD ────────────────────────────────
  async function syncOrders() {
    if (!pool) {
      console.warn('[Uber Eats] sync: pool de BD no disponible');
      return { synced: 0, error: 'Pool de BD no inicializado' };
    }
    try {
      const token = await getUberToken();
      const response = await fetch(`${UBER_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { throw new Error(text); }
      if (!response.ok) throw new Error(data.message || data.error || JSON.stringify(data));

      const orders = data.orders || data.data || [];
      let synced = 0;

      for (const order of orders) {
        const numeroPedido = `UE-${order.display_id || order.id}`;

        // Verificar si ya existe
        const exists = await pool.query(
          `SELECT id FROM ordenes WHERE numero_pedido = $1`,
          [numeroPedido]
        );
        if (exists.rows.length > 0) continue;

        // Mapear items del carrito
        const items = order.cart?.items || [];
        const productos = items.map(i => ({
          nombre:   i.title || i.name || 'Sin nombre',
          cantidad: i.quantity || 1,
          precio:   parseFloat(i.price?.unit_price?.amount || 0) / 100,
          notas:    i.special_instructions || '',
        }));

        const total = parseFloat(order.payment?.charges?.total?.amount || 0) / 100;
        const clienteNombre = order.eater?.first_name
          ? `${order.eater.first_name} ${order.eater.last_name || ''}`.trim()
          : 'Cliente Uber Eats';
        const notasPedido = order.special_instructions || '';

        await pool.query(
          `INSERT INTO ordenes
            (numero_pedido, cliente_nombre, cliente_telefono, cliente_email,
             pago_metodo, tipo_entrega, total, costo_envio, estado,
             productos, notas_pedido, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())`,
          [
            numeroPedido,
            clienteNombre,
            order.eater?.phone || '',
            order.eater?.email || '',
            'Uber Eats',
            'uber_eats',
            total,
            0,
            'Nuevo',
            JSON.stringify(productos),
            notasPedido,
          ]
        );
        synced++;
      }

      console.log(`[Uber Eats] Sync: ${synced} orden(es) nueva(s) importada(s) de ${orders.length} totales`);
      lastSyncResult = { synced, total: orders.length, timestamp: new Date().toISOString(), error: null };
      return lastSyncResult;
    } catch (err) {
      console.error('[Uber Eats] Error en sync:', err.message);
      lastSyncResult = { synced: 0, timestamp: new Date().toISOString(), error: err.message };
      return lastSyncResult;
    }
  }

  // ── Función: registrar los cron jobs ──────────────────────────────────────
  function registerScheduleJobs() {
    // Cancelar los jobs anteriores si existen
    if (openJob)  { openJob.stop();  openJob  = null; }
    if (closeJob) { closeJob.stop(); closeJob = null; }

    const openCron  = timeToCron(scheduleConfig.openTime);
    const closeCron = timeToCron(scheduleConfig.closeTime);

    // Job de apertura
    openJob = cron.schedule(openCron, async () => {
      console.log(`[Uber Eats] ⏰ Abriendo tienda automáticamente (${scheduleConfig.openTime})`);
      try {
        const stores = await getStores();
        for (const store of stores) {
          await toggleStoreAPI(store.store_id || store.id, true);
          console.log(`[Uber Eats] ✅ Tienda ${store.store_id || store.id} ABIERTA`);
        }
      } catch (e) {
        console.error('[Uber Eats] Error al abrir tienda automáticamente:', e.message);
      }
    }, { timezone: 'America/Mexico_City' });

    // Job de cierre
    closeJob = cron.schedule(closeCron, async () => {
      console.log(`[Uber Eats] ⏰ Cerrando tienda automáticamente (${scheduleConfig.closeTime})`);
      try {
        const stores = await getStores();
        for (const store of stores) {
          await toggleStoreAPI(store.store_id || store.id, false);
          console.log(`[Uber Eats] ✅ Tienda ${store.store_id || store.id} CERRADA`);
        }
      } catch (e) {
        console.error('[Uber Eats] Error al cerrar tienda automáticamente:', e.message);
      }
    }, { timezone: 'America/Mexico_City' });

    console.log(`[Uber Eats] 📅 Scheduler activo: Apertura ${scheduleConfig.openTime} | Cierre ${scheduleConfig.closeTime}`);
  }

  // ── Sync automático cada 2 minutos ───────────────────────────────────────
  function registerSyncJob() {
    if (syncJob) { syncJob.stop(); syncJob = null; }
    if (!scheduleConfig.autoSyncEnabled) return;
    syncJob = cron.schedule('*/2 * * * *', async () => {
      if (scheduleConfig.autoSyncEnabled) await syncOrders();
    });
    console.log('[Uber Eats] 🔄 Auto-sync de órdenes activo (cada 2 min)');
  }

  // Arrancar los jobs al iniciar
  registerScheduleJobs();
  registerSyncJob();

  // ════════════════════════════════════════════════════════
  //  RUTAS
  // ════════════════════════════════════════════════════════

  // GET /api/uber/status
  router.get('/status', async (req, res) => {
    try {
      if (!UBER_CLIENT_ID || !UBER_CLIENT_SECRET) {
        return res.status(503).json({ ok: false, sandbox: IS_SANDBOX, error: 'Credenciales no configuradas.' });
      }
      const token = await getUberToken();
      res.json({
        ok:           true,
        sandbox:      IS_SANDBOX,
        mode:         IS_SANDBOX ? 'sandbox' : 'production',
        message:      IS_SANDBOX ? 'Conectado. Modo SANDBOX.' : 'Conectado a Uber Eats en PRODUCCIÓN.',
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      });
    } catch (error) {
      console.error('[Uber Eats] Error en /status:', error.message);
      res.status(500).json({ ok: false, sandbox: IS_SANDBOX, error: error.message });
    }
  });

  // GET /api/uber/stores
  router.get('/stores', async (req, res) => {
    try {
      const token = await getUberToken();
      const response = await fetch(`${UBER_BASE_URL}/stores`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { data = { error: text }; }
      if (!response.ok) return res.status(response.status).json({ ok: false, sandbox: IS_SANDBOX, error: data.message || data.error || data });
      res.json({ ok: true, sandbox: IS_SANDBOX, data });
    } catch (error) {
      console.error('[Uber Eats] Error en /stores:', error.message);
      res.status(500).json({ ok: false, sandbox: IS_SANDBOX, error: error.message });
    }
  });

  // GET /api/uber/stores/:storeId/status
  router.get('/stores/:storeId/status', async (req, res) => {
    try {
      const token = await getUberToken();
      const response = await fetch(`${UBER_BASE_URL}/stores/${req.params.storeId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { data = { error: text }; }
      if (!response.ok) return res.status(response.status).json({ ok: false, sandbox: IS_SANDBOX, error: data.message || data.error || data });
      res.json({ ok: true, sandbox: IS_SANDBOX, data });
    } catch (error) {
      res.status(500).json({ ok: false, sandbox: IS_SANDBOX, error: error.message });
    }
  });

  // POST /api/uber/stores/:storeId/toggle
  router.post('/stores/:storeId/toggle', async (req, res) => {
    const WRITE_ENABLED = process.env.UBER_WRITE_ENABLED === 'true';
    if (!WRITE_ENABLED) {
      return res.status(403).json({
        ok:   false,
        error: 'Escritura deshabilitada. Establece UBER_WRITE_ENABLED=true en .env.',
        hint: 'Esta protección existe para no afectar la tienda real accidentalmente.',
      });
    }
    try {
      const { open } = req.body;
      if (open === undefined) return res.status(400).json({ ok: false, error: 'Se requiere "open" (true/false)' });
      const data = await toggleStoreAPI(req.params.storeId, open);
      console.log(`[Uber Eats][${IS_SANDBOX ? 'SANDBOX' : 'PROD'}] Tienda ${req.params.storeId} → ${open ? 'ABIERTA' : 'CERRADA'}`);
      res.json({ ok: true, sandbox: IS_SANDBOX, message: `Tienda ${open ? 'abierta' : 'cerrada'} correctamente.`, data });
    } catch (error) {
      console.error('[Uber Eats] Error en toggle:', error.message);
      res.status(500).json({ ok: false, sandbox: IS_SANDBOX, error: error.message });
    }
  });

  // GET /api/uber/orders
  router.get('/orders', async (req, res) => {
    try {
      const token = await getUberToken();
      const response = await fetch(`${UBER_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { data = { error: text }; }
      if (!response.ok) return res.status(response.status).json({ ok: false, sandbox: IS_SANDBOX, error: data.message || data.error || data });
      res.json({ ok: true, sandbox: IS_SANDBOX, data });
    } catch (error) {
      console.error('[Uber Eats] Error en /orders:', error.message);
      res.status(500).json({ ok: false, sandbox: IS_SANDBOX, error: error.message });
    }
  });

  // ─── POST /api/uber/sync — Sincronización manual ─────────────────────────
  router.post('/sync', async (req, res) => {
    try {
      const result = await syncOrders();
      res.json({ ok: true, sandbox: IS_SANDBOX, ...result });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  });

  // ─── GET /api/uber/sync/status — Último resultado de sync ────────────────
  router.get('/sync/status', (req, res) => {
    res.json({ ok: true, autoSync: scheduleConfig.autoSyncEnabled, lastSync: lastSyncResult });
  });

  // ─── GET /api/uber/schedule — Obtener horario configurado ────────────────
  router.get('/schedule', (req, res) => {
    res.json({
      ok:              true,
      openTime:        scheduleConfig.openTime,
      closeTime:       scheduleConfig.closeTime,
      autoSyncEnabled: scheduleConfig.autoSyncEnabled,
      sandbox:         IS_SANDBOX,
    });
  });

  // ─── POST /api/uber/schedule — Actualizar horario ────────────────────────
  router.post('/schedule', (req, res) => {
    const { openTime, closeTime, autoSyncEnabled } = req.body;

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (openTime && !timeRegex.test(openTime)) {
      return res.status(400).json({ ok: false, error: 'openTime inválido (formato HH:MM)' });
    }
    if (closeTime && !timeRegex.test(closeTime)) {
      return res.status(400).json({ ok: false, error: 'closeTime inválido (formato HH:MM)' });
    }

    if (openTime)  scheduleConfig.openTime  = openTime;
    if (closeTime) scheduleConfig.closeTime = closeTime;
    if (autoSyncEnabled !== undefined) scheduleConfig.autoSyncEnabled = autoSyncEnabled;

    // Re-registrar los jobs con el nuevo horario
    registerScheduleJobs();
    registerSyncJob();

    console.log(`[Uber Eats] Horario actualizado: Apertura ${scheduleConfig.openTime} | Cierre ${scheduleConfig.closeTime} | AutoSync: ${scheduleConfig.autoSyncEnabled}`);

    res.json({
      ok:              true,
      openTime:        scheduleConfig.openTime,
      closeTime:       scheduleConfig.closeTime,
      autoSyncEnabled: scheduleConfig.autoSyncEnabled,
      message:         'Configuración guardada y scheduler actualizado.',
    });
  });

  // ─── POST /api/uber/schedule/open-now — Abrir manualmente ahora ──────────
  router.post('/schedule/open-now', async (req, res) => {
    const WRITE_ENABLED = process.env.UBER_WRITE_ENABLED === 'true';
    if (!WRITE_ENABLED) {
      return res.status(403).json({ ok: false, error: 'Escritura deshabilitada (UBER_WRITE_ENABLED).' });
    }
    try {
      const stores = await getStores();
      for (const store of stores) {
        await toggleStoreAPI(store.store_id || store.id, true);
      }
      res.json({ ok: true, message: `${stores.length} tienda(s) abiertas correctamente.` });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ─── POST /api/uber/schedule/close-now — Cerrar manualmente ahora ────────
  router.post('/schedule/close-now', async (req, res) => {
    const WRITE_ENABLED = process.env.UBER_WRITE_ENABLED === 'true';
    if (!WRITE_ENABLED) {
      return res.status(403).json({ ok: false, error: 'Escritura deshabilitada (UBER_WRITE_ENABLED).' });
    }
    try {
      const stores = await getStores();
      for (const store of stores) {
        await toggleStoreAPI(store.store_id || store.id, false);
      }
      res.json({ ok: true, message: `${stores.length} tienda(s) cerradas correctamente.` });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  return router;
}

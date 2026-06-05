<template>
  <AdminLayout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl mx-auto space-y-6">

      <!-- Banner Sandbox / Producción -->
      <div v-if="isSandbox === false"
        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl px-5 py-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-bold text-blue-700 dark:text-blue-400 text-sm">Modo Solo Lectura — Producción</p>
          <p class="text-blue-600 dark:text-blue-500 text-xs mt-0.5">Estás conectado a la API real de Uber Eats. Las
            acciones de escritura (abrir/cerrar tienda) están bloqueadas para proteger la operación.</p>
        </div>
      </div>
      <div v-else-if="isSandbox === true"
        class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-5 py-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-bold text-amber-700 dark:text-amber-400 text-sm">🧪 Modo Sandbox (Testing)</p>
          <p class="text-amber-600 dark:text-amber-500 text-xs mt-0.5">Estás en un entorno de pruebas. Las acciones
            de abrir y cerrar tienda están habilitadas y no afectarán a la tienda real.</p>
        </div>
      </div>

      <!-- Header + Estado de conexión -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span>🛵</span> Uber Eats
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona tu tienda y pedidos de Uber Eats desde
            aquí.</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all"
          :class="connectionStatus === 'connected'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
            : connectionStatus === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'">
          <span class="relative flex h-2 w-2">
            <span v-if="connectionStatus === 'connected'"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2"
              :class="connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'"></span>
          </span>
          <span>{{ connectionLabel }}</span>
          <button @click="checkConnection" :disabled="checkingConnection"
            class="ml-1 underline text-xs font-normal opacity-70 hover:opacity-100">
            {{ checkingConnection ? 'verificando...' : 'verificar' }}
          </button>
        </div>
      </div>

      <!-- Loading inicial -->
      <div v-if="loadingInitial" class="text-center py-16 text-gray-400">
        <svg class="w-8 h-8 mx-auto animate-spin mb-3 text-gray-300" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="text-sm font-medium">Verificando conexión con Uber Eats...</p>
      </div>

      <template v-else>
        <!-- Error de conexión -->
        <div v-if="connectionStatus === 'error'"
          class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p class="font-bold text-red-600 dark:text-red-400 mb-1">No se pudo conectar con la API de Uber Eats</p>
          <p class="text-sm text-red-500">{{ connectionError }}</p>
          <p class="text-xs text-gray-500 mt-3">Revisa que las credenciales estén correctas en el servidor (.env)</p>
        </div>

        <template v-else>

      <!-- Panel Combinado: Tiendas y Pedidos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Estado de la Tienda -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <h2 class="font-black text-gray-900 dark:text-white text-lg flex items-center gap-2 mb-4">
            <svg class="w-5 h-5 text-[#4F817D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Estado de la Tienda
          </h2>

          <div v-if="loadingStores" class="text-sm text-gray-400 py-4 text-center">Cargando...</div>
          <div v-else-if="stores.length === 0" class="py-4 text-center">
            <p class="font-bold text-gray-600 dark:text-gray-300">No hay tiendas conectadas</p>
            <p class="text-xs text-gray-500 mt-1">Tu cuenta de desarrollador no tiene tiendas activas en este entorno o falta configuración de permisos en tu panel de Uber.</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="store in stores" :key="store.store_id" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div>
                <p class="font-bold text-gray-900 dark:text-white">{{ store.name || store.store_id }}</p>
                <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  :class="store.status === 'OPEN' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'">
                  {{ store.status === 'OPEN' ? 'Abierta' : 'Cerrada' }}
                </span>
              </div>
              <div class="flex gap-2">
                <button @click="toggleStore(store.store_id, true)" :disabled="togglingStore === store.store_id || !isSandbox"
                  class="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold rounded-lg disabled:opacity-50">Abrir</button>
                <button @click="toggleStore(store.store_id, false)" :disabled="togglingStore === store.store_id || !isSandbox"
                  class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg disabled:opacity-50">Cerrar</button>
              </div>
            </div>
          </div>
          <div v-if="toggleFeedback" class="mt-3 text-xs font-bold text-center" :class="toggleFeedback.ok ? 'text-emerald-600' : 'text-red-600'">
            {{ toggleFeedback.message }}
          </div>
        </div>

        <!-- Pedidos Live -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-black text-gray-900 dark:text-white text-lg flex items-center gap-2">
              <svg class="w-5 h-5 text-[#4F817D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Pedidos Live
            </h2>
            <button @click="loadOrders" :disabled="loadingOrders" class="text-xs text-[#4F817D] hover:underline disabled:opacity-50">↻ Refrescar</button>
          </div>
          
          <div v-if="loadingOrders" class="text-sm text-gray-400 py-4 text-center">Cargando...</div>
          <div v-else-if="orders.length === 0" class="flex-1 flex flex-col items-center justify-center py-6 text-center text-gray-400">
            <p class="font-bold text-gray-500">Sin pedidos activos</p>
          </div>
          <div v-else class="space-y-2 overflow-y-auto flex-1 pr-2">
            <div v-for="order in orders" :key="order.id" class="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm">
              <div class="flex justify-between font-bold mb-1">
                <span>#{{ order.display_id || order.id }}</span>
                <span class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-600">{{ order.status }}</span>
              </div>
              <p class="text-gray-500 text-xs truncate">{{ order.cart?.items?.map((i: any) => `${i.quantity}x ${i.title}`).join(', ') || 'Sin detalle' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sincronización y Horario Automático -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Horario Automático -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <h2 class="font-black text-gray-900 dark:text-white text-lg">Horario Automático</h2>
            <span class="text-[10px] px-2 py-0.5 rounded uppercase font-bold" :class="scheduleLoaded ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'">
              {{ scheduleLoaded ? 'Activo' : 'Cargando' }}
            </span>
          </div>
          <p class="text-xs text-gray-500 mb-4">Apertura y cierre automático de la tienda.</p>
          
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Apertura</label>
              <input v-model="scheduleForm.openTime" type="time" class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#4F817D]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Cierre</label>
              <input v-model="scheduleForm.closeTime" type="time" class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#4F817D]" />
            </div>
          </div>
          
          <div class="flex gap-2">
            <button @click="saveSchedule" :disabled="savingSchedule" class="flex-1 px-3 py-2 bg-[#4F817D] hover:bg-[#3d6460] text-white text-xs font-bold rounded-lg transition-colors">Guardar</button>
            <button @click="openNow" :disabled="!isSandbox" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg">Abrir ya</button>
            <button @click="closeNow" :disabled="!isSandbox" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg">Cerrar ya</button>
          </div>
        </div>

        <!-- Sincronización -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <h2 class="font-black text-gray-900 dark:text-white text-lg">Sincronización</h2>
            <label class="flex items-center gap-2 cursor-pointer">
              <span class="text-[10px] font-bold text-gray-500 uppercase">Auto 2m</span>
              <button @click="toggleAutoSync" class="relative w-8 h-4 rounded-full transition-colors" :class="autoSyncEnabled ? 'bg-[#4F817D]' : 'bg-gray-300'">
                <span class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform" :class="autoSyncEnabled ? 'translate-x-4' : 'translate-x-0'"></span>
              </button>
            </label>
          </div>
          <p class="text-xs text-gray-500 mb-4">Importar pedidos de Uber Eats al sistema interno.</p>

          <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-xl mb-4">
            <div>
              <p class="text-2xl font-black text-[#4F817D] leading-none">{{ lastSync.synced ?? '0' }}</p>
              <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Importadas hoy</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ lastSync.timestamp ? new Date(lastSync.timestamp).toLocaleTimeString('es-MX') : '--:--' }}</p>
              <p class="text-[10px] text-gray-500 uppercase font-bold mt-0.5">Última revisión</p>
            </div>
          </div>

          <button @click="syncNow" :disabled="syncing" class="w-full px-4 py-2 bg-[#4F817D] hover:bg-[#3d6460] text-white text-sm font-bold rounded-lg transition-colors">
            {{ syncing ? 'Sincronizando...' : 'Sincronizar Manualmente' }}
          </button>
          
          <div v-if="lastSync.error" class="mt-3 text-[10px] text-center text-red-500 font-bold truncate px-2" :title="lastSync.error">
            Error de conexión con Uber API
          </div>
        </div>

      </div>

        </template>
      </template>

    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ── Conexión ──────────────────────────────────────────────────────────────────
const connectionStatus = ref<'idle' | 'connected' | 'error'>('idle')
const connectionLabel  = ref('Sin verificar')
const connectionError  = ref('')
const checkingConnection = ref(false)
const loadingInitial   = ref(true)
const isSandbox        = ref<boolean | null>(null)

// ── Tiendas ───────────────────────────────────────────────────────────────────
const stores       = ref<any[]>([])
const loadingStores = ref(false)
const storesRawError = ref('')
const togglingStore = ref<string | null>(null)
const toggleFeedback = ref<{ ok: boolean; message: string } | null>(null)

// ── Scheduler / Horario ───────────────────────────────────────────────────────
const scheduleLoaded = ref(false)
const scheduleForm  = ref({ openTime: '10:00', closeTime: '22:00' })
const savingSchedule = ref(false)
const scheduleFeedback = ref<{ ok: boolean; message: string } | null>(null)
const actionBusy    = ref(false)

// ── Sync de órdenes ───────────────────────────────────────────────────────────
const autoSyncEnabled = ref(true)
const syncing        = ref(false)
const lastSync       = ref<{ synced?: number; timestamp?: string; error?: string; total?: number }>({})
const syncFeedback   = ref<{ ok: boolean; message: string } | null>(null)

// ── Órdenes live ─────────────────────────────────────────────────────────────
const orders       = ref<any[]>([])
const loadingOrders = ref(false)

// ── Helpers ───────────────────────────────────────────────────────────────────
function showFeedback(target: any, ok: boolean, message: string, ms = 5000) {
  target.value = { ok, message }
  setTimeout(() => { target.value = null }, ms)
}

// ─────────────────────────────────────────────────────────────────────────────
// MÉTODOS
// ─────────────────────────────────────────────────────────────────────────────

async function checkConnection() {
  checkingConnection.value = true
  connectionStatus.value = 'idle'
  connectionLabel.value = 'Verificando...'
  try {
    const res  = await fetch(`${API}/api/uber/status`)
    const data = await res.json()
    if (data.ok) {
      connectionStatus.value = 'connected'
      isSandbox.value = data.sandbox
      connectionLabel.value = data.sandbox ? '🧪 Sandbox conectado' : '✅ Producción conectada'
    } else {
      connectionStatus.value = 'error'
      connectionLabel.value = 'Error de conexión'
      connectionError.value = data.error || 'Error desconocido'
    }
  } catch (e: any) {
    connectionStatus.value = 'error'
    connectionLabel.value  = 'Sin conexión'
    connectionError.value  = e.message
  } finally {
    checkingConnection.value = false
  }
}

async function loadStores() {
  loadingStores.value = true
  storesRawError.value = ''
  try {
    const res  = await fetch(`${API}/api/uber/stores`)
    const data = await res.json()
    if (data.ok && data.data) {
      stores.value = data.data.stores || data.data.data || []
    } else {
      storesRawError.value = JSON.stringify(data.error || data)
    }
  } catch (e: any) {
    storesRawError.value = e.message
  } finally {
    loadingStores.value = false
  }
}

async function toggleStore(storeId: string, open: boolean) {
  togglingStore.value = storeId
  toggleFeedback.value = null
  try {
    const res  = await fetch(`${API}/api/uber/stores/${storeId}/toggle`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ open }),
    })
    const data = await res.json()
    showFeedback(toggleFeedback, data.ok, data.message || (data.ok ? 'Acción realizada' : data.error))
    if (data.ok) await loadStores()
  } catch (e: any) {
    showFeedback(toggleFeedback, false, e.message)
  } finally {
    togglingStore.value = null
  }
}

async function loadSchedule() {
  try {
    const res  = await fetch(`${API}/api/uber/schedule`)
    const data = await res.json()
    if (data.ok) {
      scheduleForm.value = { openTime: data.openTime, closeTime: data.closeTime }
      autoSyncEnabled.value = data.autoSyncEnabled
      scheduleLoaded.value = true
    }
  } catch (_) { /* silencioso */ }
}

async function saveSchedule() {
  savingSchedule.value = true
  try {
    const res  = await fetch(`${API}/api/uber/schedule`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...scheduleForm.value }),
    })
    const data = await res.json()
    showFeedback(scheduleFeedback, data.ok, data.message || (data.ok ? 'Horario guardado' : data.error))
  } catch (e: any) {
    showFeedback(scheduleFeedback, false, e.message)
  } finally {
    savingSchedule.value = false
  }
}

async function openNow() {
  actionBusy.value = true
  try {
    const res  = await fetch(`${API}/api/uber/schedule/open-now`, { method: 'POST' })
    const data = await res.json()
    showFeedback(scheduleFeedback, data.ok, data.message || data.error)
    if (data.ok) await loadStores()
  } catch (e: any) {
    showFeedback(scheduleFeedback, false, e.message)
  } finally {
    actionBusy.value = false
  }
}

async function closeNow() {
  actionBusy.value = true
  try {
    const res  = await fetch(`${API}/api/uber/schedule/close-now`, { method: 'POST' })
    const data = await res.json()
    showFeedback(scheduleFeedback, data.ok, data.message || data.error)
    if (data.ok) await loadStores()
  } catch (e: any) {
    showFeedback(scheduleFeedback, false, e.message)
  } finally {
    actionBusy.value = false
  }
}

async function syncNow() {
  syncing.value = true
  try {
    const res  = await fetch(`${API}/api/uber/sync`, { method: 'POST' })
    const data = await res.json()
    lastSync.value = data
    const msg = data.ok
      ? `✅ ${data.synced} orden(es) nueva(s) importada(s) de ${data.total ?? '?'} en Uber`
      : `❌ Error: ${data.error}`
    showFeedback(syncFeedback, !!data.ok, msg)
  } catch (e: any) {
    showFeedback(syncFeedback, false, e.message)
  } finally {
    syncing.value = false
  }
}

async function toggleAutoSync() {
  autoSyncEnabled.value = !autoSyncEnabled.value
  try {
    await fetch(`${API}/api/uber/schedule`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ autoSyncEnabled: autoSyncEnabled.value }),
    })
  } catch (_) { /* silencioso */ }
}

async function loadSyncStatus() {
  try {
    const res  = await fetch(`${API}/api/uber/sync/status`)
    const data = await res.json()
    if (data.ok) {
      autoSyncEnabled.value = data.autoSync
      lastSync.value = data.lastSync || {}
    }
  } catch (_) { /* silencioso */ }
}

async function loadOrders() {
  loadingOrders.value = true
  try {
    const res  = await fetch(`${API}/api/uber/orders`)
    const data = await res.json()
    if (data.ok && data.data) {
      orders.value = data.data.orders || data.data.data || []
    }
  } catch (_) { /* silencioso */ } finally {
    loadingOrders.value = false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await checkConnection()
  loadingInitial.value = false
  if (connectionStatus.value === 'connected') {
    await Promise.all([loadStores(), loadSchedule(), loadSyncStatus(), loadOrders()])
  }
})
</script>

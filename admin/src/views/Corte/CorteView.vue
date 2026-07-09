<template>
  <AdminLayout>
    <div class="p-6">
      
      <!-- Top Controls Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        
        <!-- Operativo Select -->
        <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Operativo</label>
          <div class="relative">
            <select v-model="selectedCajero" class="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
              <option value="Todos">Todos</option>
              <option v-for="cajero in cajerosDisponibles" :key="cajero" :value="cajero">{{ cajero }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <p class="text-[11px] text-brand-600 dark:text-brand-400 mt-2 font-medium">Seleccionar Usuario</p>
        </div>

        <!-- Fecha del Reporte -->
        <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Fecha del Reporte</label>
          <flat-pickr
            v-model="selectedDate"
            :config="dateConfig"
            class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            placeholder="DD/MM/YYYY"
          />
        </div>

        <!-- CXC Generados -->
        <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-center">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">CXC Generados</label>
          <p class="text-3xl font-black text-gray-800 dark:text-white">{{ formatCurrency(cxcPendiente) }}</p>
          <p class="text-[11px] text-gray-400 mt-1 font-medium">Créditos otorgados</p>
          <div class="absolute right-4 bottom-4 opacity-5 dark:opacity-10">
            <svg class="w-14 h-14 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
        </div>

        <!-- Cortesías -->
        <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-center">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Cortesías</label>
          <p class="text-3xl font-black text-gray-800 dark:text-white">{{ formatCurrency(cortesiasTotal) }}</p>
          <p class="text-[11px] text-gray-400 mt-1 font-medium">Total en cortesías</p>
          <div class="absolute right-4 bottom-4 opacity-5 dark:opacity-10">
            <svg class="w-14 h-14 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg>
          </div>
        </div>

      </div>

      <!-- Movimientos del Día (Summary Table) -->
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm mb-6 overflow-hidden">
        <div class="p-5 border-b border-gray-50 dark:border-gray-700">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white">Movimientos del Día</h2>
        </div>
        
        <div class="w-full">
          <div class="grid grid-cols-2 px-5 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Concepto</span>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Monto</span>
          </div>
          
          <!-- Rows -->
          <div class="grid grid-cols-2 px-5 py-4 border-b border-gray-50 dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
              <span class="font-semibold text-gray-800 dark:text-gray-200">Efectivo</span>
            </div>
            <span class="font-bold text-gray-800 dark:text-white text-right">{{ formatCurrency(ingresosEfectivo) }}</span>
          </div>

          <div class="grid grid-cols-2 px-5 py-4 border-b border-gray-50 dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              <span class="font-semibold text-gray-800 dark:text-gray-200">Tarjeta</span>
            </div>
            <span class="font-bold text-gray-800 dark:text-white text-right">{{ formatCurrency(ingresosTarjeta) }}</span>
          </div>

          <div class="grid grid-cols-2 px-5 py-4 border-b border-gray-50 dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              <span class="font-semibold text-gray-800 dark:text-gray-200">Transferencia</span>
            </div>
            <span class="font-bold text-gray-800 dark:text-white text-right">{{ formatCurrency(ingresosTransferencia) }}</span>
          </div>

          <div class="grid grid-cols-2 px-5 py-4 border-b border-gray-50 dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> <!-- Didi/Uber placeholder -->
              <span class="font-semibold text-gray-800 dark:text-gray-200">Aplicaciones (Uber Eats / Didi)</span>
            </div>
            <span class="font-bold text-gray-800 dark:text-white text-right">{{ formatCurrency(ingresosApps) }}</span>
          </div>

        </div>
        
        <div class="px-5 py-5 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
          <span class="text-xl font-bold text-gray-800 dark:text-white">Total Venta</span>
          <span class="text-xl font-black text-emerald-600 dark:text-emerald-400">{{ formatCurrency(totalVenta) }}</span>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { useCorte, type CorteMovimiento } from '@/composables/useCorte';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

const { getCorteDelDia } = useCorte();

const getTodayDateString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

// UI State
const selectedDate = ref(getTodayDateString());
const selectedCajero = ref('Todos');
const dateConfig = {
  locale: Spanish,
  dateFormat: 'Y-m-d',
  maxDate: 'today',
  altInput: true,
  altFormat: 'd/m/Y',
};

// Data
const movimientosTotales = ref<CorteMovimiento[]>([]);
const cajerosRegistrados = ref<string[]>([]);
const loading = ref(true);

const loadCorte = async () => {
  if (!selectedDate.value) return;
  loading.value = true;
  try {
    movimientosTotales.value = await getCorteDelDia(selectedDate.value);
    
    const cajerosSet = new Set<string>();
    
    // Fetch all users with role 'operativo' or 'cajero' from backend
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const userRes = await fetch(`${API_URL}/api/usuarios`);
      if (userRes.ok) {
        const users = await userRes.json();
        users.forEach((u: any) => {
          if (u.rol && (u.rol.toLowerCase() === 'operativo' || u.rol.toLowerCase() === 'cajero')) {
            cajerosSet.add(u.nombre || u.usuario);
          }
        });
      }
    } catch(e) {
      console.error('Error fetching users:', e);
    }
    
    cajerosRegistrados.value = Array.from(cajerosSet).sort();
    
    // Si el cajero seleccionado no está (ej. cambio de día), volver a "Todos"
    if (selectedCajero.value !== 'Todos' && !cajerosRegistrados.value.includes(selectedCajero.value)) {
      selectedCajero.value = 'Todos';
    }

  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

watch(selectedDate, loadCorte);
onMounted(loadCorte);

// Computed Filters
const cajerosDisponibles = computed(() => cajerosRegistrados.value);

const movimientosFiltrados = computed(() => {
  if (selectedCajero.value === 'Todos') {
    return movimientosTotales.value;
  }
  return movimientosTotales.value.filter(m => 
    m.usuario === selectedCajero.value || (m.tipo === 'Egreso' && selectedCajero.value === 'Todos')
  );
});

// Calculos de Resumen (basados en los movimientos filtrados)
const ingresosEfectivo = computed(() => {
  return movimientosFiltrados.value
    .filter(m => m.tipo === 'Ingreso' && m.pago_metodo.toLowerCase() === 'efectivo')
    .reduce((sum, m) => sum + m.monto, 0);
});

const ingresosTarjeta = computed(() => {
  return movimientosFiltrados.value
    .filter(m => m.tipo === 'Ingreso' && (m.pago_metodo.toLowerCase() === 'tarjeta' || m.pago_metodo.toLowerCase() === 'tarjeta de crédito' || m.pago_metodo.toLowerCase() === 'tarjeta de débito'))
    .reduce((sum, m) => sum + m.monto, 0);
});

const ingresosTransferencia = computed(() => {
  return movimientosFiltrados.value
    .filter(m => m.tipo === 'Ingreso' && m.pago_metodo.toLowerCase() === 'transferencia')
    .reduce((sum, m) => sum + m.monto, 0);
});

const ingresosApps = computed(() => {
  return movimientosFiltrados.value
    .filter(m => m.tipo === 'Ingreso' && ['uber eats', 'didi', 'rappi', 'aplicación'].includes(m.pago_metodo.toLowerCase()))
    .reduce((sum, m) => sum + m.monto, 0);
});

const cxcPendiente = computed(() => {
  return movimientosFiltrados.value
    .filter(m => m.tipo === 'Ingreso' && m.pago_metodo.toLowerCase() === 'cxc')
    .reduce((sum, m) => sum + m.monto, 0);
});

const cortesiasTotal = computed(() => {
  return movimientosFiltrados.value
    .filter(m => m.tipo === 'Ingreso' && (m.pago_metodo.toLowerCase() === 'cortesía' || m.pago_metodo.toLowerCase() === 'cortesia'))
    .reduce((sum, m) => sum + m.monto, 0);
});

const totalVenta = computed(() => {
  // Total Venta (Suma de Efectivo, Tarjeta, Transf, Apps). No incluye CXC ni Cortesías
  return ingresosEfectivo.value + ingresosTarjeta.value + ingresosTransferencia.value + ingresosApps.value;
});

const egresosEfectivo = computed(() => {
  return movimientosFiltrados.value
    .filter(m => m.tipo === 'Egreso' && (m.pago_metodo.toLowerCase() === 'efectivo' || m.pago_metodo.toLowerCase() === 'efe'))
    .reduce((sum, m) => sum + m.monto, 0);
});

const egresosTotales = computed(() => {
  return movimientosFiltrados.value
    .filter(m => m.tipo === 'Egreso')
    .reduce((sum, m) => sum + m.monto, 0);
});

// Formatters
const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};
</script>

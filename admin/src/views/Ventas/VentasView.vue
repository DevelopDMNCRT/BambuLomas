<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Ventas</h1>
          <p class="text-sm text-gray-500 mt-1 font-medium">
            Total (sin canceladas): <span class="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{{ formatCurrency(totalVentas) }}</span>
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <!-- Flatpickr for Date Range -->
          <div class="relative w-full sm:w-64">
            <flat-pickr
              v-model="dateRange"
              :config="flatPickrConfig"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
              placeholder="Seleccionar Rango de Fechas"
              @on-change="onDateChange"
            />
          </div>
        </div>
      </div>

      <!-- Error Banner -->
      <div v-if="errorMsg" class="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMsg }}
      </div>

      <!-- Chart Section -->
      <div v-if="!loading && ventas.length" class="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        <h3 class="mb-4 text-base font-bold text-gray-800 dark:text-white/90">Tendencia de Ventas</h3>
        <VueApexCharts type="area" height="300" :options="chartOptions" :series="chartSeries" />
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Cargando ventas...</p>
        </div>

        <div v-else-if="!ventas.length" class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-base text-gray-500 dark:text-gray-400 font-medium">No hay ventas en este rango de fechas.</p>
        </div>

        <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th class="px-5 py-4 text-left">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Pedido</p>
                </th>
                <th class="px-5 py-4 text-left">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Cliente</p>
                </th>
                <th class="px-5 py-4 text-left">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Fecha y Hora</p>
                </th>
                <th class="px-5 py-4 text-left">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Método de Pago</p>
                </th>
                <th class="px-5 py-4 text-left">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Estado</p>
                </th>
                <th class="px-5 py-4 text-right">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Total</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="venta in ventas" :key="venta.id" class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td class="px-5 py-4">
                  <span class="inline-flex font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2.5 py-0.5 rounded-md text-sm">
                    {{ venta.numeroPedido }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-800 font-semibold text-sm dark:text-white/90">{{ venta.clienteNombre }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 font-medium text-sm dark:text-gray-400">{{ venta.fechaHora }}</p>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium text-sm">
                    <svg v-if="venta.pagoMetodo.toLowerCase() === 'efectivo'" class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <svg v-else-if="venta.pagoMetodo.toLowerCase() === 'tarjeta' || venta.pagoMetodo.toLowerCase() === 'terminal'" class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.625-12h17.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 0 1-1.125-1.125V4.875c0-.621.504-1.125 1.125-1.125Z" /></svg>
                    <svg v-else class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                    <span>{{ venta.pagoMetodo }}</span>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span 
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm"
                    :class="{
                      'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50': venta.estado === 'Completada',
                      'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800/50': venta.estado === 'Cancelada',
                      'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50': venta.estado !== 'Completada' && venta.estado !== 'Cancelada'
                    }"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="{
                      'bg-emerald-500': venta.estado === 'Completada',
                      'bg-red-500': venta.estado === 'Cancelada',
                      'bg-amber-500': venta.estado !== 'Completada' && venta.estado !== 'Cancelada'
                    }"></span>
                    {{ venta.estado }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <p class="text-gray-900 font-black text-sm dark:text-white">{{ formatCurrency(venta.total) }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { useVentas, type Venta } from '@/composables/useVentas';
import VueApexCharts from 'vue3-apexcharts';

import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

const { getVentas } = useVentas();

const ventas = ref<Venta[]>([]);
const loading = ref(true);
const errorMsg = ref('');

// Date Range config
const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
const dateRange = ref(todayStr); 

const flatPickrConfig = ref({
  mode: 'range' as const,
  dateFormat: 'Y-m-d',
  maxDate: 'today',
  showMonths: window.innerWidth > 768 ? 2 : 1, // Show 2 months on larger screens
  locale: Spanish,
});

const totalVentas = computed(() => {
  return ventas.value.reduce((acc, curr) => {
    if (curr.estado === 'Cancelada') return acc;
    return acc + curr.total;
  }, 0);
});

const loadVentas = async (overrideDateStr?: string) => {
  loading.value = true;
  errorMsg.value = '';
  
  const currentRange = overrideDateStr || dateRange.value;
  let startDate = '';
  let endDate = '';
  
  if (currentRange) {
    if (currentRange.includes(' a ')) {
      const parts = currentRange.split(' a ');
      startDate = parts[0];
      endDate = parts[1];
    } else if (currentRange.includes(' to ')) {
      const parts = currentRange.split(' to ');
      startDate = parts[0];
      endDate = parts[1];
    } else {
      startDate = currentRange;
      endDate = currentRange;
    }
  }

  try {
    ventas.value = await getVentas(startDate, endDate);
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al obtener las ventas';
  } finally {
    loading.value = false;
  }
};

const onDateChange = (selectedDates: Date[], dateStr: string) => {
  if (selectedDates.length === 2) {
    // A complete range is selected
    loadVentas(dateStr);
  } else if (selectedDates.length === 1 && !dateStr.includes(' to ') && !dateStr.includes(' a ')) {
    // Only one specific day is selected
    loadVentas(dateStr);
  }
};

onMounted(() => {
  loadVentas();
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

const chartOptions = computed(() => {
  return {
    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      background: 'transparent',
    },
    colors: ['#10B981'], // Emerald 500
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    grid: {
      borderColor: 'rgba(156, 163, 175, 0.1)',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    theme: {
      mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM \'yy',
          day: 'dd MMM',
          hour: 'HH:mm'
        },
        style: { colors: '#9CA3AF' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => formatCurrency(value),
        style: { colors: '#9CA3AF' }
      }
    },
    tooltip: {
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      x: { format: 'dd MMM yyyy HH:mm' },
      y: { formatter: (value: number) => formatCurrency(value) }
    }
  }
});

const chartSeries = computed(() => {
  const currentRange = dateRange.value || '';
  const isSingleDay = !currentRange.includes(' a ') && !currentRange.includes(' to ');
  
  const grouped = new Map<number, number>();
  
  ventas.value.forEach(v => {
    if (v.estado === 'Cancelada') return;
    
    // We use the `createdAt` from database which is in ISO string format ideally, 
    // or just construct a valid Date object.
    const d = new Date(v.createdAt);
    if (isNaN(d.getTime())) return;

    let keyTime = 0;
    
    if (isSingleDay) {
      // Group by hour
      d.setMinutes(0, 0, 0);
      keyTime = d.getTime();
    } else {
      // Group by day
      d.setHours(0, 0, 0, 0);
      keyTime = d.getTime();
    }
    
    grouped.set(keyTime, (grouped.get(keyTime) || 0) + v.total);
  });
  
  const sortedData = Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([time, total]) => [time, total]);
    
  return [{
    name: 'Ventas',
    data: sortedData
  }];
});
</script>

<style scoped>
/* Customize Flatpickr to match Tailwind styles if needed */
.flatpickr-calendar {
  font-family: inherit;
}
</style>

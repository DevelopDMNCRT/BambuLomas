<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Cuentas por Cobrar</h1>
          <p class="text-sm text-gray-500 mt-1 font-medium">
            Total pendiente: <span class="text-error-600 dark:text-error-400 font-bold text-lg">{{ formatCurrency(totalGlobalDeuda) }}</span>
          </p>
        </div>
      </div>

      <!-- Error Banner -->
      <div v-if="errorMsg" class="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMsg }}
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Cargando cuentas...</p>
        </div>

        <div v-else-if="!cxcClients.length" class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-base text-gray-500 dark:text-gray-400 font-medium">No hay cuentas por cobrar en este momento.</p>
        </div>

        <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th class="px-5 py-4 text-left">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Nombre</p>
                </th>
                <th class="px-5 py-4 text-left">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Órdenes</p>
                </th>
                <th class="px-5 py-4 text-left">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Fecha (Última)</p>
                </th>
                <th class="px-5 py-4 text-left">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Total</p>
                </th>
                <th class="px-5 py-4 text-right">
                  <p class="font-bold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Acciones</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="client in cxcClients" :key="client.nombre" class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td class="px-5 py-4">
                  <p class="text-gray-800 font-bold text-sm dark:text-white/90">{{ client.nombre }}</p>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2.5 py-0.5 rounded-md text-sm">
                    {{ client.ordenesCount }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 font-medium text-sm dark:text-gray-400">{{ formatDate(client.ultimaFecha) }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-error-600 font-black text-sm dark:text-error-400">{{ formatCurrency(client.totalDeuda) }}</p>
                </td>
                <td class="px-5 py-4 text-right flex items-center justify-end gap-2">
                  <button @click="verDetalles(client.nombre)" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors">Ver</button>
                  <button @click="irAPagar(client.nombre)" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-sm">Pagar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Detalle -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm custom-modal-backdrop" @click="closeModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in">
          
          <!-- Header -->
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
            <div>
              <h3 class="text-lg font-bold text-gray-800 dark:text-white">Detalles de la deuda</h3>
              <p class="text-sm text-brand-600 font-semibold">{{ selectedClient }}</p>
            </div>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <div v-if="loadingDetails" class="flex flex-col items-center justify-center py-12">
              <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            </div>
            <div v-else-if="!details.length" class="text-center text-gray-500 py-6">
              No se encontraron detalles.
            </div>
            <div v-else class="space-y-4">
              <div v-for="orden in details" :key="orden.id" class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div class="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-brand-600 dark:text-brand-400">#{{ orden.numeroPedido }}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ orden.fechaHora }}</span>
                  </div>
                  <span class="font-black text-gray-800 dark:text-white">{{ formatCurrency(orden.total) }}</span>
                </div>
                <div class="p-4 bg-white dark:bg-gray-900">
                  <ul class="space-y-2">
                    <li v-for="(prod, i) in orden.productos" :key="i" class="flex justify-between items-start text-sm">
                      <div class="flex items-start gap-2">
                        <span class="font-semibold text-gray-700 dark:text-gray-300">{{ prod.cantidad }}x</span>
                        <div>
                          <p class="font-medium text-gray-800 dark:text-gray-200">{{ prod.producto || prod.nombre }}</p>
                          <p v-if="prod.extrasStr" class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{{ prod.extrasStr }}</p>
                          <div v-if="prod.variablesSeleccionadas && prod.variablesSeleccionadas.length" class="flex flex-wrap gap-1 mt-1">
                            <span v-for="(vs, vidx) in prod.variablesSeleccionadas" :key="vidx" class="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">
                              {{ vs.opcion }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end">
            <button @click="irAPagar(selectedClient)" class="px-6 py-2.5 rounded-xl font-bold bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-md active:scale-95">
              Ir al POS a Pagar
            </button>
          </div>

        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { useCxc, type CxcClient, type CxcOrderDetail } from '@/composables/useCxc';

const router = useRouter();
const { getCxcClients, getCxcClientDetails } = useCxc();

const cxcClients = ref<CxcClient[]>([]);
const loading = ref(true);
const errorMsg = ref('');

// Modal state
const showModal = ref(false);
const selectedClient = ref('');
const loadingDetails = ref(false);
const details = ref<CxcOrderDetail[]>([]);

const totalGlobalDeuda = computed(() => {
  return cxcClients.value.reduce((sum, client) => sum + client.totalDeuda, 0);
});

const loadClients = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    cxcClients.value = await getCxcClients();
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al cargar CXC';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadClients();
});

const verDetalles = async (cliente: string) => {
  selectedClient.value = cliente;
  showModal.value = true;
  loadingDetails.value = true;
  details.value = [];
  try {
    details.value = await getCxcClientDetails(cliente);
  } catch (err) {
    console.error(err);
  } finally {
    loadingDetails.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedClient.value = '';
  details.value = [];
};

const irAPagar = (cliente: string) => {
  router.push({ path: '/pos', query: { cxc: cliente } });
};

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};
</script>

<style scoped>
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.94) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
.animate-modal-in {
  animation: modal-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  will-change: transform, opacity;
}
.custom-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  will-change: opacity;
}
</style>

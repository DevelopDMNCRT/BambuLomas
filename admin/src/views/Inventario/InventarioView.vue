<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Inventario</h1>
        </div>
        <div>
          <Button size="sm" :startIcon="PrinterIcon" @click="imprimirInventario">Imprimir</Button>
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
          <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Cargando inventario...</p>
        </div>

        <div v-else-if="!inventario.length" class="flex flex-col items-center justify-center py-12">
          <p class="text-sm text-gray-500 dark:text-gray-400">No hay productos registrados en el inventario.</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Registra compras de productos para verlos aquí.</p>
        </div>

        <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">ID</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Stock</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Última Compra</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Mínimos</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Costo Real</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(item, index) in inventario" :key="index" class="border-t border-gray-100 dark:border-gray-800">
                <td class="px-5 py-4">
                  <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ item.id }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ item.nombre }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-800 font-medium text-theme-sm dark:text-white/90">{{ item.stock }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ item.ultimaCompra }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ item.minimos }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ formatCurrency(item.costoReal) }}</p>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="goToHistory(item)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver Historial">
                      <HistoryIcon class="w-5 h-5" />
                    </button>
                  </div>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import { PrinterIcon, HistoryIcon } from '@/icons';
import { useInventario, type InventarioItem } from '@/composables/useInventario';

const router = useRouter();
const { getInventario } = useInventario();

const inventario = ref<InventarioItem[]>([]);
const loading = ref(true);
const errorMsg = ref('');

const loadInventario = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    inventario.value = await getInventario();
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al obtener el inventario';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadInventario();
});

const goToHistory = (item: InventarioItem) => {
  router.push({ path: '/inventario/historial', query: { id: item.id, nombre: item.nombre } });
};

const imprimirInventario = () => {
  window.print();
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};
</script>

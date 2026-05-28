<template>
  <AdminLayout>
    <div class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Historial de Compras: {{ productName }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">ID: {{ productId }}</p>
        </div>
        <Button variant="outline" @click="goBack">Volver</Button>
      </div>

      <!-- Error Banner -->
      <div v-if="errorMsg" class="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMsg }}
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Cargando historial...</p>
        </div>

        <div v-else-if="!historialCompras.length" class="flex flex-col items-center justify-center py-12">
          <p class="text-sm text-gray-500 dark:text-gray-400">No hay compras registradas para este producto.</p>
        </div>

        <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Fecha</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Costo</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Proveedor</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Factura</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(historial, index) in historialCompras" :key="index" class="border-t border-gray-100 dark:border-gray-800">
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ historial.fecha }}</p>
                </td>
                <td class="px-5 py-4">
                  <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ formatCurrency(historial.costo) }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ historial.proveedor }}</p>
                </td>
                <td class="px-5 py-4">
                  <button
                    @click="goToCompra(historial.factura)"
                    class="font-medium text-brand-500 hover:text-brand-600 underline underline-offset-2 transition-colors text-theme-sm dark:text-brand-400 dark:hover:text-brand-300"
                    :title="`Ver factura ${historial.factura}`"
                  >
                    {{ historial.factura }}
                  </button>
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
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import { useInventario, type HistorialCompraItem } from '@/composables/useInventario';

const route = useRoute();
const router = useRouter();
const { getHistorial } = useInventario();

const productId = ref(route.query.id as string || 'INV0000000');
const productName = ref(route.query.nombre as string || 'Producto Desconocido');

const historialCompras = ref<HistorialCompraItem[]>([]);
const loading = ref(true);
const errorMsg = ref('');

const loadHistorial = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    historialCompras.value = await getHistorial(productName.value);
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al obtener el historial de compras';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadHistorial();
});

const goToCompra = (factura: string) => {
  router.push({ path: '/compras/form', query: { mode: 'view', factura } });
};

const goBack = () => {
  router.push('/inventario');
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};
</script>

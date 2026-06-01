<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Compras</h1>
        </div>
        <div class="flex items-center gap-3">
          <Button size="sm" :startIcon="UploadIcon" @click="isXMLModalOpen = true">XML</Button>
          <Button size="sm" :startIcon="PlusIcon" @click="goToForm('add')">Agregar nueva</Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        <svg class="animate-spin w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Cargando compras...
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 mb-6">
        {{ error }}
      </div>

      <!-- Table -->
      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Factura</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Fecha</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Proveedor</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Total</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="!compras.length">
                <td colspan="5" class="px-5 py-10 text-center text-gray-400 dark:text-gray-500">
                  No hay compras registradas.
                </td>
              </tr>
              <tr v-for="compra in compras" :key="compra.id" class="border-t border-gray-100 dark:border-gray-800">
                <td class="px-5 py-4">
                  <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ compra.factura }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ compra.fecha }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ compra.proveedor }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-800 font-semibold text-theme-sm dark:text-white/90">{{ formatCurrency(compra.total) }}</p>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="goToForm('view', compra)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver">
                      <EyeIcon class="w-5 h-5" />
                    </button>
                    <button @click="goToForm('edit', compra)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Editar">
                      <PencilIcon class="w-5 h-5" />
                    </button>
                    <button @click="confirmDeleteAction(compra.id)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar">
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ConfirmDeleteModal 
      v-if="isDeleteModalOpen" 
      @cancel="isDeleteModalOpen = false" 
      @confirm="executeDelete" 
    />

    <ImportXMLModal 
      v-if="isXMLModalOpen" 
      @cancel="isXMLModalOpen = false" 
      @imported="handleXMLImported" 
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal.vue';
import ImportXMLModal from './ImportXMLModal.vue';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, UploadIcon } from '@/icons';
import { useCompras, type Compra } from '@/composables/useCompras';

const router = useRouter();
const { getAll, remove } = useCompras();

const compras = ref<Compra[]>([]);
const loading = ref(true);
const error = ref('');

const isXMLModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const itemToDelete = ref<number | null>(null);

const handleXMLImported = () => {
  isXMLModalOpen.value = false;
  fetchCompras();
};

const fetchCompras = async () => {
  loading.value = true;
  error.value = '';
  try {
    compras.value = await getAll();
  } catch (e: any) {
    error.value = e.message || 'Error al obtener compras';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCompras);

const goToForm = (mode: string, compra: Compra | null = null) => {
  const query: any = { mode };
  if (compra) {
    query.id = compra.id;
    query.factura = compra.factura;
    query.fecha = compra.fecha;
    query.proveedor = compra.proveedor;
    query.formaPago = compra.formaPago || 'EFE';
    query.total = compra.total;
  }
  router.push({ path: '/compras/form', query });
};

const confirmDeleteAction = (id: number) => {
  itemToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const executeDelete = async () => {
  if (itemToDelete.value !== null) {
    try {
      await remove(itemToDelete.value);
      compras.value = compras.value.filter(c => c.id !== itemToDelete.value);
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar la compra';
    } finally {
      itemToDelete.value = null;
    }
  }
  isDeleteModalOpen.value = false;
};

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(num || 0);
};
</script>

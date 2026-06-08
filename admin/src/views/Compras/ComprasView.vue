<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Compras</h1>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <!-- Search -->
          <div class="relative w-full sm:w-64">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar factura..." 
              class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Date Mode Toggle & Picker -->
          <div class="bg-slate-100 dark:bg-gray-800 p-1 rounded-xl inline-flex items-center">
            <button 
              @click="filterMode = 'hoy'" 
              :class="filterMode === 'hoy' ? 'bg-white dark:bg-gray-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'"
              class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 select-none"
            >
              Hoy
            </button>
            <button 
              @click="filterMode = 'todos'" 
              :class="filterMode === 'todos' ? 'bg-white dark:bg-gray-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'"
              class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 select-none"
            >
              Sin Desglose
            </button>
            <button 
              @click="filterMode = 'dia'" 
              :class="filterMode === 'dia' ? 'bg-white dark:bg-gray-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'"
              class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 select-none"
            >
              Día
            </button>
          </div>

          <div class="relative w-36" :class="{'opacity-50 pointer-events-none': filterMode !== 'dia'}">
            <flat-pickr
              v-model="filterDate"
              :config="flatPickrConfig"
              class="w-full px-4 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white cursor-pointer text-center shadow-sm"
              placeholder="Seleccionar"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <Button size="sm" :startIcon="UploadIcon" @click="isXMLModalOpen = true">XML</Button>
            <Button size="sm" :startIcon="PlusIcon" @click="goToForm('add')">Agregar nueva</Button>
          </div>
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
                <th class="px-5 py-3 text-left cursor-pointer group" @click="toggleSortProvider">
                  <div class="flex items-center gap-1">
                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Proveedor</p>
                    <div class="flex flex-col">
                      <svg class="w-3 h-3 -mb-1" :class="sortProvider === 'asc' ? 'text-brand-500' : 'text-gray-300 dark:text-gray-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7" /></svg>
                      <svg class="w-3 h-3" :class="sortProvider === 'desc' ? 'text-brand-500' : 'text-gray-300 dark:text-gray-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
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
              <tr v-if="!filteredCompras.length">
                <td colspan="5" class="px-5 py-10 text-center text-gray-400 dark:text-gray-500">
                  No hay compras que coincidan con la búsqueda.
                </td>
              </tr>
              <tr v-for="compra in filteredCompras" :key="compra.id" class="border-t border-gray-100 dark:border-gray-800">
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal.vue';
import ImportXMLModal from './ImportXMLModal.vue';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, UploadIcon } from '@/icons';
import { useCompras, type Compra } from '@/composables/useCompras';

import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

const router = useRouter();
const { getAll, remove } = useCompras();

const compras = ref<Compra[]>([]);
const loading = ref(true);
const error = ref('');

const searchQuery = ref('');

const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
const filterDate = ref(todayStr);
const filterMode = ref<'hoy' | 'todos' | 'dia'>('hoy');
const sortProvider = ref<'none' | 'asc' | 'desc'>('none');

watch(filterDate, (newVal, oldVal) => {
  if (newVal !== oldVal && filterMode.value !== 'dia') {
    filterMode.value = 'dia';
  }
});

const toggleSortProvider = () => {
  if (sortProvider.value === 'none') sortProvider.value = 'asc';
  else if (sortProvider.value === 'asc') sortProvider.value = 'desc';
  else sortProvider.value = 'none';
};

const flatPickrConfig = ref({
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'd/m/Y',
  locale: Spanish,
});

const filteredCompras = computed(() => {
  let result = compras.value.filter(c => {
    // Filter by invoice number
    const matchesSearch = !searchQuery.value || 
      (c.factura && c.factura.toLowerCase().includes(searchQuery.value.toLowerCase()));
      
    // Filter by date
    let matchesDate = true;
    if (filterMode.value === 'hoy') {
      matchesDate = c.fecha === todayStr;
    } else if (filterMode.value === 'dia') {
      matchesDate = !filterDate.value || c.fecha === filterDate.value;
    } else if (filterMode.value === 'todos') {
      matchesDate = true;
    }

    return matchesSearch && matchesDate;
  });

  if (sortProvider.value !== 'none') {
    result = result.sort((a, b) => {
      const pa = a.proveedor?.toLowerCase() || '';
      const pb = b.proveedor?.toLowerCase() || '';
      if (sortProvider.value === 'asc') {
        return pa.localeCompare(pb);
      } else {
        return pb.localeCompare(pa);
      }
    });
  }

  return result;
});

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

<style scoped>
.flatpickr-calendar {
  font-family: inherit;
}
</style>

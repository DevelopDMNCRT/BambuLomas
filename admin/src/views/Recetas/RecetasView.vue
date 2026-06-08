<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Recetas</h1>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <!-- Buscador rápido -->
          <div class="relative w-full sm:w-64">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </span>
            <input
              v-model="search"
              type="text"
              placeholder="Buscar receta..."
              class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white"
            />
          </div>
          <span class="text-sm text-gray-400 dark:text-gray-500 mr-2">{{ filteredRecetas.length }} resultado(s)</span>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <Button size="sm" :startIcon="PlusIcon" @click="goToForm('add')">Agregar receta</Button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Clave</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Platillo</p>
                </th>

                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Ingredientes</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Costo estimado</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-if="filteredRecetas.length === 0"
                class="border-t border-gray-100 dark:border-gray-800"
              >
                <td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                  No se encontraron recetas.
                </td>
              </tr>
              <tr
                v-for="(receta, index) in filteredRecetas"
                :key="receta.clave"
                class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td class="px-5 py-4">
                  <span class="block font-mono font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ receta.clave }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ receta.platillo }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{{ receta.descripcion }}</p>
                </td>

                <td class="px-5 py-4">
                  <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                    {{ receta.ingredientes.length }} ingrediente(s)
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {{ formatCurrency(costoTotal(receta.ingredientes)) }}
                  </p>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="goToForm('view', receta)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver">
                      <EyeIcon class="w-5 h-5" />
                    </button>
                    <button @click="goToForm('edit', receta)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Editar">
                      <PencilIcon class="w-5 h-5" />
                    </button>
                    <button @click="confirmDeleteAction(receta)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar">
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
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal.vue';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@/icons';

const router = useRouter();
const search = ref('');
const isDeleteModalOpen = ref(false);
const itemToDelete = ref<any | null>(null);
const recetas = ref<any[]>([]);
const loading = ref(false);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ---- Cargar datos ----
const fetchRecetas = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${API_URL}/api/recetas`);
    if (res.ok) {
      recetas.value = await res.json();
    }
  } catch (err) {
    console.error('Error al cargar recetas:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRecetas);

// ---- Navegación ----
const goToForm = (mode: string, receta: any = null) => {
  const query: any = { mode };
  if (receta) {
    query.id = receta.id;
  }
  router.push({ path: '/recetas/form', query });
};

// ---- Delete ----
const confirmDeleteAction = (receta: any) => {
  itemToDelete.value = receta;
  isDeleteModalOpen.value = true;
};

const executeDelete = async () => {
  if (itemToDelete.value) {
    try {
      const res = await fetch(`${API_URL}/api/recetas/${itemToDelete.value.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchRecetas();
      }
    } catch (err) {
      console.error('Error al eliminar receta:', err);
    }
    itemToDelete.value = null;
  }
  isDeleteModalOpen.value = false;
};

// ---- Helpers ----
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

const costoTotal = (ingredientes: any[]) =>
  ingredientes.reduce((acc, ing) => acc + ing.cantidad * ing.costoUnitario, 0);

const filteredRecetas = computed(() =>
  recetas.value.filter(r =>
    r.platillo.toLowerCase().includes(search.value.toLowerCase()) ||
    r.clave.toLowerCase().includes(search.value.toLowerCase())
  )
);
</script>

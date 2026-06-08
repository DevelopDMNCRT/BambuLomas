<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Carta / Menú
          </h1>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <!-- Search -->
          <div class="relative w-full sm:w-64">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar platillo o categoría..." 
              class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <Button @click="router.push('/carta/form')">Agregar Platillo</Button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPlatillos.length === 0" class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        <div class="py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay platillos registrados</h3>
          <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Comienza agregando el primer platillo a tu carta.</p>
          <Button @click="router.push('/carta/form')">Agregar Platillo</Button>
        </div>
      </div>

      <!-- Table de Platillos -->
      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Platillo</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Categoría</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Precio Base</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Público</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr 
                v-for="platillo in filteredPlatillos" 
                :key="platillo.id" 
                class="border-t border-gray-100 dark:border-gray-800 transition-all duration-200"
                :class="{ 'opacity-50 grayscale bg-gray-50/30 dark:bg-gray-800/10': platillo.privado }"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-4">
                    <div class="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <img v-if="platillo.imagenUrl" :src="platillo.imagenUrl" alt="" class="h-full w-full object-cover" />
                      <svg v-else class="h-full w-full p-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ platillo.nombre }}</span>
                      <p class="text-gray-500 text-xs mt-0.5 line-clamp-1 max-w-[200px]">{{ platillo.descripcion || 'Sin descripción' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ platillo.categoria }}
                  </span>
                  <p class="text-gray-500 text-xs mt-0.5">{{ platillo.tipo }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-800 font-semibold text-theme-sm dark:text-white/90">{{ formatCurrency(platillo.precioBase) }}</p>
                </td>
                <td class="px-5 py-4 text-center">
                  <button
                    @click="togglePrivado(platillo)"
                    :class="!platillo.privado ? 'bg-success-500' : 'bg-gray-200 dark:bg-gray-700'"
                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                    title="Ocultar/Mostrar en menú"
                  >
                    <span
                      :class="!platillo.privado ? 'translate-x-4' : 'translate-x-1'"
                      class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                    />
                  </button>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="verDetalles(platillo)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver detalles">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button @click="router.push(`/carta/form?mode=edit&id=${platillo.id}`)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Editar">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button @click="eliminarPlatillo(platillo.id)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const platillos = ref<any[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');

const filteredPlatillos = computed(() => {
  if (!searchQuery.value) return platillos.value;
  const q = searchQuery.value.toLowerCase();
  return platillos.value.filter(p => 
    p.nombre.toLowerCase().includes(q) || 
    p.categoria.toLowerCase().includes(q)
  );
});

const fetchPlatillos = async () => {
  try {
    const res = await fetch(`${API_URL}/api/platillos`);
    if (res.ok) {
      const data = await res.json();
      platillos.value = data.map((p: any) => ({
        ...p,
        precioBase: parseFloat(p.precioBase)
      }));
    }
  } catch (error) {
    console.error('Error al cargar platillos:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
};

const togglePrivado = async (platillo: any) => {
  const newEstado = !platillo.privado;
  try {
    const res = await fetch(`${API_URL}/api/platillos/${platillo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ privado: newEstado })
    });
    if (res.ok) {
      platillo.privado = newEstado;
    } else {
      alert('Error al cambiar el estado del platillo');
    }
  } catch (error) {
    console.error(error);
  }
};

const eliminarPlatillo = async (id: number) => {
  if (!confirm('¿Estás seguro de eliminar este platillo de la carta?')) return;
  try {
    const res = await fetch(`${API_URL}/api/platillos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      platillos.value = platillos.value.filter(p => p.id !== id);
    } else {
      alert('Error al eliminar platillo');
    }
  } catch (error) {
    console.error(error);
  }
};

const verDetalles = (platillo: any) => {
  router.push(`/carta/form?mode=view&id=${platillo.id}`);
};

onMounted(() => {
  fetchPlatillos();
});
</script>

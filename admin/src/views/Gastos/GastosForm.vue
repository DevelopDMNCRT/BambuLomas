<template>
  <AdminLayout>
    <div class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">
            {{ isViewMode ? 'Ver Gasto' : (isEditMode ? 'Editar Gasto' : 'Agregar Gasto') }}
          </h1>
        </div>
        <Button variant="outline" @click="goBack">Volver</Button>
      </div>

      <!-- Error banner -->
      <div v-if="apiError" class="mb-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">
        {{ apiError }}
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500 bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-gray-900 shadow-theme-sm mb-6">
        <svg class="animate-spin w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Cargando detalles del gasto...
      </div>

      <div v-else class="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div class="md:col-span-3">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Folio</label>
            <input type="text" v-model="formData.folio" disabled class="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/70" />
            <p v-if="!isEditMode && !isViewMode" class="mt-1 text-xs text-gray-400">Autogenerado (Ej. GST1705001)</p>
          </div>
          
          <div class="md:col-span-3">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Fecha</label>
            <input type="date" v-model="formData.fecha" :disabled="isViewMode" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed" />
          </div>

          <div class="md:col-span-6">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">A nombre de</label>
            <input type="text" v-model="formData.aNombreDe" :disabled="isViewMode" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed" />
          </div>

          <div class="md:col-span-3">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Forma de Pago</label>
            <select v-model="formData.formaPago" :disabled="isViewMode" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed appearance-none">
              <option value="EFE">EFE</option>
              <option value="TAR">TAR</option>
              <option value="TFS">TFS</option>
            </select>
          </div>

          <div class="md:col-span-3">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Cantidad</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input type="number" v-model.number="formData.cantidad" step="0.01" min="0" :disabled="isViewMode" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-8 pr-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3" v-if="!isViewMode">
          <Button variant="outline" @click="goBack">Cancelar</Button>
          <Button @click="saveGasto" :disabled="saving">
            <span v-if="saving">Guardando...</span>
            <span v-else>{{ isEditMode ? 'Actualizar' : 'Guardar' }}</span>
          </Button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import { useGastos } from '@/composables/useGastos';

const route = useRoute();
const router = useRouter();
const { create, update, getOne } = useGastos();

const mode = ref(route.query.mode || 'add'); // 'add', 'edit', 'view'
const gastoId = ref<number | null>(route.query.id ? Number(route.query.id) : null);
const loading = ref(false);
const saving = ref(false);
const apiError = ref('');

const isViewMode = computed(() => mode.value === 'view');
const isEditMode = computed(() => mode.value === 'edit');

const formData = reactive({
  folio: 'Autogenerado',
  fecha: new Date().toISOString().split('T')[0],
  aNombreDe: '',
  formaPago: 'EFE',
  cantidad: 0
});

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'view') {
    if (gastoId.value) {
      loading.value = true;
      apiError.value = '';
      try {
        const gasto = await getOne(gastoId.value);
        formData.folio = gasto.folio;
        formData.fecha = gasto.fecha;
        formData.aNombreDe = gasto.aNombreDe;
        formData.formaPago = gasto.formaPago;
        formData.cantidad = gasto.cantidad;
      } catch (e: any) {
        apiError.value = e.message || 'Error al obtener los detalles del gasto';
      } finally {
        loading.value = false;
      }
    }
  }
});

const goBack = () => {
  router.push('/gastos');
};

const saveGasto = async () => {
  apiError.value = '';

  // Validaciones
  if (!formData.fecha || !formData.aNombreDe) {
    apiError.value = 'Fecha y A nombre de son campos obligatorios.';
    return;
  }

  if (formData.cantidad <= 0) {
    apiError.value = 'La cantidad debe ser mayor que 0.';
    return;
  }

  saving.value = true;
  try {
    const payload = {
      fecha: formData.fecha,
      aNombreDe: formData.aNombreDe,
      formaPago: formData.formaPago,
      cantidad: formData.cantidad
    };

    if (isEditMode.value && gastoId.value !== null) {
      await update(gastoId.value, payload);
    } else {
      await create(payload);
    }
    goBack();
  } catch (e: any) {
    apiError.value = e.message || 'Error al guardar el gasto';
  } finally {
    saving.value = false;
  }
};
</script>

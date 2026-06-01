<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">
            {{ isViewMode ? 'Ver Receta' : (isEditMode ? 'Editar Receta' : 'Agregar Receta') }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400" v-if="formData.clave">
            Clave: <span class="font-mono font-medium">{{ formData.clave }}</span>
          </p>
        </div>
        <Button variant="outline" @click="goBack">Volver</Button>
      </div>

      <!-- Datos generales -->
      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 class="mb-4 text-base font-medium text-gray-700 dark:text-gray-300">Datos generales</h3>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-12">

          <!-- Clave -->
          <div class="md:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Clave</label>
            <input
              type="text"
              v-model="formData.clave"
              disabled
              class="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/70"
            />
            <p class="mt-1 text-xs text-gray-400">Autogenerada</p>
          </div>

          <!-- Platillo -->
          <div class="md:col-span-10">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nombre del platillo</label>
            <input
              type="text"
              v-model="formData.platillo"
              :disabled="isViewMode"
              placeholder="Ej. Tacos de Arrachera"
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>


          <!-- Descripción -->
          <div class="md:col-span-12">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Descripción / Preparación</label>
            <textarea
              v-model="formData.descripcion"
              :disabled="isViewMode"
              rows="3"
              placeholder="Describe brevemente el platillo o su forma de preparación..."
              class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Variantes -->
      <div class="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-medium text-gray-700 dark:text-gray-300">Variantes de la receta (Opcional)</h3>
          <button v-if="!isViewMode" @click="addVariante" class="text-sm font-medium text-brand-500 hover:text-brand-600">
            + Añadir Variante
          </button>
        </div>
        <div v-if="formData.variantes.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
          Esta receta no tiene variantes. Todos los ingredientes aplicarán a la receta base.
        </div>
        <div v-else class="space-y-3">
          <div v-for="(v, vIdx) in formData.variantes" :key="vIdx" class="flex gap-3 items-center">
            <input type="text" v-model="v.nombre" :disabled="isViewMode" placeholder="Nombre de la variante (Ej. Sencillos)" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            <button v-if="!isViewMode" @click="removeVariante(vIdx)" class="text-gray-400 hover:text-error-500 shrink-0">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Ingredientes -->
      <div class="mt-6 rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-base font-medium text-gray-700 dark:text-gray-300">Ingredientes</h3>
          <button
            v-if="!isViewMode"
            @click="addIngrediente"
            class="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </button>
        </div>

        <div class="max-w-full overflow-visible">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Ingrediente</p></th>
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Cantidad</p></th>
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Medida</p></th>
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Costo unitario</p></th>
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Aplica a</p></th>
                <th class="px-5 py-3 text-right"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Costo línea</p></th>
                <th v-if="!isViewMode" class="px-5 py-3 text-center"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">—</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="(ing, idx) in formData.ingredientes"
                :key="idx"
                class="border-t border-gray-100 dark:border-gray-800"
              >
                <!-- Nombre -->
                <td class="px-3 py-3 relative">
                  <input
                    type="text"
                    v-model="ing.nombre"
                    :disabled="isViewMode"
                    @focus="ing.showDropdown = true"
                    @input="onIngredientInput(idx)"
                    @blur="onBlurIngredient(idx)"
                    placeholder="Buscar ingrediente..."
                    class="w-full min-w-[150px] rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <!-- Dropdown absolute -->
                  <div
                    v-if="ing.showDropdown && !isViewMode"
                    class="absolute left-3 right-3 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    <ul class="py-1">
                      <li
                        v-for="item in filteredInventory(ing.nombre)"
                        :key="item.nombre"
                        @mousedown.prevent="selectIngredient(idx, item)"
                        class="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex justify-between items-center"
                      >
                        <span class="font-medium">{{ item.nombre }}</span>
                        <span class="text-xs text-gray-400 dark:text-gray-500">
                          {{ formatCurrency(item.costoReal) }} / {{ item.medida }}
                        </span>
                      </li>
                      <li
                        v-if="filteredInventory(ing.nombre).length === 0"
                        class="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 italic"
                      >
                        No se encontró en inventario
                      </li>
                    </ul>
                  </div>
                </td>
                <!-- Cantidad -->
                <td class="px-3 py-3">
                  <input
                    type="number"
                    v-model="ing.cantidad"
                    :disabled="isViewMode"
                    min="0"
                    step="0.01"
                    class="w-full min-w-[80px] rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </td>
                <!-- Medida -->
                <td class="px-3 py-3">
                  <input
                    type="text"
                    v-model="ing.medida"
                    disabled
                    placeholder="Medida"
                    class="w-full min-w-[80px] text-center rounded-lg border border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 shadow-theme-xs cursor-not-allowed"
                  />
                </td>
                <!-- Costo unitario -->
                <td class="px-3 py-3">
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      v-model="ing.costoUnitario"
                      :disabled="isViewMode"
                      min="0"
                      step="0.01"
                      class="w-full min-w-[100px] text-right rounded-lg border border-gray-300 bg-transparent pl-7 pr-3 py-1.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </td>
                <!-- Aplica a -->
                <td class="px-3 py-3">
                  <select
                    v-model="ing.varianteIndex"
                    :disabled="isViewMode"
                    class="w-full min-w-[120px] rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 disabled:opacity-50"
                  >
                    <option :value="undefined">Base (Siempre)</option>
                    <option v-for="(v, vIdx) in formData.variantes" :key="vIdx" :value="vIdx">
                      {{ v.nombre || 'Variante ' + (vIdx + 1) }}
                    </option>
                  </select>
                </td>
                <!-- Costo línea (calculado) -->
                <td class="px-5 py-3 text-right">
                  <span class="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ formatCurrency(ing.cantidad * ing.costoUnitario) }}
                  </span>
                </td>
                <!-- Eliminar fila -->
                <td v-if="!isViewMode" class="px-3 py-3 text-center">
                  <button
                    @click="removeIngrediente(idx)"
                    class="text-gray-400 hover:text-error-500 transition-colors"
                    title="Eliminar ingrediente"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
              <!-- Fila vacía -->
              <tr v-if="formData.ingredientes.length === 0">
                <td :colspan="isViewMode ? 5 : 6" class="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  Sin ingredientes. Haz clic en "Agregar" para comenzar.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totales -->
        <div class="flex justify-end border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/20">
          <div class="w-full max-w-xs space-y-2">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500 dark:text-gray-400">N° ingredientes</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ formData.ingredientes.length }}</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-base font-medium text-gray-800 dark:text-white/90">Costo Base</span>
              <span class="text-lg font-bold text-brand-500">{{ formatCurrency(costos.baseCost) }}</span>
            </div>
            <div v-for="(vc, idx) in costos.variantsCost" :key="idx" class="flex justify-between items-center pt-1">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Costo con {{ vc.nombre }}</span>
              <span class="text-base font-bold text-gray-700 dark:text-gray-300">{{ formatCurrency(vc.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="mt-6 flex justify-end gap-3" v-if="!isViewMode">
        <Button variant="outline" @click="goBack">Cancelar</Button>
        <Button @click="saveReceta">{{ isEditMode ? 'Actualizar' : 'Guardar receta' }}</Button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import { normalizeTitleCase } from '@/utils/formatters';

const route = useRoute();
const router = useRouter();

const mode = ref(route.query.mode || 'add'); // 'add' | 'edit' | 'view'
const isViewMode = computed(() => mode.value === 'view');
const isEditMode = computed(() => mode.value === 'edit');
const recipeId = ref(route.query.id || '');

interface Ingrediente {
  nombre: string;
  cantidad: number;
  medida: string;
  costoUnitario: number;
  showDropdown?: boolean;
  varianteIndex?: number;
}

interface Variante {
  nombre: string;
}

const inventarioItems = ref<any[]>([]);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ---- Cargar inventario del API ----
const fetchInventario = async () => {
  try {
    const res = await fetch(`${API_URL}/api/inventario`);
    if (res.ok) {
      const data = await res.json();
      inventarioItems.value = data.map((item: any) => ({
        ...item,
        nombre: normalizeTitleCase(item.nombre)
      }));
    }
  } catch (err) {
    console.error('Error al obtener inventario:', err);
  }
};

const filteredInventory = (searchText: string) => {
  if (!searchText) return inventarioItems.value;
  return inventarioItems.value.filter(item =>
    item.nombre.toLowerCase().includes(searchText.toLowerCase())
  );
};

const onIngredientInput = (idx: number) => {
  formData.ingredientes[idx].showDropdown = true;
  const match = inventarioItems.value.find(
    item => item.nombre.toLowerCase() === formData.ingredientes[idx].nombre.toLowerCase()
  );
  if (match) {
    formData.ingredientes[idx].costoUnitario = match.costoReal;
    formData.ingredientes[idx].medida = match.medida;
  } else {
    formData.ingredientes[idx].costoUnitario = 0;
    formData.ingredientes[idx].medida = '';
  }
};

const selectIngredient = (idx: number, item: any) => {
  formData.ingredientes[idx].nombre = item.nombre;
  formData.ingredientes[idx].costoUnitario = item.costoReal;
  formData.ingredientes[idx].medida = item.medida;
  formData.ingredientes[idx].showDropdown = false;
};

const onBlurIngredient = (idx: number) => {
  setTimeout(() => {
    if (formData.ingredientes[idx]) {
      formData.ingredientes[idx].showDropdown = false;
      // Auto-match exact name when blurring
      const exactMatch = inventarioItems.value.find(
        item => item.nombre.toLowerCase() === formData.ingredientes[idx].nombre.toLowerCase()
      );
      if (exactMatch) {
        formData.ingredientes[idx].nombre = exactMatch.nombre;
        formData.ingredientes[idx].costoUnitario = exactMatch.costoReal;
        formData.ingredientes[idx].medida = exactMatch.medida;
      } else {
        // Normalizar si es nuevo
        formData.ingredientes[idx].nombre = normalizeTitleCase(formData.ingredientes[idx].nombre);
      }
    }
  }, 180);
};

const formData = reactive<{
  clave: string;
  platillo: string;
  descripcion: string;
  ingredientes: Ingrediente[];
  variantes: Variante[];
}>({
  clave: '',
  platillo: '',
  descripcion: '',
  ingredientes: [],
  variantes: [],
});

const costos = computed(() => {
  const baseCost = formData.ingredientes
    .filter(i => i.varianteIndex === undefined || i.varianteIndex === null)
    .reduce((acc, ing) => acc + ing.cantidad * ing.costoUnitario, 0);

  const variantsCost = formData.variantes.map((v, idx) => {
    const extra = formData.ingredientes
      .filter(i => i.varianteIndex === idx)
      .reduce((acc, ing) => acc + ing.cantidad * ing.costoUnitario, 0);
    return { nombre: v.nombre || `Variante ${idx + 1}`, total: baseCost + extra };
  });

  return { baseCost, variantsCost };
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

// ---- Ingredientes y Variantes ----
const addIngrediente = () => {
  formData.ingredientes.push({ nombre: '', cantidad: 1, medida: '', costoUnitario: 0, showDropdown: false, varianteIndex: undefined });
};
const removeIngrediente = (idx: number) => {
  formData.ingredientes.splice(idx, 1);
};

const addVariante = () => {
  formData.variantes.push({ nombre: '' });
};
const removeVariante = (idx: number) => {
  formData.variantes.splice(idx, 1);
  // Limpiar varianteIndex de los ingredientes que la usaban
  formData.ingredientes.forEach(ing => {
    if (ing.varianteIndex === idx) {
      ing.varianteIndex = undefined;
    } else if (ing.varianteIndex !== undefined && ing.varianteIndex > idx) {
      ing.varianteIndex -= 1;
    }
  });
};

// ---- Lifecycle ----
onMounted(async () => {
  await fetchInventario();

  if (mode.value === 'edit' || mode.value === 'view') {
    if (recipeId.value) {
      try {
        const res = await fetch(`${API_URL}/api/recetas/${recipeId.value}`);
        if (res.ok) {
          const data = await res.json();
          formData.clave = data.clave;
          formData.platillo = data.platillo;
          formData.descripcion = data.descripcion || '';
          
          formData.variantes = (data.variantes || []).map((v: any) => ({
            nombre: v.nombre
          }));

          formData.ingredientes = data.ingredientes.map((ing: any) => {
            // Find variant index by ID
            let vIdx = undefined;
            if (ing.varianteId && data.variantes) {
              const idx = data.variantes.findIndex((v: any) => v.id === ing.varianteId);
              if (idx !== -1) vIdx = idx;
            }

            return {
              nombre: normalizeTitleCase(ing.nombre),
              cantidad: parseFloat(ing.cantidad),
              medida: ing.medida,
              costoUnitario: parseFloat(ing.costoUnitario),
              showDropdown: false,
              varianteIndex: vIdx
            };
          });
        }
      } catch (err) {
        console.error('Error al cargar detalles de la receta:', err);
      }
    }
  } else {
    formData.clave = 'REC-Autogenerada';
    formData.variantes = [];
    formData.ingredientes = [{ nombre: '', cantidad: 1, medida: '', costoUnitario: 0, showDropdown: false, varianteIndex: undefined }];
  }
});

// ---- Guardar / Cancelar ----
const goBack = () => router.push('/recetas');

const saveReceta = async () => {
  // Normalizar nombres antes de validar
  formData.platillo = normalizeTitleCase(formData.platillo);
  formData.ingredientes.forEach(ing => {
    if (ing.nombre) ing.nombre = normalizeTitleCase(ing.nombre);
  });

  if (!formData.platillo.trim()) {
    alert('Por favor, ingresa el nombre del platillo.');
    return;
  }

  // Filtrar ingredientes vacíos antes de validar y guardar
  formData.ingredientes = formData.ingredientes.filter(ing => ing.nombre && ing.nombre.trim() !== '');

  if (formData.ingredientes.length === 0) {
    alert('Por favor, agrega al menos un ingrediente válido.');
    return;
  }
  
  // Limpiar variantes vacías y ajustar índices de ingredientes
  const validVariantes = formData.variantes.filter(v => v.nombre && v.nombre.trim() !== '');
  
  // Create a mapping from old index to new index
  const indexMap = new Map();
  let newIdx = 0;
  formData.variantes.forEach((v, oldIdx) => {
    if (v.nombre && v.nombre.trim() !== '') {
      indexMap.set(oldIdx, newIdx);
      newIdx++;
    }
  });

  const payload = {
    platillo: formData.platillo,
    descripcion: formData.descripcion,
    variantes: validVariantes,
    ingredientes: formData.ingredientes.map(ing => {
      let mappedVarIdx = undefined;
      if (ing.varianteIndex !== undefined && indexMap.has(ing.varianteIndex)) {
        mappedVarIdx = indexMap.get(ing.varianteIndex);
      }
      return {
        nombre: ing.nombre,
        cantidad: parseFloat(ing.cantidad.toString()) || 0,
        medida: ing.medida,
        costoUnitario: parseFloat(ing.costoUnitario.toString()) || 0,
        varianteIndex: mappedVarIdx
      };
    })
  };

  try {
    let res;
    if (isEditMode.value) {
      res = await fetch(`${API_URL}/api/recetas/${recipeId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(`${API_URL}/api/recetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (res.ok) {
      goBack();
    } else {
      const errData = await res.json();
      alert(errData.error || 'Error al guardar la receta');
    }
  } catch (err) {
    console.error('Error al guardar receta:', err);
    alert('Error de conexión con el servidor.');
  }
};
</script>

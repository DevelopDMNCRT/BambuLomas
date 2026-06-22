<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">
            {{ isViewMode ? 'Detalles del Platillo' : (editId ? 'Editar Platillo' : 'Agregar Platillo') }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ isViewMode ? 'Información completa del platillo seleccionado.' : 'Completa la información del platillo para el punto de venta.' }}
          </p>
        </div>
        <Button variant="outline" @click="goBack">Volver</Button>
      </div>

      <fieldset :disabled="isViewMode" class="w-full">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <!-- Columna Principal (Izquierda) -->
          <div class="lg:col-span-8 flex flex-col gap-6">
            
            <!-- Card: Información General -->
            <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 class="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">Información General</h3>
              
              <div class="space-y-5">
                <!-- Nombre del Platillo -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nombre del Platillo</label>
                  <input
                    type="text"
                    v-model="formData.nombre"
                    placeholder="Ej. Latte Vainilla"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>

                <!-- Descripción -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Descripción</label>
                  <textarea
                    v-model="formData.descripcion"
                    rows="4"
                    placeholder="Descripción breve del platillo..."
                    class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 resize-none"
                  ></textarea>
                </div>

                <!-- Categoría y Tipo -->
                <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Categoría</label>
                    <div class="relative">
                      <select
                        v-model="formData.categoria"
                        class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                      >
                        <option value="" disabled>Seleccionar</option>
                        <option value="Bebidas Calientes">Bebidas Calientes</option>
                        <option value="Bebidas Frías">Bebidas Frías</option>
                        <option value="Postres">Postres</option>
                        <option value="Alimentos">Alimentos</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Recompensa">Recompensa</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Tipo</label>
                    <div class="relative">
                      <select
                        v-model="formData.tipo"
                        class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                      >
                        <option value="Sencillo">Sencillo</option>
                        <option value="Compuesto">Compuesto</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Receta Base (Autocomplete) -->
                <div class="relative">
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Receta Base</label>
                  <input
                    type="text"
                    v-model="searchRecetaText"
                    @focus="showRecetasDropdown = true"
                    @blur="onBlurReceta"
                    placeholder="Buscar receta..."
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                  
                  <!-- Dropdown de Recetas -->
                  <div
                    v-if="showRecetasDropdown"
                    class="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    <ul class="py-1">
                      <li
                        v-for="receta in filteredRecetas"
                        :key="receta.id || receta.clave"
                        @mousedown.prevent="selectReceta(receta)"
                        class="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex justify-between items-center"
                      >
                        <span class="font-medium">{{ receta.platillo }}</span>
                        <span class="text-xs text-gray-400">Costo: {{ formatCurrency(calcularCostoReceta(receta)) }}</span>
                      </li>
                      <li
                        v-if="filteredRecetas.length === 0"
                        class="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 italic"
                      >
                        No se encontró ninguna receta
                      </li>
                    </ul>
                  </div>
                  <!-- Receta seleccionada badge -->
                  <div v-if="formData.recetaBaseId" class="mt-2 flex items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
                      <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg>
                      Receta vinculada
                    </span>
                    <button v-if="!isViewMode" @click="clearReceta" class="text-xs text-error-500 hover:text-error-600">Desvincular</button>
                  </div>
                </div>
              </div>
            </div>


            <!-- Card: Variables del Producto -->
            <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Variables del Producto</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Agrega diferentes opciones como tamaño, leche extra, etc.</p>
                </div>
                <Button v-if="!isViewMode" variant="outline" size="sm" @click="addVariable">
                  <svg class="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  Agregar Variable
                </Button>
              </div>

              <div v-if="formData.variables.length === 0" class="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                <p class="text-sm text-gray-500 dark:text-gray-400">Este producto no tiene variables aún.</p>
              </div>

              <div v-else class="space-y-4">
                <div v-for="(variable, vIndex) in formData.variables" :key="vIndex" class="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                  <div class="mb-4 flex items-start justify-between gap-4">
                    <div class="w-1/2">
                      <input
                        type="text"
                        v-model="variable.nombre"
                        placeholder="Nombre del Grupo (Ej. Leche)"
                        class="h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                      <div class="mt-2 flex items-center gap-4 text-xs">
                        <label class="flex items-center gap-1.5 cursor-pointer text-gray-600 dark:text-gray-400">
                          <input type="checkbox" v-model="variable.obligatorio" class="rounded border-gray-300 text-brand-500 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-800" />
                          Obligatorio (Min. 1)
                        </label>
                        <label class="flex items-center gap-1.5 cursor-pointer text-gray-600 dark:text-gray-400">
                          <input type="checkbox" v-model="variable.multiple" class="rounded border-gray-300 text-brand-500 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-800" />
                          Selección Múltiple
                        </label>
                      </div>
                    </div>
                    <button v-if="!isViewMode" @click="removeVariable(vIndex)" class="text-gray-400 hover:text-error-500 shrink-0 mt-1">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                  
                  <!-- Opciones de la variable -->
                  <div class="space-y-2 pl-2">
                    <div v-for="(opcion, oIndex) in variable.opciones" :key="oIndex" class="flex flex-col gap-2 mb-3 bg-white p-3 rounded border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                      <div class="flex items-center gap-3">
                        <input
                          type="text"
                          v-model="opcion.nombre"
                          placeholder="Opción (Ej. Grande)"
                          class="h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                        <div class="relative w-32 shrink-0">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+$</span>
                          <input
                            type="number"
                            v-model="opcion.precioExtra"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            class="h-9 w-full rounded-md border border-gray-200 bg-white pl-8 pr-2 py-1.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                          />
                        </div>
                        <button v-if="!isViewMode" @click="removeOpcion(vIndex, oIndex)" class="text-gray-400 hover:text-error-500 mt-1" title="Eliminar opción">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                      
                      <!-- Variante Selector -->
                      <div v-if="variantesDisponibles.length > 0" class="flex flex-col gap-1 mt-1">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Asociar a variante de receta:</span>
                          <select v-model="opcion.recetaVarianteId" :disabled="isViewMode" class="h-8 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/80 disabled:opacity-50">
                            <option :value="null">Ninguna (Solo usar la base)</option>
                            <option v-for="v in variantesDisponibles" :key="v.id" :value="v.id">{{ v.nombre }}</option>
                          </select>
                        </div>
                        <div v-if="formData.recetaBaseId" class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pl-1">
                          <span>Costo de ingredientes:</span>
                          <span class="font-bold text-gray-700 dark:text-gray-300">
                            {{ formatCurrency(getOpcionCosto(opcion.recetaVarianteId)) }}
                          </span>
                        </div>
                      </div>
                      <div v-else-if="formData.recetaBaseId" class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1 pl-1">
                        <span>Costo de ingredientes:</span>
                        <span class="font-bold text-gray-700 dark:text-gray-300">
                          {{ formatCurrency(getOpcionCosto(null)) }}
                        </span>
                      </div>
                    </div>
                    <button v-if="!isViewMode" @click="addOpcion(vIndex)" class="mt-2 text-sm text-brand-500 hover:text-brand-600 font-medium">
                      + Añadir opción
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Columna Lateral (Derecha) -->
          <div class="lg:col-span-4">
            <div class="sticky top-[104px] rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col gap-5">
              
              <!-- Guardar -->
              <button
                v-if="!isViewMode"
                @click="savePlatillo"
                class="w-full rounded-lg bg-[#2D5A5A] px-4 py-3 text-sm font-medium text-white hover:bg-[#244a4a] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A5A]/30"
              >
                {{ editId ? 'Guardar Cambios' : 'Guardar Platillo' }}
              </button>

              <!-- Público Toggle -->
              <div class="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Público</span>
                <button
                  @click="formData.privado = !formData.privado"
                  :class="!formData.privado ? 'bg-success-500' : 'bg-gray-200 dark:bg-gray-700'"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                >
                  <span
                    :class="!formData.privado ? 'translate-x-6' : 'translate-x-1'"
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  />
                </button>
              </div>
              <!-- Imagen del Platillo -->
              <div>
                <label class="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Imagen del Platillo</label>
                <div class="flex justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 px-4 py-6 hover:border-brand-300 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800/30 dark:hover:border-gray-600 dark:hover:bg-gray-800/50">
                  <div class="text-center w-full">
                    
                    <!-- Subiendo -->
                    <div v-if="isUploading" class="flex flex-col items-center justify-center py-4">
                      <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p class="mt-2 text-sm text-gray-500">Subiendo...</p>
                    </div>

                    <!-- Preview -->
                    <div v-else-if="formData.imagenUrl" class="relative inline-block w-full">
                      <img :src="formData.imagenUrl" alt="Preview" class="mx-auto max-h-40 rounded-lg object-cover shadow-sm w-full" />
                      <button v-if="!isViewMode" @click="formData.imagenUrl = ''" class="absolute -top-3 -right-3 rounded-full bg-white p-1 text-gray-500 shadow-md hover:text-error-500 dark:bg-gray-800 dark:text-gray-400">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>

                    <!-- Empty State -->
                    <div v-else>
                      <svg class="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div class="mt-3 flex flex-col text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                        <label for="file-upload" class="relative cursor-pointer rounded-md font-semibold text-brand-600 focus-within:outline-none hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300">
                          <span>Click para subir</span>
                          <input id="file-upload" name="file-upload" type="file" class="sr-only" accept="image/png, image/jpeg, image/svg+xml" @change="onFileSelected">
                        </label>
                        <p>o arrastra</p>
                      </div>
                      <p class="mt-1 text-[10px] leading-5 text-gray-500 dark:text-gray-500 uppercase tracking-wide">SVG, PNG, JPG (MAX. 2MB)</p>
                    </div>

                  </div>
                </div>
              </div>

              <!-- Precio Base -->
              <div>
                <label class="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Precio Base</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-lg">$</span>
                  <input
                    type="number"
                    v-model="formData.precioBase"
                    min="0"
                    step="0.01"
                    class="h-12 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-3 text-base font-semibold text-gray-900 shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <!-- Costo Real Base -->
              <div class="rounded-xl bg-gray-50 p-4 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-800">
                <label class="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Costo Real (Base)</label>
                <div class="flex items-center gap-1">
                  <span class="text-gray-500 font-medium text-lg">$</span>
                  <span class="text-xl font-bold text-gray-700 dark:text-gray-300">
                    {{ costoRealBase }}
                  </span>
                </div>
                <p v-if="formData.recetaBaseId" class="mt-1 text-xs text-brand-600 dark:text-brand-400 font-medium">Vinculado a receta</p>
              </div>

            </div>
          </div>
        </div>
      </fieldset>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';

const router = useRouter();
const route = useRoute();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const isViewMode = computed(() => route.query.mode === 'view');
const editId = computed(() => route.query.id as string | undefined);

const formData = reactive({
  nombre: '',
  descripcion: '',
  categoria: '',
  tipo: 'Sencillo',
  recetaBaseId: null as number | string | null,
  variables: [] as any[],
  privado: false,
  precioBase: 0,
  imagenUrl: '',
});

const isUploading = ref(false);

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  isUploading.value = true;
  
  const data = new FormData();
  data.append('image', file);
  
  try {
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: data
    });
    
    if (res.ok) {
      const json = await res.json();
      formData.imagenUrl = json.url;
    } else {
      alert('Error al subir la imagen');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Error de conexión');
  } finally {
    isUploading.value = false;
    target.value = '';
  }
};

// Variables logic
const addVariable = () => {
  formData.variables.push({
    nombre: '',
    obligatorio: true,
    multiple: false,
    opciones: [{ nombre: '', precioExtra: 0, recetaVarianteId: null }]
  });
};

const removeVariable = (index: number) => {
  formData.variables.splice(index, 1);
};

const addOpcion = (vIndex: number) => {
  formData.variables[vIndex].opciones.push({ nombre: '', precioExtra: 0, recetaVarianteId: null });
};

const removeOpcion = (vIndex: number, oIndex: number) => {
  formData.variables[vIndex].opciones.splice(oIndex, 1);
};

// Recetas Logic
const recetas = ref<any[]>([]);
const searchRecetaText = ref('');
const showRecetasDropdown = ref(false);
const costoRecetaSeleccionada = ref(0);

const variantesDisponibles = computed(() => {
  if (!formData.recetaBaseId) return [];
  const receta = recetas.value.find(r => r.id === formData.recetaBaseId || r.clave === formData.recetaBaseId);
  return receta?.variantes || [];
});

const fetchRecetas = async () => {
  try {
    const res = await fetch(`${API_URL}/api/recetas`);
    if (res.ok) {
      recetas.value = await res.json();
    }
  } catch (err) {
    console.error('Error al obtener recetas:', err);
  }
};

const calcularCostoReceta = (receta: any, varianteId: number | string | null = null) => {
  if (!receta || !receta.ingredientes) return 0;
  return receta.ingredientes.reduce((acc: number, ing: any) => {
    const ingVarId = ing.varianteId;
    const isBase = ingVarId === null || ingVarId === undefined;
    const isTargetVariant = varianteId !== null && ingVarId !== null && ingVarId !== undefined && String(ingVarId) === String(varianteId);
    
    if (varianteId === null) {
      if (isBase) {
        return acc + (parseFloat(ing.cantidad) * parseFloat(ing.costoUnitario || ing.costo_unitario || 0));
      }
    } else {
      if (isBase || isTargetVariant) {
        return acc + (parseFloat(ing.cantidad) * parseFloat(ing.costoUnitario || ing.costo_unitario || 0));
      }
    }
    return acc;
  }, 0);
};

const getOpcionCosto = (recetaVarianteId: any) => {
  const receta = recetas.value.find(r => (r.id || r.clave) === formData.recetaBaseId);
  if (!receta) return 0;
  return calcularCostoReceta(receta, recetaVarianteId);
};

const filteredRecetas = computed(() => {
  if (!searchRecetaText.value) return recetas.value;
  return recetas.value.filter(r => 
    r.platillo.toLowerCase().includes(searchRecetaText.value.toLowerCase())
  );
});

const selectReceta = (receta: any) => {
  formData.recetaBaseId = receta.id || receta.clave;
  searchRecetaText.value = receta.platillo;
  showRecetasDropdown.value = false;
  costoRecetaSeleccionada.value = calcularCostoReceta(receta);
};

const clearReceta = () => {
  formData.recetaBaseId = null;
  searchRecetaText.value = '';
  costoRecetaSeleccionada.value = 0;
};

const onBlurReceta = () => {
  setTimeout(() => {
    showRecetasDropdown.value = false;
    if (formData.recetaBaseId) {
      const vinculada = recetas.value.find(r => (r.id || r.clave) === formData.recetaBaseId);
      if (vinculada && searchRecetaText.value !== vinculada.platillo) {
        clearReceta();
      } else if (vinculada) {
        searchRecetaText.value = vinculada.platillo;
      }
    }
  }, 200);
};

// Computed / Formatters
const costoRealBase = computed(() => {
  return costoRecetaSeleccionada.value.toFixed(2);
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
};

const goBack = () => {
  router.push('/carta');
};

const savePlatillo = async () => {
  if (!formData.nombre || !formData.categoria) {
    alert('Por favor completa el nombre y la categoría.');
    return;
  }

  try {
    const method = editId.value ? 'PUT' : 'POST';
    const url = editId.value ? `${API_URL}/api/platillos/${editId.value}` : `${API_URL}/api/platillos`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert(editId.value ? '¡Platillo actualizado exitosamente!' : '¡Platillo guardado exitosamente!');
      router.push('/carta');
    } else {
      const err = await res.json();
      alert(`Error: ${err.error || 'No se pudo guardar el platillo'}`);
    }
  } catch (error) {
    console.error('Error al guardar platillo:', error);
    alert('Error de conexión al guardar el platillo.');
  }
};

const loadPlatillo = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/api/platillos/${id}`);
    if (res.ok) {
      const data = await res.json();
      formData.nombre = data.nombre;
      formData.descripcion = data.descripcion || '';
      formData.categoria = data.categoria;
      formData.tipo = data.tipo;
      formData.recetaBaseId = data.recetaBaseId || '';
      formData.privado = data.privado;
      formData.precioBase = parseFloat(data.precioBase);
      formData.imagenUrl = data.imagenUrl || '';
      formData.variables = data.variables || [];
      
      // Intentar vincular el nombre en el input de búsqueda
      if (formData.recetaBaseId) {
        const r = recetas.value.find(x => (x.id || x.clave) == formData.recetaBaseId);
        if (r) {
          searchRecetaText.value = r.platillo;
          costoRecetaSeleccionada.value = calcularCostoReceta(r);
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar platillo:', error);
  }
};

onMounted(async () => {
  await fetchRecetas();
  if (editId.value) {
    await loadPlatillo(editId.value);
  }
});
</script>

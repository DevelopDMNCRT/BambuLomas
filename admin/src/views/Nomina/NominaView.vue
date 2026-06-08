<template>
  <AdminLayout>
    <div class="p-6 space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Nómina</h1>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <!-- Filtros de Fecha -->
          <div class="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-sm">
            <button @click="filterType = 'hoy'" :class="['px-3 py-1.5 rounded-lg font-medium transition-colors', filterType === 'hoy' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700']">Hoy</button>
            <div class="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div class="relative flex items-center">
              <button @click="filterType = 'dia'" :class="['px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1', filterType === 'dia' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700']">
                Día
              </button>
              <div v-show="filterType === 'dia'" class="ml-2 w-32 relative">
                <flat-pickr v-model="filterDate" :config="flatPickrConfig" class="w-full text-xs py-1 px-2 pr-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-brand-500" placeholder="Elegir día" />
                <svg class="w-3 h-3 absolute right-2 top-1.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>

          <!-- Search -->
          <div class="relative w-full sm:w-64">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar empleado..." 
              class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <Button size="sm" @click="agregarNuevo">Agregar Nuevo</Button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th class="px-5 py-3 text-left">
                  <p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Usuario</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Rol</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Horario</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Día</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Checó</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Acciones</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <!-- Empty state for table -->
              <tr v-if="filteredEmpleados.length === 0">
                <td colspan="6" class="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                  <p>No se encontraron registros de nómina.</p>
                </td>
              </tr>
              <!-- Table Rows -->
              <tr 
                v-for="(empleado, index) in filteredEmpleados" 
                :key="index"
                class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td class="px-5 py-4">
                  <p class="font-bold text-gray-800 text-sm dark:text-white/90">{{ empleado.usuario }}</p>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2.5 py-0.5 rounded-md text-xs">
                    {{ empleado.rol }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-600 font-medium text-sm dark:text-gray-300">{{ empleado.hora_entrada }} - {{ empleado.hora_salida }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-600 font-medium text-sm dark:text-gray-300">{{ empleado.fecha }}</p>
                </td>
                <td class="px-5 py-4 text-center">
                  <div class="flex flex-col items-center gap-1">
                    <span 
                      class="inline-flex px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider"
                      :class="{
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400': empleado.estadoChecado === 'pendiente',
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': empleado.estadoChecado === 'puntual',
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': empleado.estadoChecado === 'tarde',
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': empleado.estadoChecado === 'falta'
                      }"
                    >
                      {{ 
                        empleado.estadoChecado === 'pendiente' ? 'Pendiente' : 
                        empleado.estadoChecado === 'puntual' ? 'Puntual' : 
                        empleado.estadoChecado === 'tarde' ? 'Tarde' : 'No Checó' 
                      }}
                    </span>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span v-if="empleado.horaExacta" class="text-xs text-gray-500 font-medium whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded" title="Hora de entrada">
                        Ent: {{ empleado.horaExacta }}
                      </span>
                      <span v-if="empleado.horaExactaSalida" class="text-xs text-gray-500 font-medium whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded" title="Hora de salida">
                        Sal: {{ empleado.horaExactaSalida }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="abrirDetalle(empleado)" class="text-gray-400 hover:text-brand-500 transition-colors px-2" title="Ver Detalles">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button class="text-gray-400 hover:text-brand-500 transition-colors px-2" title="Editar">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Agregar Nuevo -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm custom-modal-backdrop" @click="closeModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in">
          
          <!-- Header -->
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
            <div>
              <h3 class="text-lg font-bold text-gray-800 dark:text-white">Agregar a Nómina</h3>
            </div>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Usuario</label>
              <select v-model="formData.usuario_id" class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white appearance-none">
                <option value="">Selecciona un usuario...</option>
                <option v-for="u in usuarios" :key="u.id" :value="u.id">
                  {{ u.nombre }} ({{ u.rol }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Rol</label>
              <input v-model="formData.rol" type="text" placeholder="" class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Hora Entrada</label>
                <input v-model="formData.horaEntrada" type="time" class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Hora Salida</label>
                <input v-model="formData.horaSalida" type="time" class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Día</label>
              <div class="relative">
                <flat-pickr
                  v-model="formData.dia"
                  :config="flatPickrConfig"
                  class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Selecciona un día"
                />
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
            <button @click="closeModal" class="px-5 py-2.5 rounded-xl font-bold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancelar
            </button>
            <button @click="guardarNuevo" class="px-6 py-2.5 rounded-xl font-bold bg-[#4F817D] text-white hover:bg-[#3d6460] transition-colors shadow-sm">
              Guardar
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- Modal Detalles de Nómina -->
    <Teleport to="body">
      <div v-if="showDetalleModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm custom-modal-backdrop" @click="closeDetalleModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in">
          
          <!-- Header -->
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
            <div>
              <h3 class="text-lg font-bold text-gray-800 dark:text-white">Detalles de Nómina</h3>
            </div>
            <button @click="closeDetalleModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Filtro del Modal -->
          <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center">
            <div class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-sm">
              <button @click="detalleFilterType = 'hoy'" :class="['px-3 py-1.5 rounded-lg font-medium transition-colors', detalleFilterType === 'hoy' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']">Hoy</button>
              <div class="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div class="relative flex items-center">
                <button @click="detalleFilterType = 'dia'" :class="['px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1', detalleFilterType === 'dia' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']">
                  Día
                </button>
                <div v-show="detalleFilterType === 'dia'" class="ml-2 w-32 relative">
                  <flat-pickr v-model="detalleFilterDate" :config="flatPickrConfig" class="w-full text-xs py-1 px-2 pr-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-brand-500" placeholder="Elegir día" />
                  <svg class="w-3 h-3 absolute right-2 top-1.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
            </div>
            <div v-if="detalleLoading" class="ml-4 text-xs text-gray-500">Cargando...</div>
          </div>

          <!-- Body / Table -->
          <div class="p-0 overflow-y-auto max-h-[60vh] custom-scrollbar bg-white dark:bg-gray-900/50">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th class="px-5 py-3 text-left"><p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Usuario</p></th>
                  <th class="px-5 py-3 text-left"><p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Rol</p></th>
                  <th class="px-5 py-3 text-left"><p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Horario</p></th>
                  <th class="px-5 py-3 text-left"><p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Día</p></th>
                  <th class="px-5 py-3 text-center"><p class="font-bold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Checó</p></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-if="filteredDetalleNominas.length === 0">
                  <td colspan="5" class="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                    <p>No se encontraron registros para este usuario en esta fecha.</p>
                  </td>
                </tr>
                <tr v-for="(empleado, index) in filteredDetalleNominas" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td class="px-5 py-4"><p class="font-bold text-gray-800 text-sm dark:text-white/90">{{ empleado.usuario }}</p></td>
                  <td class="px-5 py-4"><span class="inline-flex font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2.5 py-0.5 rounded-md text-xs">{{ empleado.rol }}</span></td>
                  <td class="px-5 py-4"><p class="text-gray-600 font-medium text-sm dark:text-gray-300">{{ empleado.hora_entrada }} - {{ empleado.hora_salida }}</p></td>
                  <td class="px-5 py-4"><p class="text-gray-600 font-medium text-sm dark:text-gray-300">{{ empleado.fecha }}</p></td>
                  <td class="px-5 py-4 text-center">
                    <div class="flex flex-col items-center gap-1">
                      <span 
                        class="inline-flex px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider"
                        :class="{
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400': empleado.estadoChecado === 'pendiente',
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': empleado.estadoChecado === 'puntual',
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': empleado.estadoChecado === 'tarde',
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': empleado.estadoChecado === 'falta'
                        }"
                      >
                        {{ 
                          empleado.estadoChecado === 'pendiente' ? 'Pendiente' : 
                          empleado.estadoChecado === 'puntual' ? 'Puntual' : 
                          empleado.estadoChecado === 'tarde' ? 'Tarde' : 'No Checó' 
                        }}
                      </span>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span v-if="empleado.horaExacta" class="text-xs text-gray-500 font-medium whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded" title="Hora de entrada">
                          Ent: {{ empleado.horaExacta }}
                        </span>
                        <span v-if="empleado.horaExactaSalida" class="text-xs text-gray-500 font-medium whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded" title="Hora de salida">
                          Sal: {{ empleado.horaExactaSalida }}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { useNomina } from '@/composables/useNomina';
import { useUsuarios, type Usuario } from '@/composables/useUsuarios';

const { nominas, loading, fetchNominas, createNomina } = useNomina();
const { nominas: detalleNominasRaw, fetchNominas: fetchDetalleNominas, loading: detalleLoading } = useNomina();
const { getAll } = useUsuarios();

const usuarios = ref<Usuario[]>([]);

const flatPickrConfig = ref({
  locale: Spanish,
  dateFormat: 'Y-m-d',
  allowInput: true,
});

const searchQuery = ref('');
const showModal = ref(false);

const filterType = ref('hoy');
const filterDate = ref('');

const showDetalleModal = ref(false);
const selectedDetalleUsuario = ref<any>(null);
const detalleFilterType = ref('hoy');
const detalleFilterDate = ref('');

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const currentDateString = computed(() => {
  return filterType.value === 'hoy' ? getTodayString() : (filterDate.value || getTodayString());
});

const currentDetalleDateString = computed(() => {
  return detalleFilterType.value === 'hoy' ? getTodayString() : (detalleFilterDate.value || getTodayString());
});

watch(currentDateString, (newDate) => {
  if (newDate) {
    fetchNominas(newDate);
  }
});

watch(currentDetalleDateString, (newDate) => {
  if (newDate && showDetalleModal.value) {
    fetchDetalleNominas(newDate);
  }
});

onMounted(async () => {
  try {
    usuarios.value = await getAll();
  } catch (err) {
    console.error(err);
  }
  fetchNominas(currentDateString.value);
});

const formData = ref({
  usuario_id: '',
  rol: '',
  horaEntrada: '',
  horaSalida: '',
  dia: ''
});

watch(() => formData.value.usuario_id, (newId) => {
  if (newId) {
    const selectedUser = usuarios.value.find(u => u.id === Number(newId));
    if (selectedUser && selectedUser.rol) {
      formData.value.rol = selectedUser.rol;
    }
  } else {
    formData.value.rol = '';
  }
});

const filteredEmpleados = computed(() => {
  if (!searchQuery.value) return nominas.value;
  const q = searchQuery.value.toLowerCase();
  return nominas.value.filter(emp => 
    emp.usuario.toLowerCase().includes(q) || 
    emp.rol.toLowerCase().includes(q)
  );
});

const filteredDetalleNominas = computed(() => {
  if (!selectedDetalleUsuario.value) return [];
  return detalleNominasRaw.value.filter((n: any) => n.usuario_id === selectedDetalleUsuario.value.usuario_id);
});

const agregarNuevo = () => {
  formData.value = { usuario_id: '', rol: '', horaEntrada: '', horaSalida: '', dia: getTodayString() };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const abrirDetalle = (empleado: any) => {
  selectedDetalleUsuario.value = empleado;
  detalleFilterType.value = filterType.value;
  detalleFilterDate.value = filterDate.value;
  showDetalleModal.value = true;
  fetchDetalleNominas(currentDetalleDateString.value);
};

const closeDetalleModal = () => {
  showDetalleModal.value = false;
  selectedDetalleUsuario.value = null;
};

const guardarNuevo = async () => {
  if (!formData.value.usuario_id || !formData.value.dia || !formData.value.horaEntrada || !formData.value.horaSalida) {
    alert("Por favor llena los campos requeridos (Usuario, Horas y Día)");
    return;
  }
  
  const res = await createNomina({
    usuario_id: Number(formData.value.usuario_id),
    rol: formData.value.rol || 'N/A',
    hora_entrada: formData.value.horaEntrada,
    hora_salida: formData.value.horaSalida,
    fecha: formData.value.dia
  });

  if (res.success) {
    closeModal();
  } else {
    alert(res.error);
  }
};
</script>

<style>
.flatpickr-calendar {
  z-index: 9999999 !important;
}
</style>

<style scoped>
@import 'flatpickr/dist/flatpickr.css';

/* Customize Flatpickr to match Tailwind styles if needed */
:deep(.flatpickr-calendar) {
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
:deep(.dark .flatpickr-calendar) {
  background-color: #1f2937;
  border-color: #374151;
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
.animate-modal-in {
  animation: modal-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: transform, opacity;
}
.custom-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  will-change: opacity;
}
</style>

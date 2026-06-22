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
                      :class="estadoBadgeClass(empleado.estadoChecado)"
                    >
                      {{ estadoLabel(empleado.estadoChecado) }}
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

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- Modal Agregar Nuevo — Horario Semanal                  -->
    <!-- ══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm custom-modal-backdrop" @click="closeModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in max-h-[95vh]">
          
          <!-- Header -->
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 flex-shrink-0">
            <div>
              <h3 class="text-lg font-bold text-gray-800 dark:text-white">Agregar a Nómina</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configura el horario semanal del empleado</p>
            </div>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">

            <!-- 1. Usuario -->
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                <span class="inline-flex items-center justify-center w-5 h-5 bg-brand-500 text-white text-xs rounded-full mr-1.5">1</span>
                Usuario
              </label>
              <div class="relative">
                <select
                  v-model="formData.usuario_id"
                  class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white appearance-none pr-10"
                  :disabled="loadingHorario"
                >
                  <option value="">Selecciona un usuario...</option>
                  <option v-for="u in usuarios" :key="u.id" :value="u.id">
                    {{ u.nombre }} ({{ u.rol }})
                  </option>
                </select>
                <svg class="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                <div v-if="loadingHorario" class="absolute right-8 top-2.5">
                  <svg class="animate-spin h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </div>
              </div>
            </div>

            <!-- 2. Semana de referencia -->
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                <span class="inline-flex items-center justify-center w-5 h-5 bg-brand-500 text-white text-xs rounded-full mr-1.5">2</span>
                Semana de referencia
              </label>
              <div class="relative">
                <flat-pickr
                  v-model="formData.semanaInicio"
                  :config="flatPickrWeekConfig"
                  class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Selecciona el lunes de la semana"
                />
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p v-if="semanaDatesLabel" class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                📅 {{ semanaDatesLabel }}
              </p>
            </div>

            <!-- 3. Horario masivo (aplicar a múltiples días) -->
            <div class="bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-700/30 rounded-xl p-4">
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-bold text-brand-700 dark:text-brand-400">
                  <span class="inline-flex items-center justify-center w-5 h-5 bg-brand-500 text-white text-xs rounded-full mr-1.5">3</span>
                  Aplicar horario a múltiples días
                </label>
              </div>
              <div class="flex flex-wrap gap-2 mb-3">
                <button
                  v-for="(dia, idx) in DIAS_SEMANA"
                  :key="idx"
                  @click="toggleBulkDay(idx)"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                    bulkSelectedDays.includes(idx)
                      ? 'bg-brand-500 text-white border-brand-600 shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-400'
                  ]"
                >
                  {{ dia.short }}
                </button>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Entrada</label>
                  <TimeDropdown v-model="bulkHoraEntrada" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Salida</label>
                  <TimeDropdown v-model="bulkHoraSalida" />
                </div>
              </div>
              <button
                @click="applyBulkSchedule"
                :disabled="!bulkSelectedDays.length || !bulkHoraEntrada || !bulkHoraSalida"
                class="mt-3 w-full py-2 rounded-lg text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Aplicar a {{ bulkSelectedDays.length }} día{{ bulkSelectedDays.length !== 1 ? 's' : '' }} seleccionado{{ bulkSelectedDays.length !== 1 ? 's' : '' }}
              </button>
            </div>

            <!-- 4. Configuración por día -->
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                <span class="inline-flex items-center justify-center w-5 h-5 bg-brand-500 text-white text-xs rounded-full mr-1.5">4</span>
                Configuración por día
              </label>
              <div class="space-y-2">
                <div
                  v-for="(dia, idx) in diasSemana"
                  :key="idx"
                  :class="[
                    'rounded-xl border transition-all overflow-hidden',
                    dia.tipo === 'descanso'
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 opacity-70'
                      : dia.activo
                        ? 'border-brand-200 dark:border-brand-700/40 bg-white dark:bg-gray-800/50'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/20'
                  ]"
                >
                  <div class="flex items-center gap-3 px-4 py-3">
                    <!-- Checkbox activar día -->
                    <button
                      @click="toggleDiaActivo(idx)"
                      :disabled="dia.tipo === 'descanso'"
                      :class="[
                        'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        dia.tipo === 'descanso'
                          ? 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                          : dia.activo
                            ? 'border-brand-500 bg-brand-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-brand-400'
                      ]"
                    >
                      <svg v-if="dia.activo && dia.tipo !== 'descanso'" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </button>

                    <!-- Nombre del día -->
                    <span class="w-10 text-sm font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
                      {{ DIAS_SEMANA[idx].short }}
                    </span>
                    <span class="text-xs text-gray-400 dark:text-gray-500 hidden sm:block flex-shrink-0 w-20">
                      {{ formData.semanaInicio ? getDiaFecha(idx) : '—' }}
                    </span>

                    <!-- Horario (solo si activo y laboral) -->
                    <div v-if="dia.activo && dia.tipo === 'laboral'" class="flex items-center gap-2 flex-1">
                      <div class="flex-1">
                        <TimeDropdown v-model="dia.hora_entrada" placeholder="Entrada" compact />
                      </div>
                      <span class="text-gray-400 text-xs font-bold">–</span>
                      <div class="flex-1">
                        <TimeDropdown v-model="dia.hora_salida" placeholder="Salida" compact />
                      </div>
                    </div>

                    <!-- Descanso label -->
                    <div v-else-if="dia.tipo === 'descanso'" class="flex-1 flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                      <span class="text-xs text-gray-400 dark:text-gray-500 font-medium">Día de descanso</span>
                    </div>

                    <!-- Spacer -->
                    <div v-else class="flex-1"></div>

                    <!-- Toggle descanso -->
                    <button
                      @click="toggleDescanso(idx)"
                      :title="dia.tipo === 'descanso' ? 'Quitar descanso' : 'Marcar como descanso'"
                      :class="[
                        'ml-auto flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                        dia.tipo === 'descanso'
                          ? 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700/40'
                          : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 hover:bg-indigo-50 hover:text-indigo-500 hover:border-indigo-200 dark:hover:bg-indigo-900/20'
                      ]"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                      <span class="hidden sm:inline">{{ dia.tipo === 'descanso' ? 'Quitar' : 'Descanso' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen -->
            <div v-if="resumenDias.laborales > 0 || resumenDias.descanso > 0" class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>
                {{ resumenDias.laborales }} día{{ resumenDias.laborales !== 1 ? 's' : '' }} laboral{{ resumenDias.laborales !== 1 ? 'es' : '' }}
              </span>
              <span class="text-gray-300 dark:text-gray-600">|</span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                {{ resumenDias.descanso }} día{{ resumenDias.descanso !== 1 ? 's' : '' }} de descanso
              </span>
              <span class="text-gray-300 dark:text-gray-600">|</span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
                {{ resumenDias.inactivos }} sin configurar
              </span>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3 flex-shrink-0">
            <button @click="closeModal" class="px-5 py-2.5 rounded-xl font-bold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancelar
            </button>
            <button @click="guardarNuevo" :disabled="saving" class="px-6 py-2.5 rounded-xl font-bold bg-[#4F817D] text-white hover:bg-[#3d6460] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
              <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ saving ? 'Guardando...' : 'Guardar' }}
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
                        :class="estadoBadgeClass(empleado.estadoChecado)"
                      >
                        {{ estadoLabel(empleado.estadoChecado) }}
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
import TimeDropdown from './TimeDropdown.vue';

// ── Composables ──────────────────────────────────────────
const { nominas, loading, fetchNominas, createNomina, getHorarioSemanal, saveHorarioSemanal } = useNomina();
const { nominas: detalleNominasRaw, fetchNominas: fetchDetalleNominas, loading: detalleLoading } = useNomina();
const { getAll } = useUsuarios();

// ── Constantes ───────────────────────────────────────────
const DIAS_SEMANA = [
  { name: 'Lunes',     short: 'Lun' },
  { name: 'Martes',    short: 'Mar' },
  { name: 'Miércoles', short: 'Mié' },
  { name: 'Jueves',    short: 'Jue' },
  { name: 'Viernes',   short: 'Vie' },
  { name: 'Sábado',    short: 'Sáb' },
  { name: 'Domingo',   short: 'Dom' },
];

// ── Estado global ─────────────────────────────────────────
const usuarios = ref<Usuario[]>([]);
const searchQuery = ref('');
const showModal = ref(false);
const saving = ref(false);
const loadingHorario = ref(false);

const filterType = ref('hoy');
const filterDate = ref('');

const showDetalleModal = ref(false);
const selectedDetalleUsuario = ref<any>(null);
const detalleFilterType = ref('hoy');
const detalleFilterDate = ref('');

// ── FlatPickr configs ─────────────────────────────────────
const flatPickrConfig = ref({
  locale: Spanish,
  dateFormat: 'Y-m-d',
  allowInput: true,
});

const flatPickrWeekConfig = ref({
  locale: Spanish,
  dateFormat: 'Y-m-d',
  allowInput: true,
  // Solo permite seleccionar lunes
  onDayCreate: (_dObj: any, _dStr: any, _fp: any, dayElem: HTMLElement) => {
    // día 1 = lunes en flatpickr con locale es
  },
});

// ── Formulario ────────────────────────────────────────────
interface DiaConfig {
  activo: boolean;
  tipo: 'laboral' | 'descanso';
  hora_entrada: string;
  hora_salida: string;
}

const formData = ref({
  usuario_id: '' as string | number,
  rol: '',
  semanaInicio: '',
});

const diasSemana = ref<DiaConfig[]>(
  DIAS_SEMANA.map(() => ({ activo: false, tipo: 'laboral', hora_entrada: '', hora_salida: '' }))
);

// ── Bulk apply (horario masivo) ───────────────────────────
const bulkSelectedDays = ref<number[]>([]);
const bulkHoraEntrada = ref('');
const bulkHoraSalida = ref('');

// ── Helpers ───────────────────────────────────────────────
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Devuelve la fecha del día de la semana idx (0=Lun) a partir de semanaInicio */
const getDiaFecha = (idx: number): string => {
  if (!formData.value.semanaInicio) return '—';
  const base = new Date(formData.value.semanaInicio + 'T12:00:00');
  // Ajustar al lunes de esa semana
  const dayOfWeek = base.getDay(); // 0=Dom,1=Lun,...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);
  const target = new Date(monday);
  target.setDate(monday.getDate() + idx);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
};

const semanaDatesLabel = computed(() => {
  if (!formData.value.semanaInicio) return '';
  const lun = getDiaFecha(0);
  const dom = getDiaFecha(6);
  if (!lun || lun === '—') return '';
  const fmt = (s: string) => {
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  };
  return `${fmt(lun)} — ${fmt(dom)}`;
});

const resumenDias = computed(() => {
  let laborales = 0, descanso = 0, inactivos = 0;
  for (const d of diasSemana.value) {
    if (d.tipo === 'descanso') descanso++;
    else if (d.activo) laborales++;
    else inactivos++;
  }
  return { laborales, descanso, inactivos };
});

// ── Filtros ───────────────────────────────────────────────
const currentDateString = computed(() => {
  return filterType.value === 'hoy' ? getTodayString() : (filterDate.value || getTodayString());
});

const currentDetalleDateString = computed(() => {
  return detalleFilterType.value === 'hoy' ? getTodayString() : (detalleFilterDate.value || getTodayString());
});

watch(currentDateString, (newDate) => {
  if (newDate) fetchNominas(newDate);
});

watch(currentDetalleDateString, (newDate) => {
  if (newDate && showDetalleModal.value) fetchDetalleNominas(newDate);
});

// ── Montar ────────────────────────────────────────────────
onMounted(async () => {
  try {
    usuarios.value = await getAll();
  } catch (err) {
    console.error(err);
  }
  fetchNominas(currentDateString.value);
});

// ── Autocompletar rol y horario al seleccionar usuario ────
watch(() => formData.value.usuario_id, async (newId) => {
  if (newId) {
    const selectedUser = usuarios.value.find(u => u.id === Number(newId));
    if (selectedUser?.rol) formData.value.rol = selectedUser.rol;
    // Cargar horario semanal guardado
    loadingHorario.value = true;
    const horario = await getHorarioSemanal(Number(newId));
    loadingHorario.value = false;
    if (horario.length > 0) {
      // Resetear días y aplicar el horario guardado
      diasSemana.value = DIAS_SEMANA.map(() => ({ activo: false, tipo: 'laboral', hora_entrada: '', hora_salida: '' }));
      for (const d of horario) {
        const idx = d.dia_semana;
        if (idx >= 0 && idx <= 6) {
          diasSemana.value[idx].tipo = d.tipo as 'laboral' | 'descanso';
          if (d.tipo === 'laboral') {
            diasSemana.value[idx].activo = true;
            diasSemana.value[idx].hora_entrada = d.hora_entrada || '';
            diasSemana.value[idx].hora_salida = d.hora_salida || '';
          } else {
            diasSemana.value[idx].activo = false;
          }
        }
      }
    }
  } else {
    formData.value.rol = '';
    resetDias();
  }
});

// ── Acciones de días ──────────────────────────────────────
const resetDias = () => {
  diasSemana.value = DIAS_SEMANA.map(() => ({ activo: false, tipo: 'laboral', hora_entrada: '', hora_salida: '' }));
};

const toggleDiaActivo = (idx: number) => {
  if (diasSemana.value[idx].tipo === 'descanso') return;
  diasSemana.value[idx].activo = !diasSemana.value[idx].activo;
};

const toggleDescanso = (idx: number) => {
  if (diasSemana.value[idx].tipo === 'descanso') {
    diasSemana.value[idx].tipo = 'laboral';
    diasSemana.value[idx].activo = false;
  } else {
    diasSemana.value[idx].tipo = 'descanso';
    diasSemana.value[idx].activo = false;
    diasSemana.value[idx].hora_entrada = '';
    diasSemana.value[idx].hora_salida = '';
  }
};

const toggleBulkDay = (idx: number) => {
  const i = bulkSelectedDays.value.indexOf(idx);
  if (i === -1) bulkSelectedDays.value.push(idx);
  else bulkSelectedDays.value.splice(i, 1);
};

const applyBulkSchedule = () => {
  for (const idx of bulkSelectedDays.value) {
    diasSemana.value[idx].tipo = 'laboral';
    diasSemana.value[idx].activo = true;
    diasSemana.value[idx].hora_entrada = bulkHoraEntrada.value;
    diasSemana.value[idx].hora_salida = bulkHoraSalida.value;
  }
  bulkSelectedDays.value = [];
};

// ── Helpers de estado ─────────────────────────────────────
const estadoBadgeClass = (estado: string) => ({
  // Pendiente — azul
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400':      estado === 'pendiente',
  // Puntual — verde
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': estado === 'puntual',
  // Retardo — amarillo
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400':  estado === 'retardo',
  // Retardo grave — negro/gris oscuro
  'bg-gray-900 text-white dark:bg-gray-950 dark:text-gray-200':            estado === 'retardo_grave',
  // Falta — rojo
  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':          estado === 'falta',
});

const estadoLabel = (estado: string) => ({
  pendiente:     'Pendiente',
  puntual:       'Puntual',
  retardo:       'Retardo',
  retardo_grave: 'Ret. Grave',
  falta:         'Falta',
}[estado] ?? estado);

// ── Computed table filters ────────────────────────────────
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

// ── Modal actions ─────────────────────────────────────────
const agregarNuevo = () => {
  formData.value = { usuario_id: '', rol: '', semanaInicio: getTodayString() };
  resetDias();
  bulkSelectedDays.value = [];
  bulkHoraEntrada.value = '';
  bulkHoraSalida.value = '';
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };


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

// ── Guardar ───────────────────────────────────────────────
const guardarNuevo = async () => {
  if (!formData.value.usuario_id) {
    alert('Por favor selecciona un usuario');
    return;
  }
  if (!formData.value.semanaInicio) {
    alert('Por favor selecciona la semana de referencia');
    return;
  }

  const laborales = diasSemana.value
    .map((d, idx) => ({ ...d, idx }))
    .filter(d => d.activo && d.tipo === 'laboral');

  if (laborales.length === 0 && !diasSemana.value.some(d => d.tipo === 'descanso')) {
    alert('Configura al menos un día laboral o de descanso');
    return;
  }

  // Validar que días laborales tengan horario
  for (const d of laborales) {
    if (!d.hora_entrada || !d.hora_salida) {
      alert(`El día ${DIAS_SEMANA[d.idx].name} no tiene horario completo`);
      return;
    }
  }

  saving.value = true;

  // 1. Guardar horario semanal en horarios_semanales
  const diasPayload = diasSemana.value
    .map((d, idx) => ({
      dia_semana: idx,
      tipo: d.tipo,
      hora_entrada: d.activo && d.tipo === 'laboral' ? d.hora_entrada : null,
      hora_salida:  d.activo && d.tipo === 'laboral' ? d.hora_salida  : null,
    }))
    .filter(d => d.tipo === 'descanso' || (diasSemana.value[d.dia_semana].activo && d.hora_entrada));

  await saveHorarioSemanal(Number(formData.value.usuario_id), diasPayload);

  // 2. Crear registros en nomina por cada día laboral de la semana seleccionada
  const nominaRegistros = laborales.map(d => ({
    usuario_id: Number(formData.value.usuario_id),
    rol: formData.value.rol || 'N/A',
    hora_entrada: d.hora_entrada,
    hora_salida: d.hora_salida,
    fecha: getDiaFecha(d.idx),
  }));

  if (nominaRegistros.length > 0) {
    const res = await createNomina(nominaRegistros);
    if (!res.success) {
      alert(res.error);
      saving.value = false;
      return;
    }
  }

  saving.value = false;
  closeModal();
  fetchNominas(currentDateString.value);
};
</script>

<style>
.flatpickr-calendar {
  z-index: 9999999 !important;
}
</style>

<style scoped>
@import 'flatpickr/dist/flatpickr.css';

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

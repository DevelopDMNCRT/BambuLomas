<template>
  <AdminLayout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">
      
      <!-- Page header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white/90">Mesas</h1>
        
        <!-- Vista "Leyenda" de las mesas -->
        <div class="flex items-center gap-4 text-sm font-medium">
          <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span class="w-3 h-3 rounded-full bg-emerald-500"></span> Libre
          </div>
          <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span class="w-3 h-3 rounded-full bg-red-500"></span> Ocupada
          </div>
        </div>
      </div>

      <!-- Tablero o Piso de mesas -->
      <div class="p-6 sm:p-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden min-h-[500px]">
        <!-- Patrón de fondo opcional (para dar feeling de "plano arquitectónico") -->
        <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"></div>

        <!-- Grid de Mesas -->
        <div class="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10 w-full place-items-center">
          
          <button
            v-for="mesa in mesas"
            :key="mesa.id"
            @click="onClickMesa(mesa)"
            class="group relative flex flex-col items-center justify-center transition-transform hover:-translate-y-1 active:scale-95"
          >
            <!-- Forma de la Mesa -->
            <div 
              class="w-24 h-24 sm:w-28 sm:h-28 rounded-full md:rounded-3xl flex flex-col items-center justify-center shadow-lg border-4 transition-colors relative"
              :class="[
                mesa.estado === 'libre' ? 'bg-white border-emerald-500 shadow-emerald-500/10 dark:bg-gray-900' : 'bg-red-50 border-red-500 shadow-red-500/20 dark:bg-red-500/10'
              ]"
            >
              <!-- Sillas (Representación visual) -->
              <div class="absolute -top-3 w-8 h-2 rounded-full opacity-60 bg-gray-300 dark:bg-gray-600 transition-colors group-hover:bg-brand-400"></div>
              <div class="absolute -bottom-3 w-8 h-2 rounded-full opacity-60 bg-gray-300 dark:bg-gray-600 transition-colors group-hover:bg-brand-400"></div>
              <div class="absolute -left-3 w-2 h-8 rounded-full opacity-60 bg-gray-300 dark:bg-gray-600 transition-colors group-hover:bg-brand-400"></div>
              <div class="absolute -right-3 w-2 h-8 rounded-full opacity-60 bg-gray-300 dark:bg-gray-600 transition-colors group-hover:bg-brand-400"></div>

              <!-- Número o Título -->
              <span class="text-2xl font-black tabular-nums tracking-tighter" :class="mesa.estado === 'libre' ? 'text-gray-700 dark:text-gray-200' : 'text-red-600 dark:text-red-400'">
                {{ mesa.id }}
              </span>
              
              <!-- Detalles Adicionales -->
              <span class="text-[10px] uppercase tracking-widest font-semibold mt-1" :class="mesa.estado === 'libre' ? 'text-emerald-500' : 'text-red-600 dark:text-red-400'">
                {{ mesa.estado }}
              </span>
              <!-- Pequeño icono simulando comensales si esta ocupada  -->
              <div v-if="mesa.estado === 'ocupada'" class="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border-2 border-white dark:border-gray-800 shadow-sm animate-pulse">
                {{ mesa.orden?.length || '!' }}
              </div>

            </div>
            
            <span class="mt-5 text-sm font-semibold text-gray-700 dark:text-gray-300">Mesa {{ mesa.id }}</span>
          </button>

        </div>
      </div>
      
    </div>

  </AdminLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useMesas } from '@/composables/useMesas'

const { mesas, ocuparMesa } = useMesas()
const router = useRouter()

const onClickMesa = (mesa: any) => {
  // Si está libre, la marcamos ocupada (limpia orden)
  // Si ya está ocupada, entramos al POS directamente sin tocar la orden guardada
  if (mesa.estado === 'libre') {
    ocuparMesa(mesa.id) // only resets if libre
  }
  // Redirigir al POS pasando el número de mesa
  router.push({ path: '/pos', query: { mesa: mesa.id } })
}
</script>

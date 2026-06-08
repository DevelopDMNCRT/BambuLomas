<template>
  <AdminLayout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Pedidos Ludoteca</h1>
        </div>
        
        <div class="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-sm">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span class="font-bold text-gray-600 dark:text-gray-300">Sincronizado</span>
        </div>
      </div>

      <!-- Main Content Area -->
      <div v-if="loading && ordenesLudoteca.length === 0" class="text-center py-10 text-gray-500">
        Cargando pedidos...
      </div>
      
      <div v-else-if="ordenesLudoteca.length === 0" class="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center flex flex-col items-center text-gray-400">
        <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
          <svg class="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <span class="font-bold text-lg text-gray-600 dark:text-gray-300">No hay pedidos para la Ludoteca</span>
        <p class="text-sm mt-1">Los nuevos pedidos se mostrarán aquí automáticamente.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- Tarjetas de Pedidos -->
        <div 
          v-for="orden in ordenesLudoteca" 
          :key="orden.id"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[20px] p-6 shadow-sm flex flex-col space-y-4 transition-all hover:shadow-md"
        >
          <!-- Encabezado de Tarjeta (Nombre y Estado) -->
          <div class="flex justify-between items-start gap-2">
            <div>
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">1. Nombre</span>
              <h3 class="text-xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">{{ orden.clienteNombre }}</h3>
              <p class="text-xs text-gray-400 mt-1">Orden {{ orden.numeroPedido }}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0" 
              :class="{
                'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400': orden.estado === 'Nuevo',
                'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400': orden.estado === 'En preparación',
                'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400': orden.estado === 'En entrega',
              }">
              {{ orden.estado }}
            </span>
          </div>

          <div class="divide-y divide-gray-100 dark:divide-gray-700/50 flex-1 border-t border-gray-100 dark:border-gray-700 pt-2">
            
            <!-- Platillos -->
            <div class="py-3 flex flex-col">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">2. Platillo Solicitado</span>
              <span class="text-[15px] font-bold text-[#2D5A5A] dark:text-[#6ca8a1] mt-1 leading-snug">
                {{ obtenerPlatillos(orden) }}
              </span>
            </div>

            <!-- Notas Nivel Platillo -->
            <div class="py-3 flex flex-col">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">3. Notas Nivel Platillo</span>
              <ul v-if="tieneNotasPlatillo(orden)" class="mt-1.5 space-y-2">
                <li v-for="(nota, idx) in obtenerNotasPlatillo(orden)" :key="idx" class="text-sm text-gray-600 dark:text-gray-300 flex flex-col">
                  <span class="font-bold text-gray-800 dark:text-gray-200 text-xs">{{ nota.producto }}</span> 
                  <span class="bg-gray-50 dark:bg-gray-900/40 rounded px-2 py-1 mt-1 text-xs border border-gray-100 dark:border-gray-700">{{ nota.detalle }}</span>
                </li>
              </ul>
              <span v-else class="text-xs text-gray-400 italic mt-1">Sin notas</span>
            </div>

            <!-- Notas Nivel Orden -->
            <div class="py-3 flex flex-col">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">4. Notas Nivel Orden</span>
              <span class="text-sm text-gray-700 dark:text-gray-300 mt-1 font-medium bg-amber-50/50 dark:bg-amber-900/10 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/30 min-h-[40px]">
                {{ orden.notasPedido || 'Sin notas generales' }}
              </span>
            </div>

            <!-- Hora de Entrega -->
            <div class="py-3 flex flex-col">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">5. Hora de Entrega</span>
              <span class="text-lg font-black text-gray-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ orden.horaEntrega || 'Lo antes posible' }}
              </span>
            </div>

          </div>

          <!-- Botón Rápido -->
          <div class="pt-2">
            <button
              v-if="orden.estado === 'Nuevo'"
              @click="cambiarEstadoOrden(orden, 'En preparación')"
              class="w-full py-3 bg-[#4F817D] hover:bg-[#2D5A5A] text-white font-bold rounded-xl shadow transition-colors text-sm"
            >
              Iniciar Preparación
            </button>
            <button
              v-else-if="orden.estado === 'En preparación'"
              @click="cambiarEstadoOrden(orden, 'En entrega')"
              class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow transition-colors text-sm"
            >
              Marcar Listo para Llevar
            </button>
            <button
              v-else-if="orden.estado === 'En entrega'"
              @click="cambiarEstadoOrden(orden, 'Completada')"
              class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Completar Entrega
            </button>
          </div>

        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useOrdenes, type Orden } from '@/composables/useOrdenes'

const { ordenes, loading, startPolling, stopPolling, actualizarEstado } = useOrdenes()

// Filtrar las órdenes donde clienteDireccion incluye "Ludoteca"
const ordenesLudoteca = computed(() => {
  return ordenes.value.filter(o => {
    return o.clienteDireccion && o.clienteDireccion.toLowerCase().includes('ludoteca')
  })
})

const cambiarEstadoOrden = async (orden: Orden, nuevoEstado: any) => {
  await actualizarEstado(orden.id, nuevoEstado)
}

// Helper: Extraer los platillos en una cadena separada por comas
const obtenerPlatillos = (orden: Orden) => {
  if (!orden.productos || orden.productos.length === 0) return 'Sin platillos'
  return orden.productos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ')
}

// Helper: Determinar si la orden tiene alguna variante/nota a nivel de producto
const tieneNotasPlatillo = (orden: Orden) => {
  return orden.productos.some(p => p.variantsLabel || p.selectedVariants)
}

// Helper: Obtener un arreglo con las notas de cada platillo
const obtenerNotasPlatillo = (orden: Orden) => {
  const notas: { producto: string, detalle: string }[] = []
  
  orden.productos.forEach(p => {
    let detalle = ''
    if (p.variantsLabel) {
      detalle = p.variantsLabel
    } else if (p.selectedVariants) {
      const parts: string[] = []
      for (const [, vals] of Object.entries(p.selectedVariants)) {
        const valArr = vals as string[]
        if (valArr.length > 0) parts.push(valArr.join(', '))
      }
      detalle = parts.join(' · ')
    }

    if (detalle) {
      notas.push({
        producto: p.nombre,
        detalle
      })
    }
  })

  return notas
}

onMounted(() => {
  startPolling(4000) // Poll cada 4 segundos
})

onUnmounted(() => {
  stopPolling()
})
</script>

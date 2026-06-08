<template>
  <AdminLayout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Clientes</h1>
        </div>
      </div>

      <!-- Controls Row: Toggle Switcher & Search Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <!-- Switcher Segmented Control -->
        <div class="bg-gray-100 dark:bg-gray-900 p-1 rounded-xl flex border border-gray-200/50 dark:border-gray-800 shadow-inner max-w-sm shrink-0">
          <button
            @click="filtroCuenta = 'todas'"
            :class="['px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all',
              filtroCuenta === 'todas' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']"
          >
            Todas las cuentas
          </button>
          <button
            @click="filtroCuenta = 'cerradas'"
            :class="['px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all',
              filtroCuenta === 'cerradas' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']"
          >
            Cuentas cerradas
          </button>
        </div>

        <!-- Search Bar (Top-Right) -->
        <div class="relative w-full md:max-w-xs shrink-0">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </span>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-[#2D5A5A] dark:focus:border-[#2D5A5A] shadow-sm transition-colors"
          />
        </div>
      </div>

      <!-- Customers Table Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div class="overflow-x-auto min-w-full">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-900/50 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th class="px-6 py-4">Nombre</th>
                <th class="px-6 py-4">Teléfono</th>
                <th class="px-6 py-4">Cuenta</th>
                <th class="px-6 py-4 text-center">Pedidos</th>
                <th class="px-6 py-4">Platillo Favorito</th>
                <th class="px-6 py-4">Último Pedido</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/80">
              <!-- Empty state -->
              <tr v-if="clientesFiltrados.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-400 dark:text-gray-500 font-semibold bg-white dark:bg-gray-800">
                  <div class="flex flex-col items-center justify-center space-y-2">
                    <svg class="w-8 h-8 text-gray-350 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
                    </svg>
                    <span>No se encontraron clientes que coincidan con la búsqueda</span>
                  </div>
                </td>
              </tr>

              <!-- Client Rows -->
              <tr 
                v-for="cliente in clientesFiltrados" 
                :key="cliente.id"
                class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
              >
                <!-- Nombre -->
                <td class="px-6 py-4.5 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-brand-50 dark:bg-[#2D5A5A]/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-black text-sm shrink-0">
                      {{ obtenerIniciales(cliente.nombre) }}
                    </div>
                    <span class="font-bold text-gray-900 dark:text-white text-sm">
                      {{ cliente.nombre }}
                    </span>
                  </div>
                </td>

                <!-- Teléfono -->
                <td class="px-6 py-4.5 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.14-4.117-6.942-6.942l1.293-.97c.362-.272.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                    <a :href="'tel:' + cliente.telefono" class="font-bold text-[#2D5A5A] dark:text-[#6ca8a1] hover:underline text-sm">
                      {{ cliente.telefono }}
                    </a>
                  </div>
                </td>

                <!-- Cuenta -->
                <td class="px-6 py-4.5 whitespace-nowrap">
                  <span 
                    :class="['px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 border',
                      cliente.cuenta.estado === 'Abierta' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-650'
                    ]"
                  >
                    <span 
                      :class="['w-1.5 h-1.5 rounded-full',
                        cliente.cuenta.estado === 'Abierta' ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-500'
                      ]"
                    ></span>
                    {{ cliente.cuenta.estado }}
                  </span>
                </td>

                <!-- Pedidos -->
                <td class="px-6 py-4.5 whitespace-nowrap text-center text-sm font-extrabold text-gray-800 dark:text-gray-200 tabular-nums">
                  {{ cliente.pedidos }}
                </td>

                <!-- Platillo Favorito -->
                <td class="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {{ cliente.platilloFavorito }}
                </td>

                <!-- Último Pedido -->
                <td class="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                  {{ cliente.ultimoPedido }}
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
import { ref, computed } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

interface CuentaCliente {
  estado: 'Abierta' | 'Cerrada'
  monto?: number
}

interface Cliente {
  id: number
  nombre: string
  telefono: string
  cuenta: CuentaCliente
  pedidos: number
  platilloFavorito: string
  ultimoPedido: string
}

const filtroCuenta = ref<'todas' | 'cerradas'>('todas')
const busqueda = ref('')

// Hardcodeo de ejemplos realistas basados en tu sistema
const clientesMock = ref<Cliente[]>([
  {
    id: 1,
    nombre: 'Mario',
    telefono: '5510108014',
    cuenta: { estado: 'Abierta', monto: 556.00 },
    pedidos: 15,
    platilloFavorito: 'Molletes Gourmet',
    ultimoPedido: '28/05/2026 09:00'
  },
  {
    id: 2,
    nombre: 'Elmer Cervantes',
    telefono: '3312345678',
    cuenta: { estado: 'Cerrada' },
    pedidos: 8,
    platilloFavorito: 'Tacos',
    ultimoPedido: '27/05/2026 18:30'
  },
  {
    id: 3,
    nombre: 'Ricardo',
    telefono: '5587654321',
    cuenta: { estado: 'Abierta', monto: 320.00 },
    pedidos: 24,
    platilloFavorito: 'Molletes Gourmet',
    ultimoPedido: '28/05/2026 08:15'
  },
  {
    id: 4,
    nombre: 'Ana Gómez',
    telefono: '5543210987',
    cuenta: { estado: 'Cerrada' },
    pedidos: 5,
    platilloFavorito: 'Coca',
    ultimoPedido: '25/05/2026 14:20'
  },
  {
    id: 5,
    nombre: 'Sofia Ruiz',
    telefono: '3398765432',
    cuenta: { estado: 'Cerrada' },
    pedidos: 12,
    platilloFavorito: 'Molletes Gourmet',
    ultimoPedido: '21/05/2026 11:45'
  },
  {
    id: 6,
    nombre: 'Carlos Mendoza',
    telefono: '5598761234',
    cuenta: { estado: 'Abierta', monto: 185.50 },
    pedidos: 30,
    platilloFavorito: 'Tacos',
    ultimoPedido: '28/05/2026 09:12'
  },
  {
    id: 7,
    nombre: 'Gabriela Torres',
    telefono: '3387654321',
    cuenta: { estado: 'Cerrada' },
    pedidos: 2,
    platilloFavorito: 'Latte',
    ultimoPedido: '14/05/2026 16:30'
  }
])

// Helper para extraer iniciales de perfil
const obtenerIniciales = (nombre: string): string => {
  if (!nombre) return ''
  const partes = nombre.trim().split(/\s+/)
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase()
  }
  return partes[0].slice(0, 2).toUpperCase()
}

// Filtrar clientes basados en switch y búsqueda
const clientesFiltrados = computed(() => {
  return clientesMock.value.filter(cliente => {
    // 1. Filtrar por tipo de cuenta
    if (filtroCuenta.value === 'cerradas' && cliente.cuenta.estado !== 'Cerrada') {
      return false
    }
    
    // 2. Filtrar por búsqueda (nombre o teléfono)
    if (busqueda.value.trim() !== '') {
      const q = busqueda.value.toLowerCase().trim()
      const matchesNombre = cliente.nombre.toLowerCase().includes(q)
      const matchesTelefono = cliente.telefono.includes(q)
      return matchesNombre || matchesTelefono
    }
    
    return true
  })
})
</script>

<style scoped>
</style>

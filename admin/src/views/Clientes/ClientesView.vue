<template>
  <AdminLayout>
    <div class="p-6">
      
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Clientes</h1>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <!-- Search -->
          <div class="relative w-full sm:w-64">
            <input 
              v-model="busqueda" 
              type="text" 
              placeholder="Buscar por nombre o teléfono..." 
              class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Filters -->
          <div class="bg-slate-100 dark:bg-gray-800 p-1 rounded-xl inline-flex items-center">
            <button 
              @click="filtroCuenta = 'todas'" 
              :class="filtroCuenta === 'todas' ? 'bg-white dark:bg-gray-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'"
              class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 select-none"
            >
              Todas las cuentas
            </button>
            <button 
              @click="filtroCuenta = 'cerradas'" 
              :class="filtroCuenta === 'cerradas' ? 'bg-white dark:bg-gray-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'"
              class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 select-none"
            >
              Cuentas cerradas
            </button>
          </div>
        </div>
      </div>

      <!-- Customers Table Card -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Teléfono</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Cuenta</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Pedidos</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Platillo Favorito</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Último Pedido</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="clientesFiltrados.length === 0">
                <td colspan="6" class="px-5 py-10 text-center text-gray-400 dark:text-gray-500">
                  No se encontraron clientes que coincidan con la búsqueda.
                </td>
              </tr>
              <tr 
                v-for="cliente in clientesFiltrados" 
                :key="cliente.id"
                class="border-t border-gray-100 dark:border-gray-800"
              >
                <td class="px-5 py-4">
                  <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ cliente.nombre }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.telefono }}</p>
                </td>
                <td class="px-5 py-4">
                  <span 
                    :class="['px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border',
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
                <td class="px-5 py-4 text-center">
                  <p class="text-gray-800 font-semibold text-theme-sm dark:text-white/90">{{ cliente.pedidos }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.platilloFavorito }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.ultimoPedido }}</p>
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

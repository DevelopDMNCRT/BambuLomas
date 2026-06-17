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
                @click="abrirModalOrdenes(cliente)"
                class="border-t border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
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

    <!-- Modal de Órdenes del Cliente -->
    <Modal 
      v-if="isModalOpen" 
      :fullScreenBackdrop="true" 
      @close="cerrarModal"
    >
      <template #body>
        <div class="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all border border-gray-100 dark:border-gray-800 p-6 m-4 max-h-[90vh] flex flex-col">
          
          <!-- Header -->
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                Órdenes de {{ selectedCliente?.nombre }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Historial de pedidos recientes
              </p>
            </div>
            <button 
              @click="cerrarModal"
              class="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body / Table -->
          <div class="overflow-y-auto custom-scrollbar flex-1">
            <div class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <table class="min-w-full">
                <thead class="bg-gray-50 dark:bg-gray-800/50">
                  <tr class="border-b border-gray-200 dark:border-gray-800">
                    <th class="px-5 py-3 text-left">
                      <p class="font-semibold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">ID Orden</p>
                    </th>
                    <th class="px-5 py-3 text-left">
                      <p class="font-semibold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Fecha</p>
                    </th>
                    <th class="px-5 py-3 text-left">
                      <p class="font-semibold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Productos</p>
                    </th>
                    <th class="px-5 py-3 text-right">
                      <p class="font-semibold text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">Total</p>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-transparent">
                  <tr v-for="orden in ordenesCliente" :key="orden.id" class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td class="px-5 py-4 whitespace-nowrap">
                      <span class="font-medium text-brand-600 dark:text-brand-400 text-sm">{{ orden.id }}</span>
                    </td>
                    <td class="px-5 py-4 whitespace-nowrap">
                      <p class="text-sm text-gray-600 dark:text-gray-300">{{ orden.fecha }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <p class="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{{ orden.productos }}</p>
                    </td>
                    <td class="px-5 py-4 whitespace-nowrap text-right">
                      <p class="text-sm font-bold text-gray-900 dark:text-white">${{ orden.total.toFixed(2) }}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0">
            <button 
              @click="cerrarModal"
              class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white rounded-xl font-medium transition-colors text-sm"
            >
              Cerrar
            </button>
          </div>

        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'

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

interface Orden {
  id: string
  fecha: string
  productos: string
  total: number
}

const isModalOpen = ref(false)
const selectedCliente = ref<Cliente | null>(null)
const ordenesCliente = ref<Orden[]>([])

const filtroCuenta = ref<'todas' | 'cerradas'>('todas')
const busqueda = ref('')

const clientes = ref<Cliente[]>([])
const loadingClientes = ref(false)

const fetchClientes = async () => {
  loadingClientes.value = true
  try {
    const response = await fetch('http://localhost:3000/api/clientes')
    if (!response.ok) throw new Error('Error fetching clientes')
    clientes.value = await response.json()
  } catch (error) {
    console.error('Error fetching clientes:', error)
  } finally {
    loadingClientes.value = false
  }
}

onMounted(() => {
  fetchClientes()
})

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
  return clientes.value.filter(cliente => {
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

const loadingOrdenes = ref(false)

const abrirModalOrdenes = async (cliente: Cliente) => {
  selectedCliente.value = cliente
  isModalOpen.value = true
  loadingOrdenes.value = true
  ordenesCliente.value = [] // Clear previous orders
  
  try {
    const response = await fetch(`http://localhost:3000/api/clientes/ordenes?telefono=${encodeURIComponent(cliente.telefono)}&nombre=${encodeURIComponent(cliente.nombre)}`)
    if (!response.ok) throw new Error('Error fetching ordenes')
    ordenesCliente.value = await response.json()
  } catch (error) {
    console.error('Error fetching ordenes:', error)
  } finally {
    loadingOrdenes.value = false
  }
}

const cerrarModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    selectedCliente.value = null
    ordenesCliente.value = []
  }, 300)
}
</script>

<style scoped>
</style>

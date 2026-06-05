import { ref, onUnmounted } from 'vue'

export interface ProductoOrden {
  id: string | number
  nombre: string
  cantidad: number
  precio: number
  imagenUrl?: string
  selectedVariants?: any
  variantsLabel?: string
}

export interface Orden {
  id: number
  numeroPedido: string
  clienteNombre: string
  clienteTelefono: string
  clienteEmail: string
  clienteDireccion: string
  clienteReferencias: string
  pagoMetodo: string
  tipoEntrega: string
  total: number
  costoEnvio: number
  horaEntrega?: string
  notasPedido?: string
  estado: 'Nuevo' | 'En preparación' | 'En entrega' | 'Completada' | 'Cancelada'
  productos: ProductoOrden[]
  horaCreada: string
  createdAt: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const ordenes = ref<Orden[]>([])
const loading = ref(false)
let pollIntervalId: any = null

export function useOrdenes() {
  const fetchOrdenes = async () => {
    loading.value = true
    try {
      const res = await fetch(`${API_URL}/api/ordenes`)
      if (res.ok) {
        const data = await res.json()
        ordenes.value = data
      } else {
        console.error('Error al obtener órdenes del servidor:', res.statusText)
      }
    } catch (e) {
      console.error('Error de red al obtener órdenes:', e)
    } finally {
      loading.value = false
    }
  }

  const actualizarEstado = async (id: number, nuevoEstado: 'Nuevo' | 'En preparación' | 'En entrega' | 'Completada' | 'Cancelada') => {
    try {
      const res = await fetch(`${API_URL}/api/ordenes/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      })
      if (res.ok) {
        // Actualizar localmente de inmediato para mejorar la fluidez
        if (nuevoEstado === 'Completada' || nuevoEstado === 'Cancelada') {
          // Remover del tablero activo
          ordenes.value = ordenes.value.filter(o => o.id !== id)
        } else {
          // Cambiar estado del elemento
          const o = ordenes.value.find(ord => ord.id === id)
          if (o) {
            o.estado = nuevoEstado
          }
        }
        return true
      } else {
        console.error('Error al actualizar estado en el servidor')
        return false
      }
    } catch (e) {
      console.error('Error de red al actualizar estado:', e)
      return false
    }
  }

  // Activa el auto-polling cada 5 segundos
  const startPolling = (ms: number = 5000) => {
    if (pollIntervalId) return
    fetchOrdenes() // Fetch inicial inmediato
    pollIntervalId = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/ordenes`)
        if (res.ok) {
          const data = await res.json()
          ordenes.value = data
        }
      } catch (e) {
        console.warn('Error en polling de órdenes:', e)
      }
    }, ms)
  }

  const stopPolling = () => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId)
      pollIntervalId = null
    }
  }

  return {
    ordenes,
    loading,
    fetchOrdenes,
    actualizarEstado,
    startPolling,
    stopPolling
  }
}

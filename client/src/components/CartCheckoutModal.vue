<template>
  <div v-if="isCartOpen" class="fixed inset-0 z-[100] flex justify-end">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="isCartOpen = false"></div>
    
    <!-- Modal Content -->
    <div class="relative w-full max-w-md bg-white dark:bg-gray-900 h-full flex flex-col shadow-2xl transition-transform transform translate-x-0">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Tu Pedido</h2>
        <button @click="isCartOpen = false" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <!-- Empty State -->
        <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p class="text-lg font-medium">Tu carrito está vacío</p>
          <p class="text-sm mt-1">¡Agrega algunos platillos deliciosos!</p>
          <button @click="isCartOpen = false" class="mt-6 px-6 py-2 bg-[#4F817D] text-white rounded-full font-bold">Ver Menú</button>
        </div>

        <!-- Cart Content -->
        <div v-else class="p-5 space-y-8">
          
          <!-- Items List -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Productos</h3>
            
            <div v-for="item in cartItems" :key="item.id" class="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div class="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-gray-700 shrink-0">
                <img v-if="item.imagenUrl" :src="item.imagenUrl" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
              
              <div class="flex-1 flex flex-col justify-center">
                <h4 class="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{{ item.nombre }}</h4>
                <p class="text-[#4F817D] font-black text-sm mt-0.5">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
              </div>
              
              <div class="flex items-center gap-2 bg-white dark:bg-gray-700 px-2 rounded-lg border border-gray-200 dark:border-gray-600">
                <button @click="updateQuantity(item.id, item.cantidad - 1)" class="p-1 text-gray-500 hover:text-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                </button>
                <span class="w-4 text-center text-sm font-bold dark:text-white">{{ item.cantidad }}</span>
                <button @click="updateQuantity(item.id, item.cantidad + 1)" class="p-1 text-gray-500 hover:text-[#4F817D] transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Delivery Form -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Envío a Domicilio</h3>
            <div class="space-y-3">
              <input v-model="form.nombre" type="text" placeholder="Nombre completo" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#4F817D] dark:focus:border-[#4F817D] text-gray-900 dark:text-white transition-colors" />
              <input v-model="form.telefono" type="tel" placeholder="Teléfono" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#4F817D] dark:focus:border-[#4F817D] text-gray-900 dark:text-white transition-colors" />
              <textarea v-model="form.direccion" rows="2" placeholder="Dirección completa" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#4F817D] dark:focus:border-[#4F817D] text-gray-900 dark:text-white transition-colors resize-none"></textarea>
              <textarea v-model="form.notas" rows="1" placeholder="Referencias o notas adicionales (Opcional)" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#4F817D] dark:focus:border-[#4F817D] text-gray-900 dark:text-white transition-colors resize-none"></textarea>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Forma de Pago</h3>
            <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="method in ['Efectivo', 'Tarjeta', 'Transferencia']" 
                :key="method"
                @click="form.pago = method"
                :class="[
                  'py-3 px-2 rounded-xl text-[13px] font-bold border transition-colors flex flex-col items-center gap-1',
                  form.pago === method ? 'bg-[#4F817D] text-white border-[#4F817D]' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#4F817D]'
                ]"
              >
                <!-- Icons -->
                <svg v-if="method === 'Efectivo'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <svg v-if="method === 'Tarjeta'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <svg v-if="method === 'Transferencia'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                
                {{ method }}
              </button>
            </div>
          </div>
          
        </div>
      </div>

      <!-- Footer / Total -->
      <div v-if="cartItems.length > 0" class="border-t border-gray-100 dark:border-gray-800 p-5 bg-white dark:bg-gray-900">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-500 dark:text-gray-400 font-medium">Total a Pagar</span>
          <span class="text-2xl font-black text-gray-900 dark:text-white">${{ cartTotal.toFixed(2) }}</span>
        </div>
        <button 
          @click="submitOrder"
          :disabled="!isFormValid"
          :class="[
            'w-full py-4 rounded-2xl font-black text-[16px] flex items-center justify-center gap-2 transition-all',
            isFormValid ? 'bg-[#2D5A5A] hover:bg-[#1f4242] text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          ]"
        >
          Confirmar Pedido
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { cartItems, isCartOpen, cartTotal, updateQuantity, clearCart } from '../store/cart'

const form = ref({
  nombre: '',
  telefono: '',
  direccion: '',
  notas: '',
  pago: 'Efectivo'
})

const isFormValid = computed(() => {
  return form.value.nombre.trim() !== '' && 
         form.value.telefono.trim() !== '' && 
         form.value.direccion.trim() !== '' &&
         cartItems.value.length > 0
})

const submitOrder = () => {
  if (!isFormValid.value) return
  
  // Here we would typically send to backend or open WhatsApp
  // For now, clear cart and show success
  alert(`¡Gracias por tu pedido, ${form.value.nombre}!\nTu total es: $${cartTotal.value.toFixed(2)} pagando con ${form.value.pago}.`)
  clearCart()
  isCartOpen.value = false
  
  // Reset form
  form.value = {
    nombre: '',
    telefono: '',
    direccion: '',
    notas: '',
    pago: 'Efectivo'
  }
}
</script>

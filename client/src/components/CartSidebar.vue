<template>
  <Teleport to="body">
    <Transition name="cart-backdrop">
      <div v-if="isCartOpen" class="fixed inset-0 z-[100] flex justify-end" aria-modal="true">
        <!-- Backdrop -->
        <div class="cart-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" @click="isCartOpen = false"></div>
        
        <!-- Drawer -->
        <Transition name="cart-drawer" appear>
          <div v-if="isCartOpen" class="cart-drawer relative w-full max-w-md bg-white dark:bg-gray-900 h-full flex flex-col shadow-2xl">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg class="w-6 h-6 text-[#4F817D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Tu Pedido
                </h2>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{{ cartCount }} {{ cartCount === 1 ? 'producto' : 'productos' }}</p>
              </div>
              <button @click="isCartOpen = false" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto overscroll-contain">
              <!-- Empty State -->
              <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center h-full p-8 text-center">
                <svg class="w-16 h-16 mb-4 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p class="text-lg font-bold text-gray-500 dark:text-gray-400">Tu carrito está vacío</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-6">¡Agrega algunos platillos deliciosos!</p>
                <button @click="isCartOpen = false" class="px-6 py-2.5 bg-[#4F817D] text-white rounded-full font-bold hover:bg-[#2D5A5A] transition-colors">
                  Ver Menú
                </button>
              </div>

              <!-- Cart Items -->
              <div v-else class="p-5 space-y-3">
                <div v-for="item in cartItems" :key="item.id" class="cart-item flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 items-center">
                  <!-- Image -->
                  <div class="w-[60px] h-[60px] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                    <img v-if="item.imagenUrl" :src="item.imagenUrl" loading="lazy" decoding="async" alt="" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-gray-900 dark:text-white text-sm truncate">{{ item.nombre }}</h4>
                    <p v-if="getVariantsLabel(item)" class="text-[12px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{{ getVariantsLabel(item) }}</p>
                    <p class="text-[#4F817D] font-black text-sm mt-1">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-1 shrink-0">
                    <button @click="updateQuantity(item.id, item.cantidad - 1)" class="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" /></svg>
                    </button>
                    <span class="w-5 text-center text-sm font-bold dark:text-white">{{ item.cantidad }}</span>
                    <button @click="updateQuantity(item.id, item.cantidad + 1)" class="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-[#4F817D] hover:text-[#4F817D] transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer (only when cart has items) -->
            <div v-if="cartItems.length > 0" class="border-t border-gray-100 dark:border-gray-800 p-5 bg-white dark:bg-gray-900">
              <div class="flex items-center justify-between mb-4">
                <span class="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span class="text-xl font-black text-gray-900 dark:text-white">${{ cartTotal.toFixed(2) }}</span>
              </div>
              <button @click="goToCheckout" class="w-full py-4 bg-[#4F817D] hover:bg-[#2D5A5A] text-white rounded-2xl font-black text-[16px] flex items-center justify-center gap-2 transition-colors shadow-lg">
                Continuar
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { cartItems, isCartOpen, cartTotal, cartCount, updateQuantity } from '../store/cart'

const router = useRouter()

const getVariantsLabel = (item: any): string => {
  if (!item.selectedVariants) return ''
  const parts: string[] = []
  for (const [, vals] of Object.entries(item.selectedVariants)) {
    const valArr = vals as string[]
    if (valArr.length > 0) parts.push(valArr.join(', '))
  }
  return parts.join(' · ')
}

const goToCheckout = () => {
  isCartOpen.value = false
  router.push('/checkout')
}
</script>

<style scoped>
/* Drawer slides in from the right — GPU composited (transform only) */
.cart-drawer {
  will-change: transform;
}
.cart-drawer-enter-active {
  transition: transform 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.cart-drawer-leave-active {
  transition: transform 180ms cubic-bezier(0.55, 0, 1, 0.45);
}
.cart-drawer-enter-from,
.cart-drawer-leave-to {
  transform: translateX(100%);
}
.cart-drawer-enter-to,
.cart-drawer-leave-from {
  transform: translateX(0);
}

/* Backdrop fades — GPU composited (opacity only) */
.cart-backdrop {
  will-change: opacity;
}
.cart-backdrop-enter-active {
  transition: opacity 200ms ease;
}
.cart-backdrop-leave-active {
  transition: opacity 160ms ease;
}
.cart-backdrop-enter-from,
.cart-backdrop-leave-to {
  opacity: 0;
}

/* Contain each cart item's paint scope */
.cart-item {
  contain: layout style paint;
}
</style>

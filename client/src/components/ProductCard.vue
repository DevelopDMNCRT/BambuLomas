<template>
  <div class="bg-white dark:bg-gray-800 rounded-[24px] p-3 flex gap-4 shadow-sm border border-gray-100 dark:border-gray-700 items-center transition-colors" style="contain: layout style paint;">
    <!-- Product Image -->
    <div class="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700">
      <img v-if="product.imagenUrl" :src="product.imagenUrl" loading="lazy" decoding="async" alt="" width="96" height="96" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
    
    <!-- Product Info -->
    <div class="flex-1 min-w-0 py-1">
      <h4 class="font-bold text-gray-900 dark:text-white text-[15px] leading-tight mb-1 truncate">{{ product.nombre }}</h4>
      <p class="text-gray-500 dark:text-gray-400 text-[13px] leading-snug line-clamp-2 mb-2">{{ product.descripcion || 'Sin descripción' }}</p>
      
      <div class="flex items-center justify-between mt-auto">
        <span class="font-black text-gray-900 dark:text-white text-[17px]">${{ Number(product.precioBase).toFixed(2) }}</span>
        
        <button @click="handleAdd" class="w-8 h-8 rounded-full bg-[#E8F3F1] dark:bg-[#40716b] text-[#4F817D] dark:text-[#E8F3F1] flex items-center justify-center hover:bg-[#4F817D] hover:text-white dark:hover:bg-[#4F817D] dark:hover:text-white transition-colors shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { selectedProductForModal } from '../store/cart'

const props = defineProps<{
  product: {
    id: number
    nombre: string
    descripcion: string
    precioBase: number
    imagenUrl: string
    categoria: string
    variables?: any[]
  }
}>()

const handleAdd = () => {
  selectedProductForModal.value = props.product
}
</script>

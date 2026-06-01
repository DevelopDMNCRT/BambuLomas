<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    <ProductCard 
      v-for="product in products" 
      :key="product.id" 
      :product="product" 
    />
    
    <div v-if="products.length === 0" class="text-center py-12 text-gray-500">
      No hay platillos en esta categoría.
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductCard from './ProductCard.vue'

defineProps<{
  products: any[]
}>()
</script>

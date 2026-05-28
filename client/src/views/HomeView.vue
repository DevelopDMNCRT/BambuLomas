<template>
  <div class="min-h-screen pb-24 mx-auto max-w-7xl bg-[#F8F9FA] md:bg-white md:shadow-sm dark:bg-gray-900 md:dark:bg-gray-900 transition-colors">
    <Header />
    <main class="px-5 md:px-10 lg:px-16 pt-4 md:pt-8 space-y-8">
      <HeroBanner :lowestPrice="lowestPrice" />
      <div>
        <h2 class="text-[28px] font-black tracking-tight text-gray-900 dark:text-white mb-5 transition-colors">Nuestro Menú</h2>
        <CategoryScroll :categories="categories" :activeCategory="activeCategory" @select="activeCategory = $event" />
      </div>
      <ProductList :products="filteredProducts" />
    </main>
    <FloatingWhatsApp />
    <CartSidebar />
    <ProductDetailModal />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Header from '../components/Header.vue'
import HeroBanner from '../components/HeroBanner.vue'
import CategoryScroll from '../components/CategoryScroll.vue'
import ProductList from '../components/ProductList.vue'
import FloatingWhatsApp from '../components/FloatingWhatsApp.vue'
import CartSidebar from '../components/CartSidebar.vue'
import ProductDetailModal from '../components/ProductDetailModal.vue'

interface Product {
  id: number
  nombre: string
  descripcion: string
  precioBase: number
  imagenUrl: string
  categoria: string
  variables?: any[]
}

const products = ref<Product[]>([])
const categories = ref<string[]>(['Todos'])
const activeCategory = ref('Todos')

onMounted(async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const res = await fetch(`${apiUrl}/api/platillos`)
    if (res.ok) {
      const data = await res.json()
      products.value = data
      const uniqueCats = Array.from(new Set(data.map((p: any) => p.categoria).filter(Boolean))) as string[]
      categories.value = ['Todos', ...uniqueCats]
    }
  } catch (err) {
    console.error('Error fetching platillos:', err)
  }
})

const filteredProducts = computed(() => {
  if (activeCategory.value === 'Todos') return products.value
  return products.value.filter(p => p.categoria === activeCategory.value)
})

const lowestPrice = computed(() => {
  if (products.value.length === 0) return 48
  const coffeeProducts = products.value.filter(p => {
    const cat = (p.categoria || '').toLowerCase()
    const name = (p.nombre || '').toLowerCase()
    return cat.includes('café') || cat.includes('cafe') || cat.includes('caliente') ||
           name.includes('café') || name.includes('cafe') || name.includes('latte') || 
           name.includes('espresso') || name.includes('americano') || name.includes('capuchino')
  })
  const targetProducts = coffeeProducts.length > 0 ? coffeeProducts : products.value
  return Math.min(...targetProducts.map(p => Number(p.precioBase)))
})
</script>

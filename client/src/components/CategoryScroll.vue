<template>
  <div class="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
    <button 
      v-for="cat in categories" :key="cat"
      @click="$emit('select', cat)"
      :class="[
        'whitespace-nowrap px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all shadow-sm border',
        activeCategory === cat 
          ? 'bg-[#4F817D] text-white border-[#4F817D] dark:bg-[#6ca8a1] dark:border-[#6ca8a1] dark:text-gray-900' 
          : 'bg-white text-gray-700 border-gray-200 hover:border-[#4F817D] hover:text-[#4F817D] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-[#6ca8a1] dark:hover:text-[#6ca8a1]'
      ]"
    >
      <span class="mr-1">{{ getCategoryIcon(cat) }}</span> {{ cat }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categories: string[]
  activeCategory: string
}>()
defineEmits<{
  (e: 'select', category: string): void
}>()

const getCategoryIcon = (cat: string) => {
  const c = cat.toLowerCase()
  if (c.includes('todos')) return '🍽️'
  if (c.includes('desayuno')) return '🍳'
  if (c.includes('alimento') || c.includes('comida') || c.includes('platillo')) return '🥘'
  if (c.includes('fría') || c.includes('fria') || c.includes('refresco')) return '🥤'
  if (c.includes('caliente') || c.includes('café') || c.includes('cafe')) return '☕'
  if (c.includes('postre') || c.includes('dulce') || c.includes('pan')) return '🍰'
  if (c.includes('ensalada')) return '🥗'
  if (c.includes('sopa')) return '🥣'
  if (c.includes('snack') || c.includes('botana')) return '🥨'
  return '✨'
}
</script>

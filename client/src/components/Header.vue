<template>
  <header class="flex items-center justify-between px-5 md:px-10 lg:px-16 py-4 bg-[#F8F9FA] md:bg-white dark:bg-gray-900 md:dark:bg-gray-800 transition-colors sticky top-0 z-50">
    <div class="flex items-center gap-2">
      <img src="/logo.png" alt="Bambú Lomas" class="h-10 md:h-12 w-auto" />
    </div>
    
    <div class="flex items-center gap-5 text-gray-800 dark:text-gray-200">
      <button @click="toggleDarkMode" class="hover:text-[#4F817D] transition-colors">
        <!-- Moon Icon -->
        <svg v-if="!isDark" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <!-- Sun Icon -->
        <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
      <button @click="isCartOpen = true" class="hover:text-[#4F817D] transition-colors relative">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span v-if="cartCount > 0" class="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {{ cartCount }}
        </span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { cartCount, isCartOpen } from '../store/cart'

const isDark = ref(false)

onMounted(() => {
  if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
</script>

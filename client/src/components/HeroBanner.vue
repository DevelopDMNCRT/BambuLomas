<template>
  <div class="relative bg-gradient-to-br from-[#6ca8a1] to-[#40716b] rounded-[24px] py-[25px] pl-5 md:pl-8 pr-[10px] overflow-hidden shadow-lg flex items-center gap-[10px] min-h-[180px] md:min-h-[260px]">
    <!-- Background pattern/swooshes could go here -->
    
    <div class="z-10 w-1/2 relative flex items-center justify-center h-full">
      <img src="/hero-coffee.png" alt="Coffee" class="w-full max-h-[200px] md:max-h-[300px] aspect-[4/5] object-cover drop-shadow-2xl rounded-[18px]" />
    </div>
    
    <div class="z-10 w-1/2 flex flex-col items-center text-center">
      <img src="/logo.png" alt="Bambú Lomas" class="h-8 md:h-12 w-auto mb-2 opacity-90 brightness-0 invert" />
      <h2 class="text-white leading-tight mb-3 md:mb-5 drop-shadow-md">
        <span class="font-normal text-[16px] md:text-[26px] lg:text-[34px]" style="font-family: 'Georgia', serif; font-style: italic;">CAFÉ QUE SE DISFRUTA</span><br/>
        <span class="font-bold text-[15px] md:text-[24px] lg:text-[32px]">EN CADA SORBO</span>
      </h2>
      <p class="text-black text-[13px] md:text-[16px] uppercase font-black tracking-wider mb-1">Desde</p>
      <p class="text-white font-normal text-4xl md:text-6xl lg:text-7xl mb-3 md:mb-6 drop-shadow-lg tracking-wide" style="font-family: 'Lilita One', cursive;">${{ lowestPrice.toFixed(2) }}</p>
      
      <button class="bg-[#2D5A5A]/80 backdrop-blur-md text-white text-[11px] md:text-[14px] font-bold px-4 md:px-8 py-2 md:py-3 rounded-full border border-white/20 shadow-sm hover:bg-[#2D5A5A] transition-colors">
        Comprar ahora
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  lowestPrice: {
    type: Number,
    default: 48.00
  }
})
</script>

<style scoped>
.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1) translateY(0); }
  50% { opacity: 0.95; transform: scale(1.02) translateY(-2px); }
}
</style>

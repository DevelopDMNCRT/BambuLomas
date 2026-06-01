<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="product" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="modal-backdrop absolute inset-0 bg-black/60" @click="closeModal"></div>
        
        <!-- Modal Content -->
        <Transition name="modal-scale" appear>
    
          <div class="modal-content relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
      
      <!-- Close Button -->
      <button @click="closeModal" class="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-full flex items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

          <!-- Image Section -->
          <div class="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 dark:bg-gray-800 shrink-0 relative">
            <img v-if="product.imagenUrl" :src="product.imagenUrl" loading="eager" decoding="async" fetchpriority="high" alt="" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
          <svg class="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
      </div>

      <!-- Details Section -->
      <div class="w-full md:w-1/2 flex flex-col h-full max-h-full overflow-hidden">
        <!-- Scrollable info -->
        <div class="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
          <div>
            <h2 class="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">{{ product.nombre }}</h2>
            <p class="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">{{ product.descripcion }}</p>
            <p class="text-2xl font-black text-gray-900 dark:text-white mt-4">${{ Number(product.precioBase).toFixed(2) }}</p>
          </div>

          <!-- Variables List -->
          <div v-if="parsedVariables.length > 0" class="space-y-6 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div v-for="(v, index) in parsedVariables" :key="index" class="space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-gray-900 dark:text-white">{{ v.nombre }}</h3>
                <span v-if="v.obligatorio" class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Requerido</span>
                <span v-else class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Opcional</span>
              </div>
              
              <div class="space-y-2">
                <div v-for="(opcion, opIndex) in v.opciones" :key="opIndex" 
                     @click="toggleSelection(v, opcion.nombre)"
                     class="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors select-none"
                     :class="isSelected(v.nombre, opcion.nombre) ? 'border-[#4F817D] bg-[#E8F3F1] dark:bg-[#2D5A5A]/30 dark:border-[#4F817D]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 flex items-center justify-center"
                         :class="[
                           v.multiple ? 'rounded-[4px] border' : 'rounded-full border',
                           isSelected(v.nombre, opcion.nombre) ? 'bg-[#4F817D] border-[#4F817D] text-white' : 'border-gray-300 dark:border-gray-600'
                         ]">
                      <svg v-if="isSelected(v.nombre, opcion.nombre)" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">{{ opcion.nombre }}</span>
                  </div>
                  <span v-if="Number(opcion.precioExtra) > 0" class="text-sm font-bold text-gray-500 dark:text-gray-400">+${{ Number(opcion.precioExtra).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Action -->
        <div class="p-6 md:p-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-4">
            <!-- Quantity -->
            <div class="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-2 shrink-0">
              <button @click="quantity > 1 && quantity--" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
              </button>
              <span class="w-6 text-center font-bold text-gray-900 dark:text-white">{{ quantity }}</span>
              <button @click="quantity++" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#4F817D] transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            
            <!-- Add Button -->
            <button 
              @click="handleAddToCart"
              :disabled="!isValidSelection"
              :class="[
                'flex-1 py-4 px-6 rounded-full font-black text-[15px] transition-all flex items-center justify-between',
                isValidSelection ? 'bg-[#8abcb6] hover:bg-[#4F817D] text-white shadow-md' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              ]"
            >
              <span>Add to Order</span>
              <span>${{ (totalPrice * quantity).toFixed(2) }}</span>
            </button>
          </div>
        </div>
      </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { selectedProductForModal, addToCart, isCartOpen } from '../store/cart'

const product = computed(() => selectedProductForModal.value)
const quantity = ref(1)

// Selected variants state: { "Salsa": ["Verdes"], "Extras": ["Queso", "Pollo"] }
const selections = ref<Record<string, string[]>>({})

// Parse variables safely
const parsedVariables = computed(() => {
  if (!product.value || !product.value.variables) return []
  try {
    const vars = typeof product.value.variables === 'string' 
      ? JSON.parse(product.value.variables) 
      : product.value.variables
    return Array.isArray(vars) ? vars : []
  } catch (e) {
    return []
  }
})

// Initialize selections when product changes
watch(product, (newVal) => {
  if (newVal) {
    quantity.value = 1
    selections.value = {}
    parsedVariables.value.forEach((v: any) => {
      selections.value[v.nombre] = []
    })
  }
}, { immediate: true })

const isSelected = (varName: string, opName: string) => {
  return selections.value[varName]?.includes(opName)
}

const toggleSelection = (varObj: any, opName: string) => {
  const varName = varObj.nombre
  if (!selections.value[varName]) {
    selections.value[varName] = []
  }
  
  if (varObj.multiple) {
    const idx = selections.value[varName].indexOf(opName)
    if (idx > -1) {
      selections.value[varName].splice(idx, 1)
    } else {
      selections.value[varName].push(opName)
    }
  } else {
    // Single selection
    if (selections.value[varName].includes(opName)) {
      // Allow unselect if not mandatory, or keep it
      if (!varObj.obligatorio) selections.value[varName] = []
    } else {
      selections.value[varName] = [opName]
    }
  }
}


const totalPrice = computed(() => {
  if (!product.value) return 0
  let base = Number(product.value.precioBase)
  
  parsedVariables.value.forEach((v: any) => {
    const selectedOps = selections.value[v.nombre] || []
    selectedOps.forEach(opName => {
      const opObj = v.opciones.find((o: any) => o.nombre === opName)
      if (opObj) {
        base += Number(opObj.precioExtra || 0)
      }
    })
  })
  
  return base
})

const isValidSelection = computed(() => {
  if (!product.value) return false
  
  for (const v of parsedVariables.value) {
    if (v.obligatorio) {
      const sel = selections.value[v.nombre] || []
      if (sel.length === 0) return false
    }
  }
  return true
})

const closeModal = () => {
  selectedProductForModal.value = null
}

const handleAddToCart = () => {
  if (!isValidSelection.value) return
  
  // Calculate extra price
  let extraPrice = 0
  parsedVariables.value.forEach((v: any) => {
    const selectedOps = selections.value[v.nombre] || []
    selectedOps.forEach(opName => {
      const opObj = v.opciones.find((o: any) => o.nombre === opName)
      if (opObj) {
        extraPrice += Number(opObj.precioExtra || 0)
      }
    })
  })
  
  // Add N times based on quantity
  for (let i = 0; i < quantity.value; i++) {
    addToCart(product.value, selections.value, extraPrice)
  }
  
  closeModal()
  isCartOpen.value = true // Open sidebar drawer
}
</script>

<style scoped>
/* Backdrop: fade only (GPU-composited opacity) */
.modal-backdrop {
  will-change: opacity;
}
.modal-fade-enter-active {
  transition: opacity 200ms ease;
}
.modal-fade-leave-active {
  transition: opacity 160ms ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Modal card: scale + opacity (GPU-composited, no layout change) */
.modal-content {
  will-change: transform, opacity;
}
.modal-scale-enter-active {
  transition: transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease;
}
.modal-scale-leave-active {
  transition: transform 160ms cubic-bezier(0.55, 0, 1, 0.45), opacity 140ms ease;
}
.modal-scale-enter-from,
.modal-scale-leave-to {
  transform: scale(0.94);
  opacity: 0;
}
.modal-scale-enter-to,
.modal-scale-leave-from {
  transform: scale(1);
  opacity: 1;
}
</style>

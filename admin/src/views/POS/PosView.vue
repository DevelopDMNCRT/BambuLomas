<template>
  <AdminLayout>
    <div class="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">

      <!-- ═══ LEFT: Order Panel ═══ -->
      <div class="w-full lg:w-[320px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm overflow-hidden shrink-0 order-2 lg:order-1">
        <!-- Header -->
        <div class="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <h2 class="text-base font-bold text-gray-800 dark:text-white">Cuenta Actual</h2>
            <p class="text-[11px] text-brand-600 font-medium">
              Orden #{{ currentOrderNum }}
              <span v-if="mesaActual" class="ml-2 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">Mesa {{ mesaActual }}</span>
              <span v-if="cxcClientName" class="ml-2 px-1.5 py-0.5 rounded bg-error-100 dark:bg-error-500/20 text-error-700 dark:text-error-400 font-bold">Liquidación de CXC: {{ cxcClientName }}</span>
            </p>
          </div>
          <button @click="clearCart" class="text-gray-400 hover:text-error-500 transition-colors" title="Limpiar orden">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          <div v-if="cart.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
            <svg class="h-12 w-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <p class="text-sm">No hay productos en la cuenta</p>
          </div>

          <div v-for="(item, index) in cart" :key="index" class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-2.5 rounded-xl shadow-sm">
            <div class="flex items-center gap-2">
              <div class="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                <img v-if="item.platillo.imagenUrl" :src="item.platillo.imagenUrl" loading="lazy" decoding="async" alt="" class="h-full w-full object-cover" />
                <div v-else class="h-full w-full flex items-center justify-center text-gray-300">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-[13px] text-gray-800 dark:text-white truncate">{{ item.platillo.nombre }}</h4>
                <p class="text-brand-600 text-[11px] font-bold">{{ formatCurrency(calcItemTotal(item)) }}</p>
              </div>
              <div class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg p-0.5 border border-gray-100 dark:border-gray-800">
                <button @click="updateQty(index, -1)" class="w-5 h-5 rounded text-[11px] bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300 flex items-center justify-center hover:text-brand-500">-</button>
                <span class="font-bold text-[11px] text-gray-800 dark:text-white w-3 text-center">{{ item.cantidad }}</span>
                <button @click="updateQty(index, 1)" class="w-5 h-5 rounded text-[11px] bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600">+</button>
              </div>
            </div>
            <!-- Selected variables -->
            <div v-if="item.variablesSeleccionadas && item.variablesSeleccionadas.length > 0" class="mt-1.5 pl-12 flex flex-wrap gap-1">
              <span v-for="(vs, vi) in item.variablesSeleccionadas" :key="vi"
                class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 text-[10px] font-medium text-brand-700 dark:text-brand-400 ring-1 ring-brand-200 dark:ring-brand-500/20">
                {{ vs.opcion }}
                <span v-if="vs.precioExtra > 0" class="text-brand-500">(+{{ formatCurrency(vs.precioExtra) }})</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Total and Pay -->
        <div class="p-3 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <div class="space-y-1 mb-3">
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Subtotal</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">IVA (16%)</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ formatCurrency(subtotal * 0.16) }}</span>
            </div>
            <div class="pt-1.5 mt-1.5 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span class="font-bold text-sm text-gray-800 dark:text-white">Total</span>
              <span class="text-xl font-black text-brand-600 dark:text-brand-400">{{ formatCurrency(subtotal * 1.16) }}</span>
            </div>
          </div>
          <button @click="openPaymentModal" class="w-full py-3 rounded-xl bg-[#2D5A5A] text-white font-bold text-sm hover:bg-[#244a4a] transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2" :disabled="cart.length === 0" :class="{ 'opacity-50 cursor-not-allowed': cart.length === 0 }">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Cobrar Orden
          </button>
        </div>
      </div>

      <!-- ═══ RIGHT: Products Panel ═══ -->
      <div class="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm overflow-hidden order-1 lg:order-2">
        <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Menú</h1>
            <button
              @click="showPrices = !showPrices"
              :class="showPrices ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'"
              class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all"
              title="Mostrar/Ocultar Precios"
            >
              $
            </button>
          </div>

          <!-- Category Tabs -->
          <div class="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              v-for="cat in categorias" :key="cat"
              @click="activeCategoria = cat"
              :class="activeCategoria === cat ? 'bg-gray-900 text-white dark:bg-brand-500 shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'"
              class="px-5 py-2 rounded-xl font-semibold text-sm transition-all whitespace-nowrap"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <div class="flex-1 p-5 overflow-y-auto custom-scrollbar">
          <div v-if="loading" class="flex justify-center p-10 text-gray-400">
             Cargando platillos...
          </div>
          <div v-else-if="platillos.length === 0" class="text-center text-gray-400 mt-10">
            No hay platillos registrados en la carta
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
            <div v-for="platillo in platillosFiltrados" :key="platillo.id"
                 @click="handleProductClick(platillo)"
                 class="cursor-pointer group flex flex-col">
               <div class="h-36 sm:h-40 w-full mb-3 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 relative shadow-sm group-hover:shadow-lg transition-all group-hover:-translate-y-1">
                  <img v-if="platillo.imagenUrl" :src="platillo.imagenUrl" loading="lazy" decoding="async" alt="" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div v-else class="flex h-full items-center justify-center text-gray-400">
                    <svg class="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <!-- Price badge -->
                  <div v-if="showPrices" class="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-white/10">
                    <span class="text-[13px] font-black text-white tracking-wide">{{ formatCurrency(platillo.precioBase) }}</span>
                  </div>
               </div>
               <h3 class="font-bold text-gray-800 dark:text-white/90 text-sm line-clamp-2 leading-tight px-1 group-hover:text-brand-600 transition-colors">{{ platillo.nombre }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showVariableModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4" @click.self="closeVariableModal">
        <div class="absolute inset-0 custom-modal-backdrop" @click="closeVariableModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in">

          <!-- Modal Header -->
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div v-if="selectedPlatillo?.imagenUrl" class="h-14 w-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
              <img :src="selectedPlatillo.imagenUrl" loading="eager" decoding="async" alt="" class="h-full w-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-gray-800 dark:text-white truncate">{{ selectedPlatillo?.nombre }}</h3>
              <p class="text-sm text-brand-600 font-semibold">{{ formatCurrency(selectedPlatillo?.precioBase || 0) }}</p>
            </div>
            <button @click="closeVariableModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Modal Body: Variables -->
          <div class="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            <div v-for="(variable, vIdx) in selectedPlatillo?.variables" :key="vIdx"
                 class="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4">
              <div class="flex items-center gap-2 mb-3">
                <h4 class="font-semibold text-sm text-gray-800 dark:text-white">{{ variable.nombre }}</h4>
                <span v-if="variable.obligatorio" class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 ring-1 ring-error-200 dark:ring-error-500/20">Requerido</span>
                <span v-if="variable.multiple" class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-500/20">Múltiple</span>
              </div>
              <div class="space-y-2">
                <button v-for="(opcion, oIdx) in variable.opciones" :key="oIdx"
                  @click="toggleOpcion(vIdx, oIdx)"
                  :class="isOpcionSelected(vIdx, oIdx)
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 ring-2 ring-brand-500/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'"
                  class="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left">
                  <div class="flex items-center gap-3">
                    <div :class="[
                      isOpcionSelected(vIdx, oIdx) ? 'bg-brand-500 border-brand-500' : 'border-gray-300 dark:border-gray-600',
                      variable.multiple ? 'rounded-md' : 'rounded-full'
                    ]"
                         class="w-5 h-5 border-2 flex items-center justify-center transition-colors shrink-0">
                      <svg v-if="isOpcionSelected(vIdx, oIdx)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ opcion.nombre }}</span>
                  </div>
                  <span v-if="opcion.precioExtra > 0" class="text-xs font-bold text-brand-600 dark:text-brand-400">+{{ formatCurrency(opcion.precioExtra) }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-500">Precio final:</span>
              <span class="text-lg font-black text-brand-600 dark:text-brand-400">{{ formatCurrency(modalPrecioFinal) }}</span>
            </div>
            <button @click="confirmAddToCart"
              :disabled="!canConfirmModal"
              :class="canConfirmModal ? 'bg-[#2D5A5A] hover:bg-[#244a4a] shadow-md hover:shadow-lg active:scale-[0.98]' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'"
              class="w-full py-3.5 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Agregar a la Orden
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ MODAL: Payment ═══ -->
    <Teleport to="body">
      <div v-if="showPaymentModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        <div class="absolute inset-0 custom-modal-backdrop" @click="closePaymentModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in">

          <!-- Header -->
          <div class="p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Cobrar Orden</h3>
            <p class="text-sm text-gray-500 mt-0.5">Completa los datos para procesar el pago</p>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-5">
            <!-- Resumen -->
            <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-500">{{ cart.length }} producto(s)</span>
                <span class="text-gray-500">Subtotal: {{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-bold text-gray-800 dark:text-white">Total a cobrar</span>
                <span class="text-2xl font-black text-brand-600 dark:text-brand-400">{{ formatCurrency(subtotal * 1.16) }}</span>
              </div>
            </div>

            <!-- Método de pago -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">Método de Pago</label>
              <div class="grid grid-cols-3 gap-3">
                <button v-for="method in availablePaymentMethods" :key="method.value"
                  @click="paymentData.method = method.value"
                  :class="paymentData.method === method.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 ring-2 ring-brand-500/20 text-brand-700 dark:text-brand-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'"
                  class="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all">
                  <div :class="paymentData.method === method.value ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'" class="w-6 h-6 shrink-0 flex items-center justify-center" v-html="method.svg"></div>
                  <span class="text-xs font-semibold">{{ method.label }}</span>
                </button>
              </div>
            </div>

            <!-- Cliente CXC (Conditional) -->
            <div v-if="paymentData.method === 'cxc' && !cxcClientName" class="animate-modal-in">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">Nombre del Cliente (Deudor)</label>
              <input v-model="paymentData.clientName" @input="paymentData.clientName = $event.target.value.toUpperCase()" type="text" placeholder="Ej. JUAN PÉREZ" class="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all uppercase">
            </div>
          </div>

          <!-- Footer -->
          <div class="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex gap-3">
            <button @click="closePaymentModal" class="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Cancelar</button>
            <button @click="processPayment"
              :disabled="!canProcessPayment || isProcessingPayment"
              :class="canProcessPayment && !isProcessingPayment ? 'bg-[#2D5A5A] hover:bg-[#244a4a] shadow-md active:scale-[0.98]' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'"
              class="flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
              <div v-if="isProcessingPayment" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              {{ isProcessingPayment ? 'Procesando...' : 'Pagar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ MODAL: Order Confirmation ═══ -->
    <Teleport to="body">
      <div v-if="showConfirmationModal" class="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
        <div class="absolute inset-0 custom-modal-backdrop"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in text-center">
          <div class="p-8">
            <div class="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-4">
              <svg class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-1">¡Pago Exitoso!</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">La orden ha sido procesada correctamente</p>
            <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-4 mb-2 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Orden</span>
                <span class="font-bold text-gray-800 dark:text-white">#{{ confirmedOrder.orderNum }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Pago</span>
                <span class="font-medium text-gray-800 dark:text-white">{{ confirmedOrder.methodLabel }}</span>
              </div>
              <div class="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <span class="font-bold text-gray-800 dark:text-white">Total</span>
                <span class="font-black text-brand-600 dark:text-brand-400">{{ formatCurrency(confirmedOrder.total) }}</span>
              </div>
            </div>
          </div>
          <div class="px-6 pb-6">
            <button @click="closeConfirmationModal" class="w-full py-3 rounded-xl bg-[#2D5A5A] text-white font-bold text-sm hover:bg-[#244a4a] transition-all shadow-md active:scale-[0.98]">Nueva Orden</button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { useMesas } from '@/composables/useMesas';
import { useCxc } from '@/composables/useCxc';
import { useAuth } from '@/composables/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const route = useRoute();
const router = useRouter();
const { obtenerMesa, liberarMesa, actualizarOrdenMesa } = useMesas();
const { getCxcClientDetails, payCxcDebt } = useCxc();
const { getUser } = useAuth();

// Mesa vinculada al POS
const mesaActual = ref<number | null>(null);
const cxcClientName = ref<string | null>(null);

const platillos = ref<any[]>([]);
const loading = ref(true);
const cart = ref<any[]>([]);
const showPrices = ref(true);
const activeCategoria = ref('Todos');
const currentOrderNum = ref(1024);

// ── Variable Modal State ──
const showVariableModal = ref(false);
const selectedPlatillo = ref<any>(null);
const modalSelections = ref<Record<number, Set<number>>>({});

// ── Payment Modal State ──
const showPaymentModal = ref(false);
const showConfirmationModal = ref(false);
const paymentData = ref({ clientName: '', method: '' });
const confirmedOrder = ref({ orderNum: 0, clientName: '', methodLabel: '', total: 0 });
const paymentMethods = [
  { value: 'efectivo', label: 'Efectivo', svg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/></svg>` },
  { value: 'tarjeta', label: 'Tarjeta', svg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.625-12h17.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 0 1-1.125-1.125V4.875c0-.621.504-1.125 1.125-1.125Z"/></svg>` },
  { value: 'transferencia', label: 'Transferencia', svg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"/></svg>` },
  { value: 'ubereats', label: 'UberEats', svg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 1.75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>` },
  { value: 'cxc', label: 'CXC', svg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>` },
  { value: 'cortesia', label: 'Cortesía', svg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg>` }
];

const availablePaymentMethods = computed(() => {
  if (cxcClientName.value) {
    return paymentMethods.filter(m => ['efectivo', 'tarjeta', 'transferencia'].includes(m.value));
  }
  return paymentMethods;
});

// ── Categories ──
const categorias = computed(() => {
  const cats = new Set(platillos.value.map(p => p.categoria));
  return ['Todos', ...Array.from(cats)].filter(Boolean);
});

const platillosFiltrados = computed(() => {
  if (activeCategoria.value === 'Todos') return platillos.value;
  return platillos.value.filter(p => p.categoria === activeCategoria.value);
});

// ── Fetch ──
const recetas = ref<any[]>([]);

const fetchPlatillos = async () => {
  try {
    const res = await fetch(`${API_URL}/api/platillos`);
    if (res.ok) {
      const data = await res.json();
      platillos.value = data.filter((p: any) => !p.privado);
    }
  } catch (e) {
    console.error('Error al cargar platillos:', e);
  } finally {
    loading.value = false;
  }
};

const fetchRecetas = async () => {
  try {
    const res = await fetch(`${API_URL}/api/recetas`);
    if (res.ok) {
      recetas.value = await res.json();
    }
  } catch (e) {
    console.error('Error al cargar recetas:', e);
  }
};

const calcularCostoReceta = (receta: any, varianteId: number | string | null = null) => {
  if (!receta || !receta.ingredientes) return 0;
  return receta.ingredientes.reduce((acc: number, ing: any) => {
    const ingVarId = ing.varianteId;
    const isBase = ingVarId === null || ingVarId === undefined;
    const isTargetVariant = varianteId !== null && ingVarId !== null && ingVarId !== undefined && String(ingVarId) === String(varianteId);
    
    if (varianteId === null) {
      if (isBase) {
        return acc + (parseFloat(ing.cantidad) * parseFloat(ing.costoUnitario || ing.costo_unitario || 0));
      }
    } else {
      if (isBase || isTargetVariant) {
        return acc + (parseFloat(ing.cantidad) * parseFloat(ing.costoUnitario || ing.costo_unitario || 0));
      }
    }
    return acc;
  }, 0);
};

// ── Sync cart ↔ mesa ──
// Converts POS cart format to the OrdenItem format stored in mesa
const cartToOrdenItems = (cartArr: any[]) => {
  return cartArr.map(item => ({
    id: `${item.platillo.id}-${JSON.stringify(item.variablesSeleccionadas || [])}`,
    cantidad: item.cantidad,
    producto: item.platillo.nombre,
    precio: parseFloat(item.platillo.precioBase) || 0,
    extras: (item.variablesSeleccionadas || []).map((vs: any) => vs.opcion),
    extrasStr: (item.variablesSeleccionadas || []).map((vs: any) => vs.opcion).join(', ')
  }));
};

// Converts stored OrdenItems back to POS cart format (best-effort re-hydration)
const ordenItemsToCart = (items: any[], platillosArr: any[]) => {
  return items.map(item => {
    const platillo = platillosArr.find((p: any) => p.nombre === item.producto) || {
      id: item.id,
      nombre: item.producto,
      precioBase: item.precio,
      imagenUrl: null,
      variables: []
    };
    const variablesSeleccionadas = (item.extras || []).map((ext: string) => ({
      grupo: '',
      opcion: ext,
      precioExtra: 0
    }));
    return { platillo, cantidad: item.cantidad, variablesSeleccionadas };
  });
};

// Watch cart changes and persist to mesa
watch(
  cart,
  (newCart) => {
    if (mesaActual.value !== null) {
      actualizarOrdenMesa(mesaActual.value, cartToOrdenItems(newCart));
    }
  },
  { deep: true }
);

onMounted(async () => {
  const mesaQuery = route.query.mesa;
  const cxcQuery = route.query.cxc;
  
  if (mesaQuery) {
    mesaActual.value = parseInt(mesaQuery as string, 10);
  }
  if (cxcQuery) {
    cxcClientName.value = cxcQuery as string;
  }
  
  await Promise.all([fetchPlatillos(), fetchRecetas()]);
  
  // After platillos loaded, restore cart from mesa if there's a saved order
  if (mesaActual.value !== null) {
    const mesa = obtenerMesa(mesaActual.value);
    if (mesa && mesa.orden && mesa.orden.length > 0) {
      cart.value = ordenItemsToCart(mesa.orden, platillos.value);
    }
  }
  
  // Or load CXC debt items if cxc query is present
  if (cxcClientName.value) {
    try {
      const debtDetails = await getCxcClientDetails(cxcClientName.value);
      const newCart = [];
      for (const order of debtDetails) {
        if (!order.productos) continue;
        for (const prod of order.productos) {
          const platillo = platillos.value.find((p: any) => p.nombre === (prod.producto || prod.nombre)) || {
            id: Date.now() + Math.random(),
            nombre: prod.producto || prod.nombre,
            precioBase: (parseFloat(prod.precio) || 0) + (parseFloat(prod.precioExtra) || 0),
            imagenUrl: null,
            variables: []
          };
          
          let variablesSeleccionadas = prod.variablesSeleccionadas || [];
          if (!variablesSeleccionadas.length && prod.extras && Array.isArray(prod.extras)) {
             variablesSeleccionadas = prod.extras.map((ext: string) => ({
               grupo: '', opcion: ext, precioExtra: 0
             }));
          }
          
          newCart.push({
            platillo,
            cantidad: prod.cantidad || 1,
            variablesSeleccionadas
          });
        }
      }
      cart.value = newCart;
    } catch (e) {
      console.error('Error loading CXC details:', e);
    }
  }
});

// ── Product Click Handler ──
const handleProductClick = (platillo: any) => {
  let vars = platillo.variables ? JSON.parse(JSON.stringify(platillo.variables)) : [];

  // Auto-calcular y/o auto-inyectar variaciones de receta
  if (platillo.recetaBaseId) {
    const recipe = recetas.value.find(r => r.id === platillo.recetaBaseId || r.clave === platillo.recetaBaseId);
    if (recipe) {
      const baseCost = calcularCostoReceta(recipe, null);
      
      // Escenario 1: El usuario NO creó variables en CartaForm. Auto-inyectamos las variantes de la receta.
      if (vars.length === 0 && recipe.variantes && recipe.variantes.length > 0) {
        const autoOptions = [
          { nombre: 'Base (Sencillo)', precioExtra: 0, recetaVarianteId: null }
        ];
        for (const v of recipe.variantes) {
          const variantCost = calcularCostoReceta(recipe, v.id);
          const extra = variantCost - baseCost;
          autoOptions.push({
            nombre: v.nombre,
            precioExtra: extra > 0 ? extra : 0,
            recetaVarianteId: v.id
          });
        }
        vars = [{
          nombre: 'Agregados',
          obligatorio: false,
          multiple: true,
          opciones: autoOptions
        }];
      } 
      // Escenario 2: El usuario SI creó variables. Validamos y ajustamos el precioExtra dinámicamente según el costo.
      else if (vars.length > 0) {
        for (const group of vars) {
          if (!group.opciones) continue;
          for (const option of group.opciones) {
            if (option.recetaVarianteId) {
              const variantCost = calcularCostoReceta(recipe, option.recetaVarianteId);
              const extra = variantCost - baseCost;
              if (extra > 0) {
                option.precioExtra = extra;
              }
            }
          }
        }
      }
    }
  }

  if (vars && Array.isArray(vars) && vars.length > 0) {
    selectedPlatillo.value = { ...platillo, variables: vars };
    modalSelections.value = {};
    showVariableModal.value = true;
  } else {
    addToCartDirect(platillo);
  }
};

// ── Add to cart without variables ──
const addToCartDirect = (platillo: any) => {
  const existing = cart.value.find(
    item => item.platillo.id === platillo.id && (!item.variablesSeleccionadas || item.variablesSeleccionadas.length === 0)
  );
  if (existing) {
    existing.cantidad++;
  } else {
    cart.value.push({ platillo, cantidad: 1, variablesSeleccionadas: [] });
  }
};

// ── Modal: toggle option ──
const toggleOpcion = (vIdx: number, oIdx: number) => {
  const variable = selectedPlatillo.value?.variables?.[vIdx];
  if (!variable) return;

  if (!modalSelections.value[vIdx]) {
    modalSelections.value[vIdx] = new Set();
  }

  const sel = modalSelections.value[vIdx];
  if (sel.has(oIdx)) {
    sel.delete(oIdx);
  } else {
    if (!variable.multiple) {
      sel.clear();
    }
    sel.add(oIdx);
  }
  // Force reactivity
  modalSelections.value = { ...modalSelections.value };
};

const isOpcionSelected = (vIdx: number, oIdx: number): boolean => {
  return modalSelections.value[vIdx]?.has(oIdx) ?? false;
};

// ── Modal: computed price ──
const modalPrecioFinal = computed(() => {
  if (!selectedPlatillo.value) return 0;
  let total = parseFloat(selectedPlatillo.value.precioBase) || 0;
  const vars = selectedPlatillo.value.variables || [];
  for (const [vIdx, selected] of Object.entries(modalSelections.value)) {
    const variable = vars[parseInt(vIdx)];
    if (!variable) continue;
    for (const oIdx of (selected as Set<number>)) {
      const opcion = variable.opciones?.[oIdx];
      if (opcion?.precioExtra) {
        total += parseFloat(opcion.precioExtra) || 0;
      }
    }
  }
  return total;
});

// ── Modal: validation ──
const canConfirmModal = computed(() => {
  if (!selectedPlatillo.value) return false;
  const vars = selectedPlatillo.value.variables || [];
  for (let i = 0; i < vars.length; i++) {
    if (vars[i].obligatorio) {
      const sel = modalSelections.value[i];
      if (!sel || sel.size === 0) return false;
    }
  }
  return true;
});

// ── Modal: confirm ──
const confirmAddToCart = () => {
  if (!canConfirmModal.value || !selectedPlatillo.value) return;

  const vars = selectedPlatillo.value.variables || [];
  const variablesSeleccionadas: any[] = [];
  for (const [vIdx, selected] of Object.entries(modalSelections.value)) {
    const variable = vars[parseInt(vIdx)];
    if (!variable) continue;
    for (const oIdx of (selected as Set<number>)) {
      const opcion = variable.opciones?.[oIdx];
      if (opcion) {
        variablesSeleccionadas.push({
          grupo: variable.nombre,
          opcion: opcion.nombre,
          precioExtra: parseFloat(opcion.precioExtra) || 0
        });
      }
    }
  }

  cart.value.push({
    platillo: selectedPlatillo.value,
    cantidad: 1,
    variablesSeleccionadas
  });

  closeVariableModal();
};

const closeVariableModal = () => {
  showVariableModal.value = false;
  selectedPlatillo.value = null;
  modalSelections.value = {};
};

// ── Cart Operations ──
const updateQty = (index: number, delta: number) => {
  const item = cart.value[index];
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    cart.value.splice(index, 1);
  }
};

const clearCart = () => {
  if (confirm('¿Seguro que deseas limpiar toda la orden?')) {
    cart.value = [];
    // Also clear mesa orden storage
    if (mesaActual.value !== null) {
      actualizarOrdenMesa(mesaActual.value, []);
    }
  }
};

const calcItemTotal = (item: any) => {
  let base = parseFloat(item.platillo.precioBase) || 0;
  if (item.variablesSeleccionadas) {
    for (const vs of item.variablesSeleccionadas) {
      base += vs.precioExtra || 0;
    }
  }
  return base * item.cantidad;
};

const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + calcItemTotal(item), 0);
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

// ── Payment Modal Logic ──
const openPaymentModal = () => {
  if (cart.value.length === 0) return;
  paymentData.value = { clientName: '', method: '' };
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
};

const canProcessPayment = computed(() => {
  if (paymentData.value.method === 'cxc' && !cxcClientName.value && !paymentData.value.clientName.trim()) {
    return false;
  }
  return paymentData.value.method !== '';
});

const isProcessingPayment = ref(false);

const processPayment = async () => {
  if (!canProcessPayment.value) return;
  isProcessingPayment.value = true;
  
  const method = paymentMethods.find(m => m.value === paymentData.value.method);
  
  try {
    if (cxcClientName.value) {
      // Liquidar deuda en backend
      await payCxcDebt(cxcClientName.value, method?.label || 'Efectivo');
    } else if (paymentData.value.method === 'cxc') {
      // Registrar nueva deuda CXC en backend
      await fetch(`${API_URL}/api/ordenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNombre: paymentData.value.clientName.trim().toUpperCase(),
          clienteTelefono: 'N/A', // Campo requerido en la bd por defecto
          clienteEmail: '',
          clienteDireccion: '',
          clienteReferencias: 'POS CXC',
          pagoMetodo: 'CXC',
          tipoEntrega: 'local',
          total: subtotal.value * 1.16,
          costoEnvio: 0,
          estado: 'Completada',
          usuarioCobro: getUser()?.nombre || getUser()?.username || 'Desconocido',
          productos: cart.value.map(c => ({
            id: c.platillo.id,
            producto: c.platillo.nombre,
            cantidad: c.cantidad,
            precio: parseFloat(c.platillo.precioBase) || 0,
            precioExtra: c.variablesSeleccionadas?.reduce((sum: number, v: any) => sum + (parseFloat(v.precioExtra) || 0), 0) || 0,
            extrasStr: (c.variablesSeleccionadas || []).map((v: any) => v.opcion).join(', ')
          }))
        })
      });
    }
    
    confirmedOrder.value = {
      orderNum: currentOrderNum.value,
      clientName: cxcClientName.value || paymentData.value.clientName || '',
      methodLabel: method?.label || '',
      total: subtotal.value * 1.16
    };
    showPaymentModal.value = false;
    showConfirmationModal.value = true;
  } catch (err) {
    alert('Ocurrió un error al procesar el pago. Revisa la consola.');
  } finally {
    isProcessingPayment.value = false;
  }
};

const closeConfirmationModal = () => {
  showConfirmationModal.value = false;
  cart.value = [];
  currentOrderNum.value++;
  
  if (cxcClientName.value) {
    router.push('/cxc');
  } else if (mesaActual.value !== null) {
    liberarMesa(mesaActual.value);
    router.push('/mesas');
  }
};
</script>

<style scoped>
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.94) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
.animate-modal-in {
  animation: modal-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  will-change: transform, opacity;
}
.custom-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  will-change: opacity;
}
/* Contain each POS cart item to its own paint layer */
.cart-item-row {
  contain: layout style paint;
}
</style>

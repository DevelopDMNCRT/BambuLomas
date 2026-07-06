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
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="openDiscountModal" class="p-1.5 rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 dark:bg-brand-500/20 dark:text-brand-400 dark:hover:bg-brand-500/30 transition-colors font-bold text-sm h-8 w-8 flex items-center justify-center" title="Aplicar descuento">
              %
            </button>
            <button @click="clearCart" class="p-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors h-8 w-8 flex items-center justify-center shadow-sm" title="Limpiar orden">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>

        <!-- Cliente Escaneado -->
        <div v-if="clienteEscaneado" class="px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 border-b border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <div>
              <p class="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 leading-none">{{ clienteEscaneado.nombre }}</p>
              <p class="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">ID: {{ clienteEscaneado.id }} · {{ clienteEscaneado.pedidos_lealtad || 0 }} pedidos</p>
            </div>
          </div>
          <button @click="clienteEscaneado = null" class="text-emerald-500 hover:text-emerald-700 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
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
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ formatCurrency(subtotalSinDescuento) }}</span>
            </div>
            <div v-if="discount.amount > 0" class="flex justify-between text-xs mt-1">
              <span class="text-gray-500">Descuento</span>
              <span class="font-medium text-brand-600 dark:text-brand-400">-{{ formatCurrency(discount.amount) }}</span>
            </div>
            <div v-if="cxcClientName" class="flex justify-between items-center text-xs mt-1">
              <span class="text-gray-500">Cobro</span>
              <span class="px-1.5 py-0.5 rounded bg-error-100 dark:bg-error-500/20 text-error-700 dark:text-error-400 font-bold">Liquidación de CXC: {{ cxcClientName }}</span>
            </div>
            <div class="pt-1.5 mt-1.5 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span class="font-bold text-sm text-gray-800 dark:text-white">Total</span>
              <span class="text-xl font-black text-brand-600 dark:text-brand-400">{{ formatCurrency(subtotal) }}</span>
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
          <div class="flex justify-between items-center gap-4">
            <h1 class="text-2xl font-black text-gray-800 dark:text-white tracking-tight shrink-0">Menú</h1>
            <div class="flex items-center gap-2 flex-1 justify-end">
              <div class="relative w-full max-w-[200px] sm:max-w-xs">
                <input v-model="searchQuery" type="text" placeholder="Buscar..." class="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white placeholder-gray-400 transition-all" />
                <svg class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <button
                @click="openQrScanner"
                class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all shrink-0 bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600"
                title="Escanear QR de cliente"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5a.5.5 0 11-1 0 .5.5 0 011 0zM6.5 20a.5.5 0 11-1 0 .5.5 0 011 0zM6 4h2v2H6V4zm12 0h2v2h-2V4zM4 4h2v2H4V4z"/></svg>
              </button>
            </div>
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
                  <div class="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-white/10">
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
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200 dark:border-gray-700 animate-modal-in">

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
              <div class="flex justify-between items-center mt-1">
                <span class="font-bold text-gray-800 dark:text-white">Total a cobrar</span>
                <span class="text-2xl font-black text-brand-600 dark:text-brand-400">{{ formatCurrency(subtotal) }}</span>
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
            <div v-if="paymentData.method === 'cxc' && !cxcClientName" class="animate-modal-in relative">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">Nombre del Cliente</label>
              <input 
                v-model="paymentData.clientName" 
                @focus="cxcSearchFocused = true"
                @blur="hideCxcSearch"
                @input="paymentData.clientName = ($event.target as HTMLInputElement).value.toUpperCase()" 
                type="text" 
                placeholder="Ej. JUAN PÉREZ" 
                class="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all uppercase"
              >
              <!-- Dropdown autocomplete -->
              <div v-if="cxcSearchFocused && filteredCxcOptions.length > 0" class="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-48 overflow-y-auto overflow-hidden">
                <button 
                  v-for="opt in filteredCxcOptions" 
                  :key="opt"
                  @click="paymentData.clientName = opt; cxcSearchFocused = false"
                  class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                >
                  {{ opt }}
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex gap-3 rounded-b-2xl">
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

    <!-- ═══ MODAL: QR Scanner ═══ -->
    <Teleport to="body">
      <div v-if="showQrModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        <div class="absolute inset-0 custom-modal-backdrop" @click="closeQrScanner"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col border border-gray-200 dark:border-gray-700 animate-modal-in overflow-hidden">
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-bold text-gray-800 dark:text-white">Escanear QR de Cliente</h3>
              <p class="text-sm text-gray-500 mt-0.5">Apunta la cámara al código QR del cliente</p>
            </div>
            <button @click="closeQrScanner" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <!-- Visor de cámara -->
          <div class="relative bg-black aspect-square">
            <video ref="qrVideo" class="w-full h-full object-cover" autoplay playsinline muted></video>
            <!-- Marco de escaneo -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative">
                <span class="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl"></span>
                <span class="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl"></span>
                <span class="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></span>
                <span class="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></span>
              </div>
            </div>
            <div v-if="qrScanning" class="absolute bottom-3 left-0 right-0 text-center">
              <span class="text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full">Escaneando...</span>
            </div>
          </div>
          <!-- Input manual -->
          <div class="p-4">
            <p class="text-xs text-gray-500 text-center mb-3">¿No tienes cámara? Ingresa el ID manualmente</p>
            <div class="flex gap-2">
              <input v-model="manualQrId" type="text" placeholder="ID del suscriptor (ej. 12345)" class="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500" @keyup.enter="lookupManualId" />
              <button @click="lookupManualId" :disabled="qrLookingUp" class="px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-60">
                {{ qrLookingUp ? '...' : 'Buscar' }}
              </button>
            </div>
            <p v-if="qrError" class="text-xs text-red-500 mt-2 text-center">{{ qrError }}</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ MODAL: Bienvenida Cliente ═══ -->
    <Teleport to="body">
      <div v-if="showWelcomeModal" class="fixed inset-0 z-[1000001] flex items-center justify-center p-4">
        <div class="absolute inset-0 custom-modal-backdrop" @click="showWelcomeModal = false"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xs border border-gray-200 dark:border-gray-700 animate-modal-in overflow-hidden text-center">
          <!-- Header verde -->
          <div class="bg-emerald-500 p-6">
            <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <h3 class="text-xl font-black text-white">¡Bienvenido!</h3>
            <p class="text-emerald-100 text-sm mt-1">Programa de Lealtad</p>
          </div>
          <div class="p-6">
            <h4 class="text-2xl font-black text-gray-800 dark:text-white mb-1">{{ clienteEscaneado?.nombre }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">ID: {{ clienteEscaneado?.id }}</p>
            <!-- Progreso de lealtad -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-semibold text-gray-500">Camino de lealtad</span>
                <span class="text-xs font-black text-emerald-600">{{ welcomeProgreso }}/10</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div class="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" :style="{ width: (welcomeProgreso * 10) + '%' }"></div>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                {{ welcomeProgreso >= 10 ? '🎁 ¡Recompensa disponible!' : `Faltan ${10 - welcomeProgreso} pedidos para tu próxima recompensa` }}
              </p>
            </div>
            <p class="text-xs text-gray-400 mb-4">Total de pedidos con QR: <span class="font-bold text-gray-700 dark:text-gray-300">{{ clienteEscaneado?.pedidos_lealtad || 0 }}</span></p>
            <button @click="showWelcomeModal = false" class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-md active:scale-[0.98]">
              Continuar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ MODAL: Discount ═══ -->
    <Teleport to="body">
      <div v-if="showDiscountModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        <div class="absolute inset-0 custom-modal-backdrop" @click="closeDiscountModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in">
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Aplicar Descuento</h3>
            <button @click="closeDiscountModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-400">Monto del descuento ($)</label>
              <input v-model.number="tempDiscount.amount" type="number" min="0" :max="subtotalSinDescuento" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-brand-500" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-400">Motivo</label>
              <input v-model="tempDiscount.reason" type="text" placeholder="Ej. Promoción especial" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-brand-500" />
            </div>
          </div>
          <div class="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <button @click="applyDiscount" class="w-full py-3 rounded-xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition-all shadow-md">
              Confirmar Descuento
            </button>
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
import jsQR from 'jsqr';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const route = useRoute();
const router = useRouter();
const { obtenerMesa, liberarMesa, actualizarOrdenMesa } = useMesas();
const { getCxcClientDetails, payCxcDebt } = useCxc();
const { getUser } = useAuth();

// Mesa vinculada al POS
const mesaActual = ref<number | null>(null);
const cxcClientName = ref<string | null>(null);
const ordenOnlineId = ref<number | null>(null);

const platillos = ref<any[]>([]);
const loading = ref(true);
const cart = ref<any[]>([]);
const activeCategoria = ref('Todos');
const currentOrderNum = ref(1024);
const searchQuery = ref('');

const showDiscountModal = ref(false);
const discount = ref({ amount: 0, reason: '' });
const tempDiscount = ref({ amount: 0, reason: '' });

const openDiscountModal = () => {
  tempDiscount.value = { ...discount.value };
  showDiscountModal.value = true;
};

const closeDiscountModal = () => {
  showDiscountModal.value = false;
};

const applyDiscount = () => {
  discount.value = { ...tempDiscount.value };
  showDiscountModal.value = false;
};

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

// ── Autocomplete CXC Clients ──
const cxcClientesOptions = ref<string[]>([]);
const cxcSearchFocused = ref(false);

const filteredCxcOptions = computed(() => {
  const query = paymentData.value.clientName.trim().toUpperCase();
  if (!query) return []; // Ocultar si no hay texto
  return cxcClientesOptions.value.filter(c => c.toUpperCase().includes(query) && c.toUpperCase() !== query);
});

const fetchCxcClientes = async () => {
  try {
    const res = await fetch(`${API_URL}/api/clientes`);
    if (res.ok) {
      const data = await res.json();
      const noPhoneClients = data.filter((c: any) => c.telefono === 'N/A' || !c.telefono);
      cxcClientesOptions.value = noPhoneClients.map((c: any) => c.nombre);
    }
  } catch(e) {
    console.error('Error al cargar clientes CXC:', e);
  }
};

const hideCxcSearch = () => {
  setTimeout(() => {
    cxcSearchFocused.value = false;
  }, 200);
};

// ── Categories ──
const categorias = computed(() => {
  const visibleList = platillos.value.filter(p => !p.privado || p.categoria?.toLowerCase() === 'recompensa');
  const cats = new Set(visibleList.map(p => p.categoria));
  const userRole = getUser()?.rol?.toLowerCase() || '';
  if (userRole !== 'admin') {
     cats.delete('Recompensa');
  }
  return ['Todos', ...Array.from(cats)].filter(Boolean);
});

const platillosFiltrados = computed(() => {
  let list = platillos.value.filter(p => !p.privado || p.categoria?.toLowerCase() === 'recompensa');
  const userRole = getUser()?.rol?.toLowerCase() || '';
  
  if (userRole !== 'admin') {
    list = list.filter(p => p.categoria?.toLowerCase() !== 'recompensa');
  }

  if (activeCategoria.value !== 'Todos') {
    list = list.filter(p => p.categoria === activeCategoria.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(p => p.nombre.toLowerCase().includes(q));
  }
  return list;
});

// ── Fetch ──
const recetas = ref<any[]>([]);

const fetchPlatillos = async () => {
  try {
    const res = await fetch(`${API_URL}/api/platillos`);
    if (res.ok) {
      const data = await res.json();
      platillos.value = data;
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
  const ordenOnlineQuery = route.query.ordenOnline;
  
  if (mesaQuery) {
    mesaActual.value = parseInt(mesaQuery as string, 10);
  }
  if (cxcQuery) {
    cxcClientName.value = cxcQuery as string;
  }
  if (ordenOnlineQuery) {
    try {
      const data = sessionStorage.getItem('pos_orden_online');
      if (data) {
        const ordenObj = JSON.parse(data);
        ordenOnlineId.value = ordenObj.id;
        currentOrderNum.value = ordenObj.numeroPedido;
      }
    } catch(e){}
  }
  
  await Promise.all([fetchPlatillos(), fetchRecetas(), fetchCxcClientes()]);
  
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

  // Load online order if present
  if (ordenOnlineId.value) {
    try {
      const data = sessionStorage.getItem('pos_orden_online');
      if (data) {
        const ordenObj = JSON.parse(data);
        const newCart = [];
        for (const prod of ordenObj.productos) {
          const platillo = platillos.value.find((p: any) => p.nombre === prod.nombre) || {
            id: prod.id || Date.now() + Math.random(),
            nombre: prod.nombre,
            precioBase: prod.precio,
            imagenUrl: prod.imagenUrl || null,
            variables: []
          };
          
          let variablesSeleccionadas = prod.selectedVariants || [];
          if (!variablesSeleccionadas.length && prod.variantsLabel) {
             variablesSeleccionadas = prod.variantsLabel.split(' · ').map((ext: string) => ({
               grupo: '', opcion: ext, precioExtra: 0
             }));
          }
          
          newCart.push({
            platillo,
            cantidad: prod.cantidad || 1,
            variablesSeleccionadas
          });
        }
        cart.value = newCart;
        
        // Select payment method
        const matchedMethod = paymentMethods.find(m => m.label.toLowerCase() === ordenObj.pagoMetodo?.toLowerCase());
        if (matchedMethod) {
           paymentData.value.method = matchedMethod.value;
        }
        paymentData.value.clientName = ordenObj.clienteNombre;
      }
    } catch(e) {
      console.error('Error loading online order:', e);
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
    discount.value = { amount: 0, reason: '' };
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

const subtotalSinDescuento = computed(() => {
  return cart.value.reduce((sum, item) => sum + calcItemTotal(item), 0);
});

const subtotal = computed(() => {
  return Math.max(0, subtotalSinDescuento.value - discount.value.amount);
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
    if (ordenOnlineId.value) {
      // Update existing order status to Completada
      await fetch(`${API_URL}/api/ordenes/${ordenOnlineId.value}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          estado: 'Completada',
          pagoMetodo: method?.label || 'Efectivo'
        })
      });
      sessionStorage.removeItem('pos_orden_online');
    } else if (cxcClientName.value) {
      // Liquidar deuda en backend
      await payCxcDebt(cxcClientName.value, method?.label || 'Efectivo');
    } else {
      const hasReward = cart.value.some(c => c.platillo?.categoria?.toLowerCase() === 'recompensa');
      // Registrar orden en backend
      await fetch(`${API_URL}/api/ordenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNombre: clienteEscaneado.value?.nombre?.toUpperCase() || paymentData.value.clientName.trim().toUpperCase() || 'PÚBLICO EN GENERAL',
          clienteTelefono: clienteEscaneado.value?.numero || 'N/A',
          clienteEmail: clienteEscaneado.value?.correo || '',
          clienteDireccion: '',
          clienteReferencias: paymentData.value.method === 'cxc' ? 'POS CXC' : 'POS',
          pagoMetodo: method?.label || 'Efectivo',
          tipoEntrega: 'local',
          total: subtotal.value,
          costoEnvio: 0,
          estado: 'Completada',
          notas_pedido: discount.value.amount > 0 ? `Descuento aplicado: -$${discount.value.amount} (${discount.value.reason})` : '',
          usuarioCobro: getUser()?.nombre || (getUser() as any)?.usuario || 'Desconocido',
          suscriptorId: clienteEscaneado.value?.id || null,
          reclamoRecompensa: hasReward,
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
      clientName: cxcClientName.value || clienteEscaneado.value?.nombre || paymentData.value.clientName || '',
      methodLabel: method?.label || '',
      total: subtotal.value
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
  discount.value = { amount: 0, reason: '' };
  clienteEscaneado.value = null; // Limpiar el cliente
  ordenOnlineId.value = null;
  currentOrderNum.value++;
  
  if (cxcClientName.value) {
    router.push('/cxc');
  } else if (mesaActual.value !== null) {
    liberarMesa(mesaActual.value);
    router.push('/mesas');
  }
};

// ── QR Scanner ──────────────────────────────────────────────────────────────
const showQrModal = ref(false);
const showWelcomeModal = ref(false);
const clienteEscaneado = ref<any>(null);
const qrVideo = ref<HTMLVideoElement | null>(null);
const qrScanning = ref(false);
const manualQrId = ref('');
const qrError = ref('');
const qrLookingUp = ref(false);
let qrStream: MediaStream | null = null;
let qrAnimFrame: number | null = null;

const welcomeProgreso = computed(() => {
  if (!clienteEscaneado.value) return 0;
  const pedidos = clienteEscaneado.value.pedidos_lealtad || 0;
  const reclamadas = clienteEscaneado.value.recompensas_reclamadas || 0;
  const ganadas = Math.floor(pedidos / 10);
  const disponibles = ganadas - reclamadas;
  if (disponibles > 0) return 10;
  return pedidos % 10;
});

const lookupSuscriptorById = async (rawId: string) => {
  let id = String(rawId).trim();
  if (id.startsWith('BAMBUSUB-')) id = id.replace('BAMBUSUB-', '');
  if (id.startsWith('BAMBUREWARD-')) id = id.replace('BAMBUREWARD-', '');

  qrError.value = '';
  qrLookingUp.value = true;
  try {
    const res = await fetch(`/api/suscriptores`);
    if (!res.ok) throw new Error('Error al buscar cliente');
    const subs: any[] = await res.json();
    const found = subs.find(s => String(s.id).trim() === id);
    if (!found) {
      qrError.value = `No se encontró un cliente con ID: ${id}`;
      return;
    }
    clienteEscaneado.value = found;
    
    // Auto-add reward if available
    const recompensasDisponibles = Math.floor((found.pedidos_lealtad || 0) / 10) - (found.recompensas_reclamadas || 0);
    if (recompensasDisponibles > 0) {
      const rewardProduct = platillos.value.find(p => p.categoria?.toLowerCase() === 'recompensa');
      if (rewardProduct) {
        cart.value.push({
          platillo: rewardProduct,
          cantidad: 1,
          precioBase: 0,
          precioExtra: 0,
          extras: {}
        });
        // We'll let them know it was added via an alert or they'll just see the Welcome Modal
      }
    }
    
    closeQrScanner();
    showWelcomeModal.value = true;
  } catch (e) {
    qrError.value = 'Error al conectar con el servidor';
  } finally {
    qrLookingUp.value = false;
  }
};

const lookupManualId = () => {
  const id = manualQrId.value.trim();
  if (!id) return;
  lookupSuscriptorById(id);
};

const startCameraScanner = async () => {
  try {
    qrStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    if (qrVideo.value) {
      qrVideo.value.srcObject = qrStream;
      // Need to wait for video to play before scanning
      qrVideo.value.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
      qrVideo.value.play();
    }
    qrScanning.value = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scan = async () => {
      if (!showQrModal.value || !qrScanning.value) return;
      
      if (qrVideo.value && qrVideo.value.readyState === qrVideo.value.HAVE_ENOUGH_DATA && ctx) {
        canvas.height = qrVideo.value.videoHeight;
        canvas.width = qrVideo.value.videoWidth;
        ctx.drawImage(qrVideo.value, 0, 0, canvas.width, canvas.height);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (code) {
            await lookupSuscriptorById(code.data);
            return; // Stop scanning after success
          }
        } catch (_) { /* continue scanning */ }
      }
      qrAnimFrame = requestAnimationFrame(scan);
    };
    
    // Start loop
    qrAnimFrame = requestAnimationFrame(scan);
    
  } catch (err) {
    qrError.value = 'No se pudo acceder a la cámara. Usa el campo manual.';
    qrScanning.value = false;
  }
};

const stopCamera = () => {
  if (qrAnimFrame !== null) {
    cancelAnimationFrame(qrAnimFrame);
    qrAnimFrame = null;
  }
  if (qrStream) {
    qrStream.getTracks().forEach(t => t.stop());
    qrStream = null;
  }
  qrScanning.value = false;
};

const openQrScanner = async () => {
  qrError.value = '';
  manualQrId.value = '';
  showQrModal.value = true;
  // Wait for DOM then start camera
  await new Promise(r => setTimeout(r, 100));
  startCameraScanner();
};

const closeQrScanner = () => {
  stopCamera();
  showQrModal.value = false;
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

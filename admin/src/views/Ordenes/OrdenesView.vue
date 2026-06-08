<template>
  <AdminLayout>
    <div class="p-6 space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Órdenes del Cliente</h1>
        </div>
        
        <!-- Vista Leyenda / Estado de conexión -->
        <div class="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-sm">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span class="font-bold text-gray-600 dark:text-gray-300">Monitoreo Activo</span>
        </div>
      </div>

      <!-- Kanban Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- COLUMNA 1: Nuevo -->
        <div class="flex flex-col bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 min-h-[500px]">
          <!-- Column Header -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <span class="font-black text-gray-800 dark:text-gray-200 text-lg">Nuevo</span>
            </div>
            <div class="px-3 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-black text-sm rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              {{ ordenesNuevas.length }}
            </div>
          </div>

          <!-- Column Cards Area -->
          <div class="flex-1 space-y-4 overflow-y-auto max-h-[700px] no-scrollbar">
            <!-- Empty state -->
            <div v-if="ordenesNuevas.length === 0" class="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-gray-900/30">
              <span class="text-sm font-semibold">Sin órdenes nuevas</span>
            </div>

            <!-- Cards -->
            <div 
              v-for="orden in ordenesNuevas" 
              :key="orden.id"
              @click="abrirDetalle(orden)"
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 active:scale-[0.99] relative overflow-hidden"
            >
              <div class="flex justify-between items-start gap-2 mb-3">
                <span class="font-black text-gray-900 dark:text-white text-base">
                  {{ orden.clienteNombre }}
                </span>
                <span class="font-extrabold text-[#4F817D] dark:text-[#6ca8a1] text-sm shrink-0">
                  {{ orden.numeroPedido }}
                </span>
              </div>

              <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mb-4">
                <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="font-bold tabular-nums">{{ orden.horaCreada }}</span>
                <span class="mx-1">•</span>
                <span class="capitalize text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 max-w-[120px] truncate">
                  {{ orden.tipoEntrega === 'domicilio' ? (orden.clienteDireccion || 'Envío') : 'Recoger' }}
                </span>
              </div>

              <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                <span class="text-gray-900 dark:text-white font-black text-sm">
                  ${{ orden.total.toFixed(2) }}
                </span>
                <button
                  @click.stop="cambiarEstadoOrden(orden, 'En preparación')"
                  class="px-4 py-2 bg-[#4F817D] hover:bg-[#2D5A5A] active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1"
                >
                  <span>Preparar</span>
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA 2: En preparación -->
        <div class="flex flex-col bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 min-h-[500px]">
          <!-- Column Header -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center text-amber-500">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </div>
              <span class="font-black text-gray-800 dark:text-gray-200 text-lg">En preparación</span>
            </div>
            <div class="px-3 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-black text-sm rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              {{ ordenesEnCocina.length }}
            </div>
          </div>

          <!-- Column Cards Area -->
          <div class="flex-1 space-y-4 overflow-y-auto max-h-[700px] no-scrollbar">
            <!-- Empty state -->
            <div v-if="ordenesEnCocina.length === 0" class="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-gray-900/30">
              <span class="text-sm font-semibold">Sin órdenes en cocina</span>
            </div>

            <!-- Cards -->
            <div 
              v-for="orden in ordenesEnCocina" 
              :key="orden.id"
              @click="abrirDetalle(orden)"
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 active:scale-[0.99] relative overflow-hidden"
            >
              <div class="flex justify-between items-start gap-2 mb-3">
                <span class="font-black text-gray-900 dark:text-white text-base">
                  {{ orden.clienteNombre }}
                </span>
                <span class="font-extrabold text-[#4F817D] dark:text-[#6ca8a1] text-sm shrink-0">
                  {{ orden.numeroPedido }}
                </span>
              </div>

              <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mb-4">
                <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="font-bold tabular-nums">{{ orden.horaCreada }}</span>
                <span class="mx-1">•</span>
                <span class="capitalize text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 max-w-[120px] truncate">
                  {{ orden.tipoEntrega === 'domicilio' ? (orden.clienteDireccion || 'Envío') : 'Recoger' }}
                </span>
              </div>

              <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                <span class="text-gray-900 dark:text-white font-black text-sm">
                  ${{ orden.total.toFixed(2) }}
                </span>
                <button
                  @click.stop="cambiarEstadoOrden(orden, 'En entrega')"
                  class="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1"
                >
                  <span>Listo</span>
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA 3: En entrega -->
        <div class="flex flex-col bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 min-h-[500px]">
          <!-- Column Header -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="12" height="10" rx="1" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M14 8h4l3 3v4h-7V8z" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="5.5" cy="17.5" r="1.5" />
                  <circle cx="16.5" cy="17.5" r="1.5" />
                  <path d="M7 17.5h8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <span class="font-black text-gray-800 dark:text-gray-200 text-lg">En entrega</span>
            </div>
            <div class="px-3 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-black text-sm rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              {{ ordenesParaEntregar.length }}
            </div>
          </div>

          <!-- Column Cards Area -->
          <div class="flex-1 space-y-4 overflow-y-auto max-h-[700px] no-scrollbar">
            <!-- Empty state -->
            <div v-if="ordenesParaEntregar.length === 0" class="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-gray-900/30">
              <span class="text-sm font-semibold">Sin órdenes para entregar</span>
            </div>

            <!-- Cards -->
            <div 
              v-for="orden in ordenesParaEntregar" 
              :key="orden.id"
              @click="abrirDetalle(orden)"
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 active:scale-[0.99] relative overflow-hidden"
            >
              <div class="flex justify-between items-start gap-2 mb-3">
                <span class="font-black text-gray-900 dark:text-white text-base">
                  {{ orden.clienteNombre }}
                </span>
                <span class="font-extrabold text-[#4F817D] dark:text-[#6ca8a1] text-sm shrink-0">
                  {{ orden.numeroPedido }}
                </span>
              </div>

              <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mb-4">
                <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="font-bold tabular-nums">{{ orden.horaCreada }}</span>
                <span class="mx-1">•</span>
                <span class="capitalize text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 max-w-[120px] truncate">
                  {{ orden.tipoEntrega === 'domicilio' ? (orden.clienteDireccion || 'Envío') : 'Recoger' }}
                </span>
              </div>

              <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                <span class="text-gray-900 dark:text-white font-black text-sm">
                  ${{ orden.total.toFixed(2) }}
                </span>
                <button
                  @click.stop="cambiarEstadoOrden(orden, 'Completada')"
                  class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1"
                >
                  <span>Entregar</span>
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- DETAIL MODAL -->
    <div 
      v-if="mostrarModal && ordenSeleccionada"
      class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="cerrarModal"
    >
      <div 
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <h3 class="text-2xl font-black text-gray-900 dark:text-white">
              Orden {{ ordenSeleccionada.numeroPedido }}
            </h3>
            <div class="flex items-center gap-1 text-red-500 text-sm font-bold">
              <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="font-bold tabular-nums">{{ ordenSeleccionada.horaCreada }}</span>
            </div>
          </div>
          <button 
            @click="cerrarModal" 
            class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Modal Content (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 text-gray-700 dark:text-gray-300">
          
          <!-- Cliente Section -->
          <div>
            <h4 class="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mb-3">Cliente</h4>
            <div class="space-y-2.5 text-sm font-bold text-gray-700 dark:text-gray-300">
              <!-- Linea 1: Nombre -->
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span class="text-gray-800 dark:text-gray-100 font-semibold">{{ ordenSeleccionada.clienteNombre }}</span>
              </div>
              
              <!-- Linea 2: Telefono y Direccion/Referencias -->
              <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
                <!-- Teléfono -->
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.14-4.117-6.942-6.942l1.293-.97c.362-.272.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  <a :href="'tel:' + ordenSeleccionada.clienteTelefono" class="text-gray-800 dark:text-gray-100 font-semibold hover:underline">
                    {{ ordenSeleccionada.clienteTelefono }}
                  </a>
                </div>
                
                <!-- Dirección / Ubicación -->
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span class="text-gray-800 dark:text-gray-100 font-semibold">
                    {{ ordenSeleccionada.clienteDireccion }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Productos Section -->
          <div>
            <h4 class="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mb-3">Productos</h4>
            <div class="space-y-4">
              <div 
                v-for="item in ordenSeleccionada.productos" 
                :key="item.id"
                class="flex flex-col"
              >
                <!-- Linea de producto -->
                <div class="flex justify-between items-start text-base font-bold text-gray-800 dark:text-gray-100">
                  <div>
                    <span class="font-extrabold mr-1">{{ item.cantidad.toFixed(2) }}x</span>
                    {{ item.nombre }}
                  </div>
                  <div class="font-bold">
                    ${{ item.precio.toFixed(2) }}
                  </div>
                </div>
                
                <!-- Lista de variantes con barra vertical y guiones -->
                <div 
                  v-if="item.variantsLabel || item.selectedVariants"
                  class="mt-1.5 ml-3 pl-4 border-l border-gray-100 dark:border-gray-800/80 space-y-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  <template v-if="item.variantsLabel">
                    <div v-for="part in item.variantsLabel.split(' · ')" :key="part">
                      - {{ part }}
                    </div>
                  </template>
                  <template v-else-if="item.selectedVariants">
                    <template v-for="(vals, key) in item.selectedVariants" :key="key">
                      <div v-for="val in vals" :key="val">
                        - {{ key }}: {{ val }}
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Pago Section -->
          <div>
            <h4 class="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mb-3">Pago</h4>
            <div class="flex items-center justify-between font-bold text-gray-800 dark:text-gray-100">
              <div class="flex items-center gap-2">
                <!-- SVG for Efectivo (Efectivo/Cash) -->
                <svg v-if="ordenSeleccionada.pagoMetodo.toLowerCase() === 'efectivo'" class="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/>
                </svg>
                <!-- SVG for Tarjeta / Terminal -->
                <svg v-else-if="ordenSeleccionada.pagoMetodo.toLowerCase() === 'tarjeta' || ordenSeleccionada.pagoMetodo.toLowerCase() === 'terminal'" class="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.625-12h17.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 0 1-1.125-1.125V4.875c0-.621.504-1.125 1.125-1.125Z"/>
                </svg>
                <!-- SVG for Transferencia -->
                <svg v-else class="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"/>
                </svg>
                <span class="text-gray-800 dark:text-gray-100 font-semibold">{{ ordenSeleccionada.pagoMetodo }}</span>
              </div>
              <div class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                ${{ ordenSeleccionada.total.toFixed(2) }}
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-6 pt-2 bg-white dark:bg-gray-900 flex items-center justify-between gap-4">
          <button 
            @click="cerrarModal"
            class="px-10 py-3.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
          
          <button 
            v-if="ordenSeleccionada.estado === 'Nuevo'"
            @click="cambiarEstadoOrden(ordenSeleccionada, 'En preparación')"
            class="flex-1 py-3.5 bg-[#2D5A5A] hover:bg-[#1E3B3B] text-white font-bold rounded-2xl shadow transition-colors"
          >
            Aceptar Pedido
          </button>
          <button 
            v-else-if="ordenSeleccionada.estado === 'En preparación'"
            @click="cambiarEstadoOrden(ordenSeleccionada, 'En entrega')"
            class="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow transition-colors"
          >
            Listo para Entrega
          </button>
          <button 
            v-else-if="ordenSeleccionada.estado === 'En entrega'"
            @click="cambiarEstadoOrden(ordenSeleccionada, 'Completada')"
            class="flex-1 py-3.5 bg-[#2D5A5A] hover:bg-[#1E3B3B] text-white font-bold rounded-2xl shadow transition-colors"
          >
            Completar Orden
          </button>
        </div>

      </div>
    </div>

  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useOrdenes, type Orden } from '@/composables/useOrdenes'

const { ordenes, loading, startPolling, stopPolling, actualizarEstado } = useOrdenes()

const mostrarModal = ref(false)
const ordenSeleccionada = ref<Orden | null>(null)

// Filtrar las órdenes por columnas del tablero Kanban
const ordenesNuevas = computed(() => ordenes.value.filter(o => o.estado === 'Nuevo'))
const ordenesEnCocina = computed(() => ordenes.value.filter(o => o.estado === 'En preparación'))
const ordenesParaEntregar = computed(() => ordenes.value.filter(o => o.estado === 'En entrega'))

// Acciones del modal
const abrirDetalle = (orden: Orden) => {
  ordenSeleccionada.value = orden
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  ordenSeleccionada.value = null
}

const cambiarEstadoOrden = async (orden: Orden, nuevoEstado: any) => {
  const exito = await actualizarEstado(orden.id, nuevoEstado)
  if (exito && mostrarModal.value && ordenSeleccionada.value?.id === orden.id) {
    if (nuevoEstado === 'Completada' || nuevoEstado === 'Cancelada') {
      cerrarModal()
    } else {
      ordenSeleccionada.value.estado = nuevoEstado
    }
  }
}

// Iniciar polling al montar y detener al desmontar
onMounted(() => {
  startPolling(4000) // Poll cada 4 segundos para excelente tiempo de respuesta
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
/* Eliminar scrollbars predeterminados */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>

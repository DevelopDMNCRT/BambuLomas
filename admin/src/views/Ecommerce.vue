<template>
  <AdminLayout>
    <div class="p-6 space-y-6">

      <!-- ── Header + Filtros ───────────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Estadísticas</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {{ modoLabel }}
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Toggle Día / Mes -->
          <div class="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex items-center">
            <button
              @click="setModo('dia')"
              :class="modo === 'dia'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
              class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 select-none"
            >
              Día
            </button>
            <button
              @click="setModo('mes')"
              :class="modo === 'mes'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
              class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 select-none"
            >
              Mes
            </button>
          </div>

          <!-- Date picker (modo día) — siempre visible -->
          <div
            class="relative transition-opacity duration-200"
            :class="modo !== 'dia' ? 'opacity-40' : ''"
            @click="setModo('dia')"
          >
            <flat-pickr
              v-model="selectedDate"
              :config="dateConfig"
              class="w-36 px-4 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white cursor-pointer text-center shadow-sm"
              placeholder="DD/MM/YYYY"
            />
            <!-- Overlay invisible para capturar clic cuando está inactivo y cambiar el modo sin abrir el calendario inmediatamente -->
            <div v-if="modo !== 'dia'" class="absolute inset-0 z-10 cursor-pointer"></div>
          </div>

          <!-- Month picker (modo mes) — siempre visible -->
          <div
            class="relative transition-opacity duration-200"
            :class="modo !== 'mes' ? 'opacity-40' : ''"
            @click="setModo('mes')"
          >
            <flat-pickr
              v-model="selectedMonth"
              :config="monthConfig"
              class="w-40 px-4 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white cursor-pointer text-center shadow-sm"
              placeholder="Mes / Año"
            />
            <div v-if="modo !== 'mes'" class="absolute inset-0 z-10 cursor-pointer"></div>
          </div>


          <!-- Reload -->
          <button
            @click="loadData"
            :disabled="loading"
            class="p-2 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-60 shadow-sm"
            title="Actualizar"
          >
            <svg :class="loading ? 'animate-spin' : ''" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <!-- ── Cards de Resumen ────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        <!-- Ingresos -->
        <div class="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
              {{ modoTag }}
            </span>
          </div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ingresos</p>
          <p class="text-2xl font-black text-gray-800 dark:text-white">
            <span v-if="loading" class="inline-block w-28 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></span>
            <span v-else>{{ formatCurrency(resumen?.ingresos ?? 0) }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-1.5">{{ resumen?.cantidadVentas ?? 0 }} ventas completadas</p>
          <div class="absolute -right-3 -bottom-3 opacity-[0.04] dark:opacity-[0.07]">
            <svg class="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1C6.477 1 2 5.477 2 11s4.477 10 10 10 10-4.477 10-10S17.523 1 12 1zm0 18a8 8 0 110-16 8 8 0 010 16zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V6z"/>
            </svg>
          </div>
        </div>

        <!-- Compras -->
        <div class="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <span class="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
              {{ modoTag }}
            </span>
          </div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Compras</p>
          <p class="text-2xl font-black text-gray-800 dark:text-white">
            <span v-if="loading" class="inline-block w-28 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></span>
            <span v-else>{{ formatCurrency(resumen?.totalCompras ?? 0) }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-1.5">{{ resumen?.cantidadCompras ?? 0 }} compras registradas</p>
          <div class="absolute -right-3 -bottom-3 opacity-[0.04] dark:opacity-[0.07]">
            <svg class="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 18a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2c0-1.11.89-2 2-2M1 2h3.27l.94 2H20a1 1 0 011 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.75 1.03H8.1L7 15h11v2H6a1 1 0 01-1-1c0-.17.05-.34.12-.5L6.6 14H5.33L2.27 4H1V2z"/>
            </svg>
          </div>
        </div>

        <!-- Gastos -->
        <div class="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
              <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <span class="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
              {{ modoTag }}
            </span>
          </div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gastos</p>
          <p class="text-2xl font-black text-gray-800 dark:text-white">
            <span v-if="loading" class="inline-block w-28 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></span>
            <span v-else>{{ formatCurrency(resumen?.gastos ?? 0) }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-1.5">{{ resumen?.cantidadGastos ?? 0 }} gastos registrados</p>
          <div class="absolute -right-3 -bottom-3 opacity-[0.04] dark:opacity-[0.07]">
            <svg class="w-24 h-24 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm7 3a1 1 0 00-1 1v1H9a1 1 0 000 2h2v1H9a1 1 0 00-.707 1.707l3 3a1 1 0 001.414-1.414L11.414 13H13a3 3 0 000-6h-1V7a1 1 0 00-1-1z"/>
            </svg>
          </div>
        </div>

        <!-- CXC — siempre acumulado total -->
        <div class="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-xl">
              <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <span class="text-xs font-medium text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg">
              Total global
            </span>
          </div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CXC Pendiente</p>
          <p class="text-2xl font-black text-red-600 dark:text-red-400">
            <span v-if="loading" class="inline-block w-28 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></span>
            <span v-else>{{ formatCurrency(resumen?.cxcTotal ?? 0) }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-1.5">Créditos otorgados sin pagar</p>
          <div class="absolute -right-3 -bottom-3 opacity-[0.04] dark:opacity-[0.07]">
            <svg class="w-24 h-24 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-2h8v2H8zm0-4v-2h8v2H8zm0-4V7h5v2H8z"/>
            </svg>
          </div>
        </div>

        <!-- Cortesías -->
        <div class="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 bg-pink-50 dark:bg-pink-900/30 rounded-xl">
              <svg class="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
              </svg>
            </div>
            <span class="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
              {{ modoTag }}
            </span>
          </div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cortesías</p>
          <p class="text-2xl font-black text-gray-800 dark:text-white">
            <span v-if="loading" class="inline-block w-28 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></span>
            <span v-else>{{ formatCurrency(resumen?.cortesias ?? 0) }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-1.5">{{ resumen?.cantidadCortesias ?? 0 }} órdenes en cortesía</p>
          <div class="absolute -right-3 -bottom-3 opacity-[0.04] dark:opacity-[0.07]">
            <svg class="w-24 h-24 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.5 0 12.36 0c-1.7 0-3.21.8-4.22 2.05C7.12.8 5.6 0 3.64 0 .5 0-2 2.53-2 4.64c0 .48.11.92.18 1.36H-2v2h24V6zm-12.93 0c-.07-.31-.19-.76-.19-1.36 0-1.46 1.06-2.64 2.57-2.64.95 0 1.88.5 2.5 1.38L12 4.11l-.18-.25C11.28 2.86 10.41 2 9.5 2c-.83 0-1.5.67-1.5 1.5 0 .39.16.74.41 1H6.3c.41-.45.7-1.02.77-1.5zM20 14H4v-4h16v4zm-9 6H4v-4h7v4zm9 0h-7v-4h7v4z"/>
            </svg>
          </div>
        </div>

        <!-- Balance -->
        <div
          class="relative border rounded-2xl p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
          :class="(resumen?.balance ?? 0) >= 0
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800/50'
            : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30 border-red-200 dark:border-red-800/50'"
        >
          <div class="flex items-start justify-between mb-3">
            <div
              class="p-2.5 rounded-xl"
              :class="(resumen?.balance ?? 0) >= 0
                ? 'bg-emerald-100 dark:bg-emerald-900/50'
                : 'bg-red-100 dark:bg-red-900/50'"
            >
              <svg
                class="w-5 h-5"
                :class="(resumen?.balance ?? 0) >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  :d="(resumen?.balance ?? 0) >= 0
                    ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                    : 'M13 17H5m0 0V9m0 8l8-8 4 4 6-6'"/>
              </svg>
            </div>
            <span class="text-xs font-medium px-2 py-1 rounded-lg"
              :class="(resumen?.balance ?? 0) >= 0
                ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-400'"
            >
              {{ modoTag }}
            </span>
          </div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Balance</p>
          <p
            class="text-2xl font-black"
            :class="(resumen?.balance ?? 0) >= 0
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-red-700 dark:text-red-300'"
          >
            <span v-if="loading" class="inline-block w-28 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></span>
            <span v-else>{{ formatCurrency(resumen?.balance ?? 0) }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-1.5">Ingresos − Compras − Gastos</p>
        </div>

      </div>

      <!-- ── Tablas ──────────────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">

        <!-- Top 5 Platillos -->
        <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-gray-800 dark:text-white">Top 5 Platillos</h2>
              <p class="text-xs text-gray-400 mt-0.5">Más vendidos — {{ modoTag }}</p>
            </div>
            <div class="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
          </div>

          <!-- Loading skeleton -->
          <div v-if="loading" class="p-5 space-y-3">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3">
              <div class="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse shrink-0"></div>
              <div class="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
              <div class="w-16 h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="!resumen?.topPlatillos?.length" class="flex flex-col items-center justify-center py-12">
            <svg class="w-12 h-12 text-gray-200 dark:text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-sm text-gray-400">Sin ventas en este período</p>
          </div>

          <!-- Data -->
          <div v-else class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div
              v-for="(platillo, idx) in resumen.topPlatillos"
              :key="platillo.nombre"
              class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <!-- Rank badge -->
              <span
                class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shrink-0"
                :class="[
                  idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                  idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' :
                  idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                  'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                ]"
              >
                {{ idx + 1 }}
              </span>

              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{{ platillo.nombre }}</p>
                <!-- Progress bar -->
                <div class="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                    :style="{ width: `${(platillo.totalVendido / (resumen.topPlatillos[0]?.totalVendido || 1)) * 100}%` }"
                  ></div>
                </div>
              </div>

              <div class="text-right shrink-0">
                <span class="font-black text-sm text-gray-800 dark:text-white">{{ platillo.totalVendido }}</span>
                <p class="text-xs text-gray-400">vendidos</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Top 5 CXC Clientes -->
        <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-gray-800 dark:text-white">Top 5 CXC</h2>
              <p class="text-xs text-gray-400 mt-0.5">Clientes con mayor deuda acumulada</p>
            </div>
            <div class="p-2 bg-red-50 dark:bg-red-900/30 rounded-xl">
              <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>

          <!-- Loading skeleton -->
          <div v-if="loadingCxc" class="p-5 space-y-3">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse shrink-0"></div>
              <div class="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
              <div class="w-20 h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="!topCxc.length" class="flex flex-col items-center justify-center py-12">
            <svg class="w-12 h-12 text-gray-200 dark:text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-gray-400">Sin cuentas por cobrar</p>
          </div>

          <!-- Data -->
          <div v-else class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div
              v-for="(client, idx) in topCxc"
              :key="client.nombre"
              class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <!-- Avatar initial -->
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-black shrink-0 uppercase"
                :class="[
                  idx === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                  idx === 1 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                ]"
              >
                {{ client.nombre.charAt(0) }}
              </div>

              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{{ client.nombre }}</p>
                <p class="text-xs text-gray-400">{{ client.ordenesCount }} órdenes pendientes</p>
              </div>

              <div class="text-right shrink-0">
                <span class="font-black text-sm text-red-600 dark:text-red-400">{{ formatCurrency(client.totalDeuda) }}</span>
                <!-- Progress bar -->
                <div class="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden w-20">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-red-400 to-rose-500 transition-all duration-500"
                    :style="{ width: `${(client.totalDeuda / (topCxc[0]?.totalDeuda || 1)) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { useEstadisticas, type EstadisticasResumen, type TopCxcCliente } from '@/composables/useEstadisticas';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import 'flatpickr/dist/plugins/monthSelect/style.css';

const { getResumen, getTopCxc } = useEstadisticas();

// ── Helpers de fecha ─────────────────────────────────────────────────────────
const getTodayStr = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};
const getCurrentMonthStr = () => getTodayStr().substring(0, 7);

// ── Estado del filtro ─────────────────────────────────────────────────────────
const modo = ref<'dia' | 'mes'>('dia');
const selectedDate = ref(getTodayStr());
const selectedMonth = ref(getCurrentMonthStr());

const dateConfig = {
  locale: Spanish,
  dateFormat: 'Y-m-d',
  maxDate: 'today',
  altInput: true,
  altFormat: 'd/m/Y',
};

const monthConfig = {
  locale: Spanish,
  plugins: [
    monthSelectPlugin({
      shorthand: true,
      dateFormat: 'Y-m',
      altFormat: 'F Y',
    })
  ]
};

// Computed labels
const modoLabel = computed(() => {
  if (modo.value === 'dia') {
    if (selectedDate.value === getTodayStr()) return 'Datos de hoy';
    const [y, m, d] = selectedDate.value.split('-');
    return `Datos del ${d}/${m}/${y}`;
  }
  const [year, month] = selectedMonth.value.split('-');
  const monthName = new Date(Number(year), Number(month) - 1, 1)
    .toLocaleString('es-MX', { month: 'long', year: 'numeric' });
  return `Datos de ${monthName}`;
});

const modoTag = computed(() =>
  modo.value === 'dia' ? 'Día' : 'Mes'
);

// ── Data ─────────────────────────────────────────────────────────────────────
const resumen = ref<EstadisticasResumen | null>(null);
const topCxc = ref<TopCxcCliente[]>([]);
const loading = ref(false);
const loadingCxc = ref(false);
const error = ref('');

const setModo = (m: 'dia' | 'mes') => {
  modo.value = m;
};

const loadData = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params: Parameters<typeof getResumen>[0] = { modo: modo.value };
    if (modo.value === 'dia') params.fecha = selectedDate.value;
    else params.mes = selectedMonth.value;

    resumen.value = await getResumen(params);
  } catch (e: any) {
    error.value = e.message || 'Error al cargar estadísticas';
  } finally {
    loading.value = false;
  }
};

const loadCxc = async () => {
  loadingCxc.value = true;
  try {
    topCxc.value = await getTopCxc();
  } catch (e) {
    console.error('Error al cargar top CXC:', e);
  } finally {
    loadingCxc.value = false;
  }
};

// ── Watchers ─────────────────────────────────────────────────────────────────
watch([modo, selectedDate, selectedMonth], () => {
  loadData();
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  loadData();
  loadCxc();
});

// ── Formatter ─────────────────────────────────────────────────────────────────
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
</script>

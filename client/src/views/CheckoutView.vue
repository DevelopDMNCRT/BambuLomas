<template>
  <div class="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 transition-colors">
    <!-- Header -->
    <Header />

    <main class="max-w-7xl mx-auto px-5 md:px-10 lg:px-16 py-8">
      <!-- Back link -->
      <button @click="router.push('/')" class="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 group">
        <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span class="font-medium">Volver</span>
      </button>

      <h1 class="text-3xl font-black text-gray-900 dark:text-white mb-8">Finalizar Pedido</h1>

      <div class="flex flex-col lg:flex-row gap-8 items-start">
        <!-- ===== Left Column: Forms ===== -->
        <div class="flex-1 space-y-6">

          <!-- Delivery Mode Toggle -->
          <div class="bg-white dark:bg-gray-800 rounded-[20px] p-1.5 flex border border-gray-100 dark:border-gray-700 shadow-sm">
            <button
              @click="deliveryMode = 'domicilio'"
              :class="['flex-1 py-3 rounded-[14px] font-bold text-sm flex items-center justify-center gap-2 transition-all',
                deliveryMode === 'domicilio' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300']"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Domicilio
            </button>
            <button
              @click="deliveryMode = 'recoger'"
              :class="['flex-1 py-3 rounded-[14px] font-bold text-sm flex items-center justify-center gap-2 transition-all',
                deliveryMode === 'recoger' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300']"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              Recoger
            </button>
          </div>

          <!-- Pickup info (if recoger) -->
          <div v-if="deliveryMode === 'recoger'" class="bg-white dark:bg-gray-800 rounded-[20px] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">Punto de Recogida</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Av. Insurgentes Sur No. 245, Mexico City</p>
            <p class="text-[#4F817D] dark:text-[#6ca8a1] text-sm font-bold mt-1">Listo en ~20 min</p>
          </div>

          <!-- Contact Details -->
          <div class="bg-white dark:bg-gray-800 rounded-[20px] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-5 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#4F817D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Datos de Contacto
            </h3>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-bold text-[#4F817D] mb-1.5 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  Nombre
                </label>
                <input v-model="form.nombre" type="text" placeholder="Nombre completo" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-[#4F817D] transition-colors" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-bold text-[#4F817D] mb-1.5 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    Teléfono
                  </label>
                  <div class="flex">
                    <span class="px-3 py-3 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-xl text-sm text-gray-500 dark:text-gray-400">🇲🇽 +52</span>
                    <input v-model="form.telefono" type="tel" maxlength="10" placeholder="55 1234 5678" class="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-[#4F817D] transition-colors" />
                  </div>
                </div>
                <div>
                  <label class="text-sm font-bold text-[#4F817D] mb-1.5 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    Correo
                  </label>
                  <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-[#4F817D] transition-colors" />
                </div>
              </div>
              
              <div class="mt-4">
                <label class="text-sm font-bold text-[#4F817D] mb-1.5 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
                  ID de Cliente / Lealtad (Opcional)
                </label>
                <input v-model="form.suscriptorId" @blur="checkLoyaltyId" type="text" placeholder="Ingresa tu ID de lealtad" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-[#4F817D] transition-colors" />
                <p v-if="isVerifyingId" class="text-xs text-[#4F817D] mt-1.5 font-bold animate-pulse">Buscando cliente...</p>
                <p v-else-if="welcomeData" class="text-xs text-green-600 dark:text-green-400 mt-1.5 font-bold">✓ ¡Cliente encontrado! Hola, {{ welcomeData.nombre.split(' ')[0] }}.</p>
                <p v-else-if="idNotFound" class="text-xs text-red-500 mt-1.5 font-bold">ID no encontrado. Verifica que esté correcto.</p>
                <p v-else class="text-xs text-gray-500 mt-1.5">Agrega tu ID para sumar puntos a tu Camino de Lealtad.</p>
              </div>

            </div>
          </div>

          <!-- Delivery Details (only for domicilio) -->
          <div v-if="deliveryMode === 'domicilio'" class="bg-white dark:bg-gray-800 rounded-[20px] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-5 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#4F817D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Datos de Entrega
            </h3>
            <div class="space-y-5">
              <!-- Hora Deseada -->
              <div>
                <label class="text-sm font-bold text-[#4F817D] mb-1.5 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Hora Deseada
                </label>
                <input v-model="form.horaEntrega" type="time" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-[#4F817D] transition-colors" />
              </div>

              <!-- Lugar de Entrega (Píldoras) -->
              <div>
                <label class="text-sm font-bold text-[#4F817D] mb-2 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  Lugar de Entrega
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="lugar in lugaresDeEntrega"
                    :key="lugar"
                    @click="form.lugarEntrega = lugar"
                    :class="['px-4 py-2 rounded-full text-sm font-bold border transition-all',
                      form.lugarEntrega === lugar ? 'border-[#4F817D] bg-[#4F817D] text-white shadow-md' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#4F817D]/50']"
                  >
                    {{ lugar }}
                  </button>
                </div>
                
                <!-- Input extra si selecciona "Otro" -->
                <div v-if="form.lugarEntrega === 'Otro (Especificar)'" class="mt-3">
                  <input v-model="form.otroLugar" type="text" placeholder="Especifique el lugar de entrega..." class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-[#4F817D] transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <!-- Notas del Pedido -->
          <div class="bg-white dark:bg-gray-800 rounded-[20px] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#4F817D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Notas del Pedido
            </h3>
            <textarea v-model="form.notasPedido" rows="3" placeholder="Notas generales (agregar extra servilletas, etc.)" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-[#4F817D] transition-colors resize-none"></textarea>
          </div>

          <!-- Payment Method -->
          <div class="bg-white dark:bg-gray-800 rounded-[20px] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-2">¿Cómo deseas realizar el pago?</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-5">Recuerda que por ahora no se realizará ningún cobro en línea. Al momento de la entrega, te agradeceremos realizar el pago con el método que seleccionaste.</p>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="method in paymentMethods"
                :key="method.id"
                @click="form.pago = method.id"
                :class="['py-4 px-3 rounded-2xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-2',
                  form.pago === method.id ? 'border-[#4F817D] bg-[#E8F3F1] dark:bg-[#2D5A5A]/30 text-[#2D5A5A] dark:text-[#6ca8a1]' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#4F817D]/50']"
              >
                <span class="text-2xl">{{ method.icon }}</span>
                {{ method.label }}
              </button>
            </div>
          </div>

        </div>

        <!-- ===== Right Column: Order Summary (Sticky) ===== -->
        <div class="w-full lg:w-80 lg:sticky lg:top-24">
          <div class="bg-white dark:bg-gray-800 rounded-[20px] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 class="font-black text-gray-900 dark:text-white text-xl mb-5">Resumen del Pedido</h3>
            
            <!-- Items -->
            <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
              <div v-for="item in cartItems" :key="item.id" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                  <img v-if="item.imagenUrl" :src="item.imagenUrl" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{{ item.nombre }}</p>
                  <p v-if="getVariantsLabel(item)" class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ getVariantsLabel(item) }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-black text-gray-900 dark:text-white">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
                  <p class="text-xs text-gray-400">x{{ item.cantidad }}</p>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
              <div class="flex justify-between text-gray-500 dark:text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>${{ cartTotal.toFixed(2) }}</span>
              </div>
              <div v-if="deliveryMode === 'domicilio'" class="flex justify-between text-[#4F817D] text-sm font-bold">
                <span>Costo de Envío</span>
                <span>${{ shippingCost.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-900 dark:text-white font-black text-lg border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
                <span>Total</span>
                <span>${{ totalFinal.toFixed(2) }}</span>
              </div>
            </div>

            <button 
              @click="handleSubmit"
              :disabled="!isFormValid || isSubmitting"
              :class="['mt-6 w-full py-4 rounded-2xl font-black text-[15px] flex items-center justify-between px-5 transition-all',
                (isFormValid && !isSubmitting) ? 'bg-[#4F817D] hover:bg-[#2D5A5A] text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed']"
            >
              <span>{{ isSubmitting ? 'Procesando...' : 'Confirmar Pedido' }}</span>
              <span class="bg-white/20 px-3 py-1 rounded-lg text-sm font-black">${{ totalFinal.toFixed(2) }}</span>
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>

  <!-- Success Modal -->
  <div v-if="showSuccess" class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-900 rounded-[24px] p-8 max-w-sm w-full text-center shadow-2xl">
      <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
      </div>
      <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-2">¡Pedido Enviado!</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-6">Gracias <strong>{{ form.nombre }}</strong> por tu compra, tu pedido ya está siendo preparado.</p>
      <button @click="goHome" class="w-full py-3 bg-[#4F817D] hover:bg-[#2D5A5A] text-white rounded-2xl font-black transition-colors">
        Ir al Inicio
      </button>
    </div>
  </div>

  <!-- Welcome / Loyalty Modal -->
  <div v-if="showWelcomeModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm transition-opacity">
    <div class="bg-white dark:bg-gray-900 rounded-[24px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
      <!-- Decoración -->
      <div class="absolute top-0 left-0 w-full h-2 bg-[#4F817D]"></div>
      
      <div class="w-16 h-16 bg-[#E8F3F1] dark:bg-[#2D5A5A]/30 rounded-full flex items-center justify-center mx-auto mb-4 text-[#4F817D] dark:text-[#6ca8a1]">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
        </svg>
      </div>
      <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-2">¡Hola, {{ welcomeData?.nombre?.split(' ')[0] }}!</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-5">
        Tus datos se han autocompletado y tienes <strong>{{ welcomeData?.pedidos_lealtad || 0 }} pedidos</strong> en tu Camino de Lealtad.
        <br v-if="welcomeData?.recompensaAñadida" />
        <strong v-if="welcomeData?.recompensaAñadida" class="text-[#4F817D] mt-2 block">¡Felicidades! Hemos añadido tu recompensa gratis al carrito.</strong>
      </p>
      
      <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
        <p class="text-sm text-gray-600 dark:text-gray-300 font-medium text-left space-y-1.5">
          <span class="block">✓ Nombre: <span class="font-bold text-gray-900 dark:text-white">{{ welcomeData?.nombre }}</span></span>
          <span class="block">✓ Teléfono: <span class="font-bold text-gray-900 dark:text-white">{{ welcomeData?.telefono || 'N/A' }}</span></span>
          <span class="block">✓ Correo: <span class="font-bold text-gray-900 dark:text-white">{{ welcomeData?.correo || 'N/A' }}</span></span>
        </p>
      </div>

      <button @click="showWelcomeModal = false" class="w-full py-3.5 bg-[#4F817D] hover:bg-[#2D5A5A] text-white rounded-xl font-bold transition-colors">
        Continuar con el Pedido
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import { cartItems, cartTotal, clearCart } from '../store/cart'

const router = useRouter()
const deliveryMode = ref<'domicilio' | 'recoger'>('domicilio')
const showSuccess = ref(false)
const SHIPPING_COST = 35

const form = ref({
  nombre: '',
  telefono: '',
  email: '',
  horaEntrega: '',
  lugarEntrega: '',
  otroLugar: '',
  notasPedido: '',
  pago: 'Efectivo',
  suscriptorId: ''
})

const isVerifyingId = ref(false)
const idNotFound = ref(false)
const welcomeData = ref<any>(null)
const showWelcomeModal = ref(false)

const checkLoyaltyId = async () => {
  const id = form.value.suscriptorId.trim()
  if (!id) {
    welcomeData.value = null
    idNotFound.value = false
    return
  }
  
  // No re-verificar si ya tenemos la data correcta para este ID
  if (welcomeData.value && String(welcomeData.value.id) === id) return

  isVerifyingId.value = true
  idNotFound.value = false
  welcomeData.value = null
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const res = await fetch(`${apiUrl}/api/suscriptores`)
    if (res.ok) {
      const subs = await res.json()
      const found = subs.find((s: any) => String(s.id).trim() === id)
      
      if (found) {
        // Rellenar datos de contacto automáticamente
        if (found.nombre) form.value.nombre = found.nombre
        if (found.numero && found.numero !== 'N/A') {
          form.value.telefono = found.numero.replace(/\D/g, '').slice(0, 10)
        }
        if (found.correo) form.value.email = found.correo
        
        // Comprobar recompensa
        const recompensasDisponibles = Math.floor((found.pedidos_lealtad || 0) / 10) - (found.recompensas_reclamadas || 0)
        if (recompensasDisponibles > 0) {
          try {
            const platRes = await fetch(`${apiUrl}/api/platillos`)
            if (platRes.ok) {
              const platillos = await platRes.json()
              const rewardProduct = platillos.find((p: any) => p.categoria?.toLowerCase() === 'recompensa')
              if (rewardProduct) {
                // Check if not already added
                const alreadyHasReward = cartItems.value.some(item => item.productId === Number(rewardProduct.id) && item.precio === 0)
                if (!alreadyHasReward) {
                  cartItems.value.push({
                    id: 'reward-' + Date.now(),
                    productId: Number(rewardProduct.id),
                    nombre: rewardProduct.nombre,
                    precio: 0,
                    cantidad: 1,
                    imagenUrl: rewardProduct.imagenUrl || ''
                  })
                }
                found.recompensaAñadida = true
              }
            }
          } catch (e) {
            console.error('Error al agregar recompensa:', e)
          }
        }
        
        welcomeData.value = found
        showWelcomeModal.value = true
      } else {
        idNotFound.value = true
      }
    }
  } catch (error) {
    console.error('Error verificando ID:', error)
  } finally {
    isVerifyingId.value = false
  }
}

const lugaresDeEntrega = [
  'Barra', 'Ludoteca', 'Torniquetes Telcel', 'Royal Canin', 
  'Carso Infraestructura', 'Torniquetes City Market', 'Otro (Especificar)'
]

// Limpiar teléfono para aceptar solo dígitos y máximo 10 caracteres
watch(() => form.value.telefono, (newVal) => {
  form.value.telefono = newVal.replace(/\D/g, '').slice(0, 10)
})

const paymentMethods = [
  { id: 'Efectivo', label: 'Efectivo', icon: '💵' },
  { id: 'Tarjeta', label: 'Tarjeta', icon: '💳' },
  { id: 'Transferencia', label: 'Transferencia', icon: '📲' }
]

const shippingCost = computed(() => deliveryMode.value === 'domicilio' ? SHIPPING_COST : 0)
const totalFinal = computed(() => cartTotal.value + shippingCost.value)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isFormValid = computed(() => {
  const isPhoneValid = form.value.telefono.trim().length === 10
  const isEmailValid = emailRegex.test(form.value.email.trim())
  const base = form.value.nombre.trim() && isPhoneValid && isEmailValid
  
  if (deliveryMode.value === 'domicilio') {
    const isLugarValid = form.value.lugarEntrega && (form.value.lugarEntrega !== 'Otro (Especificar)' || form.value.otroLugar.trim() !== '')
    return !!base && !!form.value.horaEntrega && !!isLugarValid && cartItems.value.length > 0
  }
  return !!base && cartItems.value.length > 0
})

const getVariantsLabel = (item: any): string => {
  if (!item.selectedVariants) return ''
  const parts: string[] = []
  for (const [, vals] of Object.entries(item.selectedVariants)) {
    const valArr = vals as string[]
    if (valArr.length > 0) parts.push(valArr.join(', '))
  }
  return parts.join(' · ')
}

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  isSubmitting.value = true
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const finalDireccion = form.value.lugarEntrega === 'Otro (Especificar)' 
      ? form.value.otroLugar 
      : form.value.lugarEntrega

    const orderData = {
      clienteNombre: form.value.nombre,
      clienteTelefono: form.value.telefono,
      clienteEmail: form.value.email || '',
      clienteDireccion: deliveryMode.value === 'domicilio' ? finalDireccion : 'Recoger en local',
      clienteReferencias: '', // Obsoleto, usamos notasPedido
      pagoMetodo: form.value.pago,
      tipoEntrega: deliveryMode.value,
      total: totalFinal.value,
      costoEnvio: shippingCost.value,
      horaEntrega: deliveryMode.value === 'domicilio' ? form.value.horaEntrega : '',
      notasPedido: form.value.notasPedido,
      suscriptorId: form.value.suscriptorId.trim() || null,
      reclamoRecompensa: cartItems.value.some(item => item.precio === 0 && welcomeData.value?.recompensaAñadida),
      productos: cartItems.value.map(item => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
        imagenUrl: item.imagenUrl || '',
        selectedVariants: item.selectedVariants || null,
        variantsLabel: getVariantsLabel(item)
      }))
    }
    
    const res = await fetch(`${apiUrl}/api/ordenes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    
    if (res.ok) {
      showSuccess.value = true
    } else {
      const errData = await res.json()
      alert(`Error al procesar el pedido: ${errData.error || 'Intente más tarde'}`)
    }
  } catch (error) {
    console.error('Error enviando pedido:', error)
    alert('Hubo un problema de conexión. Por favor intente de nuevo.')
  } finally {
    isSubmitting.value = false
  }
}

const goHome = () => {
  clearCart()
  showSuccess.value = false
  router.push('/')
}
</script>

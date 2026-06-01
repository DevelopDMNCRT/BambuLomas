<template>
  <Modal :fullScreenBackdrop="true" @close="$emit('cancel')">
    <template #body>
      <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-theme-lg dark:bg-gray-900 mx-4">
        <div class="flex flex-col items-center text-center">
          <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/10 text-error-500">
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-bold text-gray-800 dark:text-white/90">
            Eliminar registro
          </h3>
          <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
            ¿Estás seguro de que deseas eliminarlo? Esta acción no se puede deshacer.
          </p>
          <div class="flex w-full gap-3">
            <Button variant="outline" class="w-full justify-center" @click="$emit('cancel')">Cancelar</Button>
            <button class="w-full flex justify-center items-center rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-error-600 focus:outline-none focus:ring-2 focus:ring-error-500/20 transition-colors" @click="$emit('confirm')">Eliminar</button>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue';
import Button from './Button.vue';

defineEmits(['confirm', 'cancel']);
</script>

<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Usuarios</h1>
        </div>
        <div>
          <Button size="sm" :startIcon="PlusIcon" @click="goToForm('add')">Agregar nuevo</Button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        <svg class="animate-spin w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Cargando usuarios...
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <!-- Table -->
      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Usuario</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Correo</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Teléfono</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Rol</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="!users.length">
                <td colspan="6" class="px-5 py-10 text-center text-gray-400 dark:text-gray-500">
                  No hay usuarios registrados.
                </td>
              </tr>
              <tr v-for="user in users" :key="user.id" class="border-t border-gray-100 dark:border-gray-800">
                <td class="px-5 py-4">
                  <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ user.nombre }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ user.usuario }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ user.correo }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ user.telefono || '—' }}</p>
                </td>
                <td class="px-5 py-4">
                  <Badge :color="user.rol === 'Administrador' ? 'primary' : (user.rol === 'Cajero' ? 'success' : (user.rol === 'Chef' ? 'warning' : 'light'))">
                    {{ user.rol }}
                  </Badge>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="goToForm('view', user)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver">
                      <EyeIcon class="w-5 h-5" />
                    </button>
                    <button @click="goToForm('edit', user)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Editar">
                      <PencilIcon class="w-5 h-5" />
                    </button>
                    <button @click="resetDevice(user.id)" class="text-gray-400 hover:text-orange-500 transition-colors" title="Desvincular Dispositivo (Checador)">
                      <RefreshIcon class="w-5 h-5" />
                    </button>
                    <button @click="confirmDeleteAction(user.id)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar">
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ConfirmDeleteModal
      v-if="isDeleteModalOpen"
      @cancel="isDeleteModalOpen = false"
      @confirm="executeDelete"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal.vue';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, RefreshIcon } from '@/icons';
import { useUsuarios, type Usuario } from '@/composables/useUsuarios';

const router = useRouter();
const { getAll, remove } = useUsuarios();

const users = ref<Usuario[]>([]);
const loading = ref(true);
const error = ref('');

const isDeleteModalOpen = ref(false);
const itemToDelete = ref<number | null>(null);

const fetchUsers = async () => {
  loading.value = true;
  error.value = '';
  try {
    users.value = await getAll();
  } catch (e: any) {
    error.value = e.message || 'Error al cargar usuarios';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

const goToForm = (mode: string, user: Usuario | null = null) => {
  const query: any = { mode };
  if (user) {
    query.id = user.id;
    query.nombre = user.nombre;
    query.usuario = user.usuario;
    query.correo = user.correo;
    query.telefono = user.telefono;
    query.rol = user.rol;
  }
  router.push({ path: '/usuarios/form', query });
};

const confirmDeleteAction = (id: number) => {
  itemToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const executeDelete = async () => {
  if (itemToDelete.value !== null) {
    try {
      await remove(itemToDelete.value);
      users.value = users.value.filter(u => u.id !== itemToDelete.value);
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar';
    } finally {
      itemToDelete.value = null;
    }
  }
  isDeleteModalOpen.value = false;
};

const resetDevice = async (id: number) => {
  if (confirm('¿Estás seguro de que quieres desvincular el dispositivo de este usuario? (Tendrá que volver a registrarse en el checador).')) {
    try {
      const res = await fetch(`/api/usuarios/${id}/reset-device`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Error al desvincular');
      alert('Dispositivo desvinculado con éxito.');
    } catch (e: any) {
      alert(e.message || 'Error de conexión');
    }
  }
};
</script>

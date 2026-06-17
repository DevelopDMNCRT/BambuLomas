<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Suscriptores</h1>
        </div>
        <div>
          <Button size="sm" :startIcon="PlusIcon" @click="openAddModal">Agregar nuevo</Button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">ID</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p>
                </th>
                <th class="px-5 py-3 text-left">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Fecha de Alta</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Pedidos</p>
                </th>
                <th class="px-5 py-3 text-center">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="!suscriptores.length">
                <td colspan="4" class="px-5 py-10 text-center text-gray-400 dark:text-gray-500">
                  Aún no hay suscriptores registrados.
                </td>
              </tr>
              <tr v-for="sub in suscriptores" :key="sub.id" class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150">
                <td class="px-5 py-4">
                  <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ sub.id }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-800 font-medium text-theme-sm dark:text-gray-200">{{ sub.nombre }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ formatDate(sub.fecha_alta) }}</p>
                </td>
                <td class="px-5 py-4 text-center">
                  <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20">
                    {{ sub.pedidos || 0 }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-3">
                    <button @click="verPedidos(sub)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver">
                      <EyeIcon class="w-5 h-5" />
                    </button>
                    <button @click="openEditModal(sub)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Editar">
                      <PencilIcon class="w-5 h-5" />
                    </button>
                    <button @click="confirmDelete(sub.id)" class="text-gray-400 hover:text-error-500 transition-colors" title="Eliminar">
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
  </AdminLayout>

  <!-- Modal Ver Pedidos -->
  <Modal v-if="isViewModalOpen" :fullScreenBackdrop="true" @close="isViewModalOpen = false">
    <template #body>
      <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-gray-200 dark:border-gray-700 mx-4">
        <!-- Header -->
        <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 rounded-t-2xl">
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Pedidos Recientes</h3>
            <p class="text-sm text-gray-500 mt-0.5">{{ selectedSub?.nombre }}</p>
          </div>
          <button @click="isViewModalOpen = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <!-- Body -->
        <div class="p-5 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <ul class="space-y-4">
            <!-- Dummy orders -->
            <li class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-gray-800 dark:text-gray-200">#ORD-1023</span>
                <span class="text-sm font-medium text-gray-500">Hoy 09:30 AM</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">1x Café Americano, 1x Pan Tostado</p>
              <div class="text-right font-bold text-emerald-600 dark:text-emerald-400">$65.00</div>
            </li>
            <li class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-gray-800 dark:text-gray-200">#ORD-0985</span>
                <span class="text-sm font-medium text-gray-500">Ayer 10:15 AM</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">2x Jugo Verde, 1x Huevos Motuleños</p>
              <div class="text-right font-bold text-emerald-600 dark:text-emerald-400">$210.00</div>
            </li>
            <li class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-gray-800 dark:text-gray-200">#ORD-0940</span>
                <span class="text-sm font-medium text-gray-500">Hace 3 días</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">1x Chilaquiles Verdes</p>
              <div class="text-right font-bold text-emerald-600 dark:text-emerald-400">$120.00</div>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </Modal>

  <!-- Modal Agregar / Editar Suscriptor -->
  <Modal v-if="isFormModalOpen" :fullScreenBackdrop="true" @close="isFormModalOpen = false">
    <template #body>
      <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200 dark:border-gray-700 animate-modal-in mx-4">
        <!-- Header -->
        <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 rounded-t-2xl">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">{{ isEditMode ? 'Editar Suscriptor' : 'Agregar Suscriptor' }}</h3>
          <button @click="isFormModalOpen = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <!-- Body -->
        <div class="p-5 space-y-4">
          <div class="relative">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nombre Completo</label>
            <input type="text" v-model="newSub.nombre" placeholder="Ej. Juan Pérez" @focus="showClientSuggestions = true" @blur="hideSuggestions" class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white transition-all">
            
            <!-- Autocomplete Dropdown -->
            <ul v-if="showClientSuggestions && filteredClients.length > 0" class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
              <li v-for="client in filteredClients" :key="client.telefono" @mousedown.prevent="selectClient(client)" class="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-sm text-gray-800 dark:text-gray-200">
                <span class="font-semibold">{{ client.nombre }}</span>
                <span v-if="client.telefono" class="block text-xs text-gray-500 dark:text-gray-400">{{ client.telefono }}</span>
              </li>
            </ul>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Número de Teléfono</label>
            <input type="tel" v-model="newSub.numero" @input="newSub.numero = newSub.numero.replace(/\\D/g, '').slice(0, 10)" maxlength="10" placeholder="Ej. 5512345678" class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white transition-all">
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Correo Electrónico</label>
            <input type="email" v-model="newSub.correo" placeholder="Ej. juan@correo.com" class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white transition-all">
          </div>
        </div>
        <!-- Footer -->
        <div class="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex gap-3 rounded-b-2xl">
          <button @click="isFormModalOpen = false" class="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" :disabled="isSaving">Cancelar</button>
          <button @click="saveSubscriber" class="flex-1 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed" :disabled="isSaving">
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import Modal from '@/components/ui/Modal.vue';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@/icons';

const suscriptores = ref<any[]>([]);
const isSaving = ref(false);

const fetchSuscriptores = async () => {
  try {
    const res = await fetch('/api/suscriptores');
    if (res.ok) {
      suscriptores.value = await res.json();
    }
  } catch (error) {
    console.error('Error fetching suscriptores:', error);
  }
};

const clientesRegistrados = ref<any[]>([]);

const fetchClientes = async () => {
  try {
    const res = await fetch('/api/clientes');
    if (res.ok) {
      clientesRegistrados.value = await res.json();
    }
  } catch (error) {
    console.error('Error fetching clientes:', error);
  }
};

onMounted(() => {
  fetchSuscriptores();
  fetchClientes();
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Estado del Modal
const isViewModalOpen = ref(false);
const selectedSub = ref<any>(null);

const verPedidos = (sub: any) => {
  selectedSub.value = sub;
  isViewModalOpen.value = true;
};
// Estado del Modal de Agregar/Editar
const isFormModalOpen = ref(false);
const isEditMode = ref(false);
const editingId = ref<number | null>(null);

const newSub = ref({
  nombre: '',
  numero: '',
  correo: ''
});

// Autocomplete Logic
const showClientSuggestions = ref(false);

const filteredClients = computed(() => {
  if (!newSub.value.nombre) return [];
  const query = newSub.value.nombre.toLowerCase();
  return clientesRegistrados.value
    .filter(c => c.nombre.toLowerCase().includes(query))
    .slice(0, 5); // Mostrar máximo 5
});

const hideSuggestions = () => {
  setTimeout(() => {
    showClientSuggestions.value = false;
  }, 150);
};

const selectClient = (client: any) => {
  newSub.value.nombre = client.nombre;
  newSub.value.numero = client.telefono || '';
  showClientSuggestions.value = false;
};

const openAddModal = () => {
  isEditMode.value = false;
  editingId.value = null;
  newSub.value = { nombre: '', numero: '', correo: '' };
  isFormModalOpen.value = true;
};

const openEditModal = (sub: any) => {
  isEditMode.value = true;
  editingId.value = sub.id;
  newSub.value = {
    nombre: sub.nombre,
    numero: sub.numero || '',
    correo: sub.correo || ''
  };
  isFormModalOpen.value = true;
};

const saveSubscriber = async () => {
  if (newSub.value.numero && newSub.value.numero.length !== 10) {
    alert("El número de teléfono debe tener exactamente 10 dígitos.");
    return;
  }

  isSaving.value = true;
  try {
    if (isEditMode.value) {
      const res = await fetch(`/api/suscriptores/${editingId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub.value)
      });
      if (res.ok) {
        const updated = await res.json();
        const index = suscriptores.value.findIndex(s => s.id === editingId.value);
        if (index !== -1) {
          suscriptores.value[index] = { ...suscriptores.value[index], ...updated };
        }
      }
    } else {
      const res = await fetch('/api/suscriptores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub.value)
      });
      if (res.ok) {
        const created = await res.json();
        suscriptores.value.unshift({ ...created, pedidos: 0 });
      } else {
        alert("Asegúrate de llenar el nombre y el correo.");
      }
    }
    isFormModalOpen.value = false;
    newSub.value = { nombre: '', numero: '', correo: '' };
  } catch (error) {
    console.error("Error saving subscriber:", error);
    alert("Hubo un error al guardar el suscriptor.");
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (id: number) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este suscriptor?')) return;
  
  try {
    const res = await fetch(`/api/suscriptores/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      suscriptores.value = suscriptores.value.filter(s => s.id !== id);
    } else {
      alert("No se pudo eliminar el suscriptor.");
    }
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    alert("Hubo un error al eliminar.");
  }
};
</script>

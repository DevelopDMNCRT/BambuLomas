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
                  <span @click.stop="verLealtad(sub)" class="inline-flex cursor-pointer hover:bg-teal-200 items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200 transition-colors">
                    {{ sub.pedidos_lealtad || 0 }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-3">
                    <button @click="verLealtad(sub)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver Lealtad">
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

  <!-- Modal Lealtad (Vertical Timeline) -->
  <Modal v-if="isViewModalOpen" :fullScreenBackdrop="true" @close="isViewModalOpen = false">
    <template #body>
      <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col mx-4 overflow-hidden animate-modal-in border-t-8 border-[#197B4F]">
        <div class="p-6 flex justify-between items-start">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">PROGRAMA DE LEALTAD</p>
            <h3 class="text-2xl font-black text-gray-800 dark:text-white">{{ selectedSub?.nombre }}</h3>
            <p class="text-sm text-gray-500 mt-1">Total Histórico: {{ selectedSub?.pedidos_lealtad || 0 }} pedidos</p>
          </div>
          <button @click="isViewModalOpen = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-100 dark:bg-gray-800 rounded-full p-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="px-8 pb-8 pt-2 overflow-y-auto max-h-[60vh] custom-scrollbar">
          
          <div v-if="recompensaDisponible" class="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-[#197B4F] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
              </div>
              <div>
                <h4 class="text-[#197B4F] font-bold text-lg leading-tight">¡Recompensa Lista!</h4>
                <p class="text-sm text-green-700 dark:text-green-400">10 pedidos completados exitosamente.</p>
              </div>
            </div>
            <button @click="reclamarRecompensa" class="w-full py-2.5 rounded-lg bg-[#197B4F] text-white font-bold hover:bg-[#146342] transition-colors shadow-md disabled:opacity-50" :disabled="isClaiming">
              {{ isClaiming ? 'Procesando...' : 'Reclamar Recompensa' }}
            </button>
          </div>

          <!-- Timeline -->
          <div class="relative pl-6 border-l-2 border-[#197B4F] ml-4 mt-2 mb-4 space-y-8">
            
            <div v-for="n in 10" :key="n" class="relative">
              <!-- Circle -->
              <div class="absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900"
                   :class="((selectedSub?.pedidos_lealtad || 0) % 10 >= n || recompensaDisponible) ? 'bg-[#197B4F]' : 'bg-gray-200 dark:bg-gray-700'">
                <svg v-if="((selectedSub?.pedidos_lealtad || 0) % 10 >= n || recompensaDisponible)" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              
              <!-- Content -->
              <div class="pl-2">
                <h4 class="font-bold text-[15px]" 
                    :class="((selectedSub?.pedidos_lealtad || 0) % 10 >= n || recompensaDisponible) ? 'text-[#197B4F] dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                  <span v-if="n === 10">Recompensa</span>
                  <span v-else>Pedido {{ n }}</span>
                </h4>
                <p class="text-sm text-gray-500 mt-0.5">
                  <span v-if="((selectedSub?.pedidos_lealtad || 0) % 10 >= n || recompensaDisponible)">
                    Registrado exitosamente.
                  </span>
                  <span v-else>
                    Pendiente de compra.
                  </span>
                </p>
              </div>
            </div>

          </div>
          
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

const recompensaDisponible = computed(() => {
  if (!selectedSub.value) return false;
  const pedidos = selectedSub.value.pedidos_lealtad || 0;
  const reclamadas = selectedSub.value.recompensas_reclamadas || 0;
  return Math.floor(pedidos / 10) > reclamadas;
});

const isClaiming = ref(false);

const verLealtad = (sub: any) => {
  selectedSub.value = sub;
  isViewModalOpen.value = true;
};

const reclamarRecompensa = async () => {
  if (!selectedSub.value) return;
  isClaiming.value = true;
  try {
    const qr = `BAMBUREWARD-${selectedSub.value.id}`;
    const res = await fetch('/api/recompensa/canjear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qr })
    });
    const data = await res.json();
    if (res.ok) {
      selectedSub.value = data.suscriptor;
      const index = suscriptores.value.findIndex(s => s.id === data.suscriptor.id);
      if (index !== -1) suscriptores.value[index] = { ...suscriptores.value[index], ...data.suscriptor };
    } else {
      alert(data.error || 'Error al reclamar recompensa.');
    }
  } catch (e) {
    console.error(e);
    alert('Error de conexión al reclamar.');
  } finally {
    isClaiming.value = false;
  }
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
  if (newSub.value.numero) {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newSub.value.numero)) {
      alert("El número de teléfono debe contener exactamente 10 dígitos numéricos.");
      return;
    }
  }

  if (newSub.value.correo) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSub.value.correo)) {
      alert("Por favor, ingresa un formato de correo electrónico válido.");
      return;
    }
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

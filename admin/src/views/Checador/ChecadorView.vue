<template>
  <AdminLayout>
    <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">Checador</h1>
      </div>
    </div>

    <!-- Panel Principal -->
    <div class="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
      <div class="p-8 text-center space-y-6">
        
        <!-- Reloj Digital -->
        <div class="text-5xl md:text-7xl font-mono font-bold text-brand-600 dark:text-brand-400 tracking-wider">
          {{ currentTime }}
        </div>
        <div class="text-gray-500 dark:text-gray-400 font-medium text-lg">
          {{ currentDate }}
        </div>

        <!-- Botones de Acción -->
        <div class="flex justify-center gap-4 pt-6">
          <Button 
            size="md" 
            variant="primary" 
            class="px-8 py-4 text-lg w-40"
            :disabled="loading"
            @click="registrar('Entrada')"
          >
            Entrada
          </Button>
          <Button 
            size="md" 
            variant="outline" 
            class="px-8 py-4 text-lg w-40 !border-red-500 !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-500/10"
            :disabled="loading"
            @click="registrar('Salida')"
          >
            Salida
          </Button>
        </div>

        <!-- Mensajes de estado -->
        <div v-if="errorMsg" class="mt-4 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="mt-4 p-4 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium">
          {{ successMsg }}
        </div>
        <div v-if="loading" class="mt-4 text-brand-500 text-sm animate-pulse">
          Obteniendo ubicación y procesando...
        </div>

      </div>
    </div>

    <!-- Historial del día / Recientes -->
    <div class="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white/90">Mi Historial Reciente</h2>
      </div>
      <div class="p-0">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700/50">
              <tr>
                <th class="px-6 py-4">Usuario</th>
                <th class="px-6 py-4">Tipo</th>
                <th class="px-6 py-4">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
              <tr v-if="historial.length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-gray-400">No hay registros recientes</td>
              </tr>
              <tr v-for="item in historial" :key="item.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-800 dark:text-white/90">{{ item.usuario }}</td>
                <td class="px-6 py-4">
                  <span :class="[
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    item.tipo === 'Entrada' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  ]">
                    {{ item.tipo }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono">{{ item.fecha_hora }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import { useAuth } from '@/composables/useAuth';

const { getUser } = useAuth();
const user = getUser();

const currentTime = ref('');
const currentDate = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const loading = ref(false);
const historial = ref<any[]>([]);
let clockInterval: any;

// Función para inicializar y guardar un deviceToken
const getDeviceToken = () => {
  let token = localStorage.getItem('bambu_device_token');
  if (!token) {
    // Para asegurar compatibilidad con navegadores que no soportan crypto.randomUUID
    token = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      token = crypto.randomUUID();
    }
    localStorage.setItem('bambu_device_token', token);
  }
  return token;
};

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('es-MX', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  currentDate.value = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const fetchHistorial = async () => {
  if (!user?.id) return;
  try {
    const res = await fetch(`/api/checador/historial?usuarioId=${user.id}`);
    if (res.ok) {
      historial.value = await res.json();
    }
  } catch (err) {
    console.error('Error al obtener historial', err);
  }
};

const registrar = async (tipo: 'Entrada' | 'Salida') => {
  errorMsg.value = '';
  successMsg.value = '';
  
  if (!navigator.geolocation) {
    errorMsg.value = 'Tu navegador no soporta geolocalización. Intenta en otro dispositivo.';
    return;
  }

  loading.value = true;
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const deviceToken = getDeviceToken();

        const res = await fetch(`/api/checador/registro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuarioId: user?.id,
            tipo,
            latitud: latitude,
            longitud: longitude,
            deviceToken
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Error desconocido al registrar');
        }

        successMsg.value = `¡${tipo} registrada con éxito a las ${data.fecha_hora.split(' ')[1]}! (Distancia: ${data.distancia_metros}m)`;
        fetchHistorial();
      } catch (err: any) {
        errorMsg.value = err.message || 'Error al conectar con el servidor';
      } finally {
        loading.value = false;
      }
    },
    (err) => {
      loading.value = false;
      if (err.code === err.PERMISSION_DENIED) {
        errorMsg.value = 'Debes permitir el acceso a la ubicación para poder checar.';
      } else {
        errorMsg.value = `Error obteniendo ubicación: ${err.message}`;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
  fetchHistorial();
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
});
</script>

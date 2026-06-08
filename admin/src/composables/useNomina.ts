import { ref } from 'vue';

export interface NominaRegistro {
  id: number;
  usuario_id: number;
  usuario: string;
  rol: string;
  hora_entrada: string;
  hora_salida: string;
  fecha: string;
  hora_real_entrada: string | null;
  estadoChecado: 'pendiente' | 'puntual' | 'tarde' | 'falta';
  horaExacta: string | null;
  horaExactaSalida: string | null;
}

export function useNomina() {
  const nominas = ref<NominaRegistro[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchNominas = async (fecha: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`/api/nomina?fecha=${fecha}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al obtener la nómina');
      }
      nominas.value = await res.json();
    } catch (err: any) {
      error.value = err.message;
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const createNomina = async (payload: { usuario_id: number, rol: string, hora_entrada: string, hora_salida: string, fecha: string }) => {
    try {
      const res = await fetch('/api/nomina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar la nómina');
      }
      const data = await res.json();
      await fetchNominas(payload.fecha);
      return { success: true, data };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  return {
    nominas,
    loading,
    error,
    fetchNominas,
    createNomina
  };
}

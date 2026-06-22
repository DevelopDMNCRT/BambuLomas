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

export interface DiaSemana {
  dia_semana: number; // 0=Lun, 1=Mar, ..., 6=Dom
  tipo: 'laboral' | 'descanso';
  hora_entrada: string | null;
  hora_salida: string | null;
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

  /**
   * Crea uno o múltiples registros en nómina.
   * Acepta un array de { usuario_id, rol, hora_entrada, hora_salida, fecha }
   */
  const createNomina = async (
    payload: { usuario_id: number; rol: string; hora_entrada: string; hora_salida: string; fecha: string }[]
  ) => {
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
      // Refresh usando la fecha del primer registro
      if (payload.length > 0) {
        await fetchNominas(payload[0].fecha);
      }
      return { success: true, data };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Obtiene el horario semanal guardado de un usuario.
   */
  const getHorarioSemanal = async (usuarioId: number): Promise<DiaSemana[]> => {
    try {
      const res = await fetch(`/api/horarios-semanales/${usuarioId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  /**
   * Guarda (reemplaza) el horario semanal completo de un usuario.
   */
  const saveHorarioSemanal = async (usuarioId: number, dias: DiaSemana[]) => {
    try {
      const res = await fetch(`/api/horarios-semanales/${usuarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dias }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar el horario semanal');
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    nominas,
    loading,
    error,
    fetchNominas,
    createNomina,
    getHorarioSemanal,
    saveHorarioSemanal,
  };
}

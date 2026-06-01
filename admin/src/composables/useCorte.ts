import { ref } from 'vue';

export interface CorteMovimiento {
  id: string;
  tipo: 'Ingreso' | 'Egreso';
  descripcion: string;
  entidad: string;
  pago_metodo: string;
  monto: number;
  fecha: string;
  usuario: string;
}

export function useCorte() {
  const getCorteDelDia = async (fecha: string): Promise<CorteMovimiento[]> => {
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/corte?fecha=${fecha}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener el corte de caja');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    getCorteDelDia
  };
}

import { ref } from 'vue';

export interface Venta {
  id: number;
  numeroPedido: string;
  clienteNombre: string;
  pagoMetodo: string;
  estado: string;
  total: number;
  fechaHora: string;
  createdAt: string;
}

export function useVentas() {
  const getVentas = async (startDate?: string, endDate?: string): Promise<Venta[]> => {
    try {
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/ventas`;
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener las ventas');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    getVentas,
  };
}

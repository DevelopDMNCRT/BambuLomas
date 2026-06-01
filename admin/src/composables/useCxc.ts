import { ref } from 'vue';

export interface CxcClient {
  nombre: string;
  ordenesCount: number;
  ultimaFecha: string;
  totalDeuda: number;
}

export interface CxcOrderDetail {
  id: number;
  numeroPedido: string;
  total: number;
  fechaHora: string;
  productos: any[];
}

export function useCxc() {
  const getCxcClients = async (): Promise<CxcClient[]> => {
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/cxc`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener cuentas por cobrar');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const getCxcClientDetails = async (cliente: string): Promise<CxcOrderDetail[]> => {
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/cxc/${encodeURIComponent(cliente)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener el detalle de la deuda');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const payCxcDebt = async (clienteNombre: string, metodoPago: string) => {
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/cxc/pagar`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteNombre, metodoPago })
      });
      if (!response.ok) throw new Error('Error al procesar el pago de la deuda');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    getCxcClients,
    getCxcClientDetails,
    payCxcDebt
  };
}

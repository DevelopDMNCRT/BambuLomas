const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface EstadisticasResumen {
  periodo: { startDate: string; endDate: string; modo: string };
  ingresos: number;
  cantidadVentas: number;
  totalCompras: number;
  cantidadCompras: number;
  gastos: number;
  cantidadGastos: number;
  cxcTotal: number;
  cortesias: number;
  cantidadCortesias: number;
  balance: number;
  topPlatillos: Array<{ nombre: string; totalVendido: number }>;
}

export interface TopCxcCliente {
  nombre: string;
  ordenesCount: number;
  totalDeuda: number;
}

export function useEstadisticas() {
  const getResumen = async (params: {
    modo: 'dia' | 'mes';
    fecha?: string;
    mes?: string;
  }): Promise<EstadisticasResumen> => {
    const query = new URLSearchParams();
    query.set('modo', params.modo);
    if (params.modo === 'dia' && params.fecha) query.set('fecha', params.fecha);
    if (params.modo === 'mes' && params.mes) query.set('mes', params.mes);

    const res = await fetch(`${API_URL}/api/estadisticas/resumen?${query.toString()}`);
    if (!res.ok) throw new Error('Error al obtener el resumen de estadísticas');
    return res.json();
  };

  const getTopCxc = async (): Promise<TopCxcCliente[]> => {
    const res = await fetch(`${API_URL}/api/estadisticas/top-cxc`);
    if (!res.ok) throw new Error('Error al obtener top CXC');
    return res.json();
  };

  return { getResumen, getTopCxc };
}

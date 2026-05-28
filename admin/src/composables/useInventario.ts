// Composable para el Inventario y su historial de compras conectado al backend Express + Neon DB

export interface InventarioItem {
  id: string;
  nombre: string;
  stock: string;
  stockVal: number;
  ultimaCompra: string;
  minimos: string;
  minimosVal: number;
  costoReal: number;
}

export interface HistorialCompraItem {
  fecha: string;
  costo: number;
  proveedor: string;
  factura: string;
}

export function useInventario() {
  const getInventario = async (): Promise<InventarioItem[]> => {
    const res = await fetch('/api/inventario');
    if (!res.ok) throw new Error('Error al obtener el inventario');
    return res.json();
  };

  const getHistorial = async (nombre: string): Promise<HistorialCompraItem[]> => {
    const res = await fetch(`/api/inventario/historial?nombre=${encodeURIComponent(nombre)}`);
    if (!res.ok) throw new Error('Error al obtener el historial de compras');
    return res.json();
  };

  return { getInventario, getHistorial };
}

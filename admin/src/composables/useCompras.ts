// Composable para el CRUD de la tabla "compras" conectado al backend Express + Neon DB

export interface CompraItem {
  id?: number;
  cantidad: number;
  medida: string;
  producto: string;
  precioUnitario: number;
  descuento: number;
}

export interface Compra {
  id: number;
  factura: string;
  fecha: string;
  proveedor: string;
  formaPago?: string;
  total: number;
  created_at?: string;
  items?: CompraItem[];
}

export interface CompraPayload {
  factura: string;
  fecha: string;
  proveedor: string;
  formaPago: string;
  total: number;
  items: CompraItem[];
}

const BASE = '/api/compras';

export function useCompras() {

  const getAll = async (): Promise<Compra[]> => {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Error al obtener compras');
    return res.json();
  };

  const getOne = async (id: number): Promise<Compra> => {
    const res = await fetch(`${BASE}/${id}`);
    if (!res.ok) throw new Error('Error al obtener detalles de la compra');
    return res.json();
  };

  const getByFactura = async (factura: string): Promise<Compra> => {
    const res = await fetch(`${BASE}/by-factura/${encodeURIComponent(factura)}`);
    if (!res.ok) throw new Error('No se encontró la factura');
    return res.json();
  };

  const create = async (data: CompraPayload): Promise<Compra> => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar la compra');
    }
    return res.json();
  };

  const update = async (id: number, data: CompraPayload): Promise<Compra> => {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al actualizar la compra');
    }
    return res.json();
  };

  const remove = async (id: number): Promise<void> => {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar compra');
  };

  return { getAll, getOne, getByFactura, create, update, remove };
}

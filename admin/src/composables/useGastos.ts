// Composable para el CRUD de la tabla "gastos" conectado al backend Express + Neon DB

export interface Gasto {
  id: number;
  folio: string;
  fecha: string;
  aNombreDe: string;
  formaPago: string;
  cantidad: number;
  created_at?: string;
}

export interface GastoPayload {
  fecha: string;
  aNombreDe: string;
  formaPago: string;
  cantidad: number;
}

const BASE = '/api/gastos';

export function useGastos() {

  const getAll = async (): Promise<Gasto[]> => {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Error al obtener gastos');
    return res.json();
  };

  const getOne = async (id: number): Promise<Gasto> => {
    const res = await fetch(`${BASE}/${id}`);
    if (!res.ok) throw new Error('Error al obtener el gasto');
    return res.json();
  };

  const create = async (data: GastoPayload): Promise<Gasto> => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al registrar el gasto');
    }
    return res.json();
  };

  const update = async (id: number, data: GastoPayload): Promise<Gasto> => {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al actualizar el gasto');
    }
    return res.json();
  };

  const remove = async (id: number): Promise<void> => {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar el gasto');
  };

  return { getAll, getOne, create, update, remove };
}

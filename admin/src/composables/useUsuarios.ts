// Composable para el CRUD de la tabla "usuarios" conectado al backend Express + Neon DB

export interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  correo: string;
  telefono: string;
  rol: string;
  created_at?: string;
}

export interface UsuarioPayload {
  nombre: string;
  usuario: string;
  correo: string;
  telefono?: string;
  rol: string;
  contraseña?: string;
}

const BASE = '/api/usuarios';

export function useUsuarios() {

  const getAll = async (): Promise<Usuario[]> => {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return res.json();
  };

  const getOne = async (id: number): Promise<Usuario> => {
    const res = await fetch(`${BASE}/${id}`);
    if (!res.ok) throw new Error('Error al obtener usuario');
    return res.json();
  };

  const create = async (data: UsuarioPayload): Promise<Usuario> => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al crear usuario');
    }
    return res.json();
  };

  const update = async (id: number, data: UsuarioPayload): Promise<Usuario> => {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al actualizar usuario');
    }
    return res.json();
  };

  const remove = async (id: number): Promise<void> => {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar usuario');
  };

  return { getAll, getOne, create, update, remove };
}

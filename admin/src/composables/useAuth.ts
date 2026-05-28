// Composable para manejar la autenticación JWT en el frontend

export interface AuthUser {
  id: number;
  nombre: string;
  usuario: string;
  correo: string;
  rol: string;
}

const TOKEN_KEY = 'bambu_token';
const USER_KEY = 'bambu_user';

export function useAuth() {

  const login = async (usuario: string, contraseña: string): Promise<void> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contraseña }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al iniciar sesión');
    }
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  };

  const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const getUser = (): AuthUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  };

  const isAuthenticated = (): boolean => {
    const token = getToken();
    if (!token) return false;

    // Verificar si el token no ha expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  };

  return { login, logout, getToken, getUser, isAuthenticated };
}

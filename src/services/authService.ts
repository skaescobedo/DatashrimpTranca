import { clearAuthToken, get, getAuthToken, post, setAuthToken } from './api';
import { mapUsuario, type BackendUsuario } from './mappers';
import type { Usuario } from '../app/types';

interface LoginRequest {
  correo: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

function decodeSubFromJwt(token: string): number | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(json) as { sub?: string };
    const id = Number(parsed.sub);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export async function login(payload: LoginRequest): Promise<string> {
  const response = await post<LoginResponse>('/auth/login', payload);
  setAuthToken(response.access_token);
  return response.access_token;
}

export function logout(): void {
  clearAuthToken();
}

export function hasToken(): boolean {
  return Boolean(getAuthToken());
}

export async function getCurrentUser(): Promise<Usuario | null> {
  const token = getAuthToken();
  if (!token) return null;
  const userId = decodeSubFromJwt(token);
  if (!userId) return null;
  const response = await get<BackendUsuario>(`/usuarios/${userId}`);
  return mapUsuario(response);
}

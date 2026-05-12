import { del, get, post, put } from './api';
import { mapUsuario, type BackendUsuario } from './mappers';
import type { Usuario } from '../app/types';

interface UsuarioPayload {
  nombre: string;
  correo: string;
  rol: string;
  password?: string;
}

export async function listUsuarios(): Promise<Usuario[]> {
  const response = await get<BackendUsuario[]>('/usuarios/');
  return response.map(mapUsuario);
}

export async function createUsuario(payload: UsuarioPayload): Promise<Usuario> {
  const response = await post<BackendUsuario>('/usuarios/', payload);
  return mapUsuario(response);
}

export async function updateUsuario(id: number, payload: Partial<UsuarioPayload>): Promise<Usuario> {
  const response = await put<BackendUsuario>(`/usuarios/${id}`, payload);
  return mapUsuario(response);
}

export async function deleteUsuario(id: number): Promise<void> {
  await del(`/usuarios/${id}`);
}

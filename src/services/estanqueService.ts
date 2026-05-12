import { del, get, post, put } from './api';
import { mapEstanque, type BackendEstanque } from './mappers';
import type { Estanque } from '../app/types';

interface EstanquePayload {
  nombre: string;
  ubicacion?: string;
  superficie_m2: number;
  estado: string;
}

export async function listEstanques(): Promise<Estanque[]> {
  const response = await get<BackendEstanque[]>('/estanques/');
  return response.map(mapEstanque);
}

export async function createEstanque(payload: EstanquePayload): Promise<Estanque> {
  const response = await post<BackendEstanque>('/estanques/', payload);
  return mapEstanque(response);
}

export async function updateEstanque(id: number, payload: Partial<EstanquePayload>): Promise<Estanque> {
  const response = await put<BackendEstanque>(`/estanques/${id}`, payload);
  return mapEstanque(response);
}

export async function deleteEstanque(id: number): Promise<void> {
  await del(`/estanques/${id}`);
}

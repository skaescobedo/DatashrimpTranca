import { del, get, post, put } from './api';
import { mapBiometria, type BackendBiometria } from './mappers';
import type { Biometria } from '../app/types';

interface BiometriaPayload {
  id_ciclo_estanque: number;
  fecha: string;
  numero_muestra: number;
  peso_total_muestra_g: number;
  observaciones?: string | null;
}

export async function listBiometrias(): Promise<Biometria[]> {
  const response = await get<BackendBiometria[]>('/biometrias/');
  return response.map(mapBiometria);
}

export async function listBiometriasByCicloEstanque(cicloEstanqueId: number): Promise<Biometria[]> {
  const response = await get<BackendBiometria[]>(`/biometrias/ciclo-estanque/${cicloEstanqueId}`);
  return response.map(mapBiometria);
}

export async function createBiometria(payload: BiometriaPayload): Promise<Biometria> {
  const response = await post<BackendBiometria>('/biometrias/', payload);
  return mapBiometria(response);
}

export async function updateBiometria(id: number, payload: Partial<BiometriaPayload>): Promise<Biometria> {
  const response = await put<BackendBiometria>(`/biometrias/${id}`, payload);
  return mapBiometria(response);
}

export async function deleteBiometria(id: number): Promise<void> {
  await del(`/biometrias/${id}`);
}

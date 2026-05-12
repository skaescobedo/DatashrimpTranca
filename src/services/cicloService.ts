import { del, get, patch, post, put } from './api';
import { mapCiclo, type BackendCiclo } from './mappers';
import type { Ciclo } from '../app/types';

interface CicloPayload {
  nombre: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  estado: string;
}

export async function listCiclos(): Promise<Ciclo[]> {
  const response = await get<BackendCiclo[]>('/ciclos/');
  return response.map(mapCiclo);
}

export async function createCiclo(payload: CicloPayload): Promise<Ciclo> {
  const response = await post<BackendCiclo>('/ciclos/', payload);
  return mapCiclo(response);
}

export async function updateCiclo(id: number, payload: Partial<CicloPayload>): Promise<Ciclo> {
  const response = await put<BackendCiclo>(`/ciclos/${id}`, payload);
  return mapCiclo(response);
}

export async function finalizarCiclo(id: number, fechaFin?: string): Promise<Ciclo> {
  const response = await patch<BackendCiclo>(`/ciclos/${id}/finalizar`, { fecha_fin: fechaFin || null });
  return mapCiclo(response);
}

export async function deleteCiclo(id: number): Promise<void> {
  await del(`/ciclos/${id}`);
}

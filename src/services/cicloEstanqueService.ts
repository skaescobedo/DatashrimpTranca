import { del, get, patch, post, put } from './api';
import { mapCicloEstanque, type BackendCicloEstanque } from './mappers';
import type { Ciclo, CicloEstanque } from '../app/types';

interface CicloEstanquePayload {
  id_ciclo: number;
  id_estanque: number;
  fecha_siembra: string;
  densidad_inicial_m2: number;
  peso_inicial_promedio_g?: number | null;
  estado: string;
}

interface CicloEstanqueUpdatePayload {
  fecha_siembra?: string;
  densidad_inicial_m2?: number;
  peso_inicial_promedio_g?: number;
  estado?: string;
}

export async function listCicloEstanquesByCiclo(cicloId: number): Promise<CicloEstanque[]> {
  const response = await get<BackendCicloEstanque[]>(`/ciclo-estanques/ciclo/${cicloId}`);
  return response.map(mapCicloEstanque);
}

export async function listCicloEstanquesByEstanque(estanqueId: number): Promise<CicloEstanque[]> {
  const response = await get<BackendCicloEstanque[]>(`/ciclo-estanques/estanque/${estanqueId}`);
  return response.map(mapCicloEstanque);
}

export async function listAllCicloEstanques(ciclos: Ciclo[]): Promise<CicloEstanque[]> {
  const nested = await Promise.all(ciclos.map((ciclo) => listCicloEstanquesByCiclo(ciclo.id)));
  const flat = nested.flat();
  const seen = new Set<number>();
  return flat.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function createCicloEstanque(payload: CicloEstanquePayload): Promise<CicloEstanque> {
  const response = await post<BackendCicloEstanque>('/ciclo-estanques/', payload);
  return mapCicloEstanque(response);
}

export async function updateCicloEstanque(
  id: number,
  payload: CicloEstanqueUpdatePayload,
): Promise<CicloEstanque> {
  const response = await put<BackendCicloEstanque>(`/ciclo-estanques/${id}`, payload);
  return mapCicloEstanque(response);
}

export async function finalizarCicloEstanque(id: number): Promise<CicloEstanque> {
  const response = await patch<BackendCicloEstanque>(`/ciclo-estanques/${id}/finalizar`);
  return mapCicloEstanque(response);
}

export async function deleteCicloEstanque(id: number): Promise<void> {
  await del(`/ciclo-estanques/${id}`);
}

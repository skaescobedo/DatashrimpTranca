import { del, get, post, put } from './api';
import { mapBiometria, type BackendBiometria } from './mappers';
import type { Biometria } from '../app/types';

interface BiometriaPayload {
  id_ciclo_estanque: number;
  fecha: string;
  numero_muestra: number;
  peso_total_muestra_g: number;
  agua_temperatura: number;
  agua_salinidad: number;
  agua_oxigeno: number;
  observaciones?: string | null;
}

interface BiometriaPredictionRecord {
  numero_biometria: number;
  fecha: string;
  peso_promedio_predicho: number;
  agua_temperatura_predicha: number;
  agua_salinidad_predicha: number;
  agua_oxigeno_predicho: number;
  confianza: number;
}

export interface BiometriaPredictionResponse {
  ciclo_nombre: string;
  estanque_nombre: string;
  numero_biometria_actual: number;
  fecha_siembra: string;
  predicciones: BiometriaPredictionRecord[];
  r2_modelo: number;
  cantidad_datos_entrenamiento: number;
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

export async function importExcelBiometrias(file: File): Promise<Biometria[]> {
  const formData = new FormData();
  formData.append('archive', file);
  const response = await post<BackendBiometria[]>('/biometrias/import', formData);

  if (!response || !Array.isArray(response)) {
    throw new Error('La respuesta del servidor no es válida. Verifica que el archivo tenga el formato correcto.');
  }
  
  return response.map(mapBiometria);
}

export async function predictBiometria(cicloEstanqueId: number,semanas: number = 4): Promise<BiometriaPredictionResponse> {
  const response = await get<BiometriaPredictionResponse>(
    `/biometrias/predecir/${cicloEstanqueId}?semanas=${semanas}`
  );
  return response;
}
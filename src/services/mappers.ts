import type { Biometria, Ciclo, CicloEstanque, Estanque, Usuario } from '../app/types';

export interface BackendUsuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
  creado_en: string;
}

export interface BackendEstanque {
  id_estanque: number;
  nombre: string;
  ubicacion: string | null;
  superficie_m2: number | string;
  estado: string;
  creado_en: string;
}

export interface BackendCiclo {
  id_ciclo: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
  creado_en: string;
}

export interface BackendCicloEstanque {
  id_ciclo_estanque: number;
  id_ciclo: number;
  id_estanque: number;
  fecha_siembra: string;
  densidad_inicial_m2: number | string;
  peso_inicial_promedio_g: number | string | null;
  estado: string;
}

export interface BackendBiometria {
  id_biometria: number;
  id_ciclo_estanque: number;
  fecha: string;
  numero_muestra: number;
  peso_total_muestra_g: number | string;
  peso_promedio_g: number | string;
  observaciones: string | null;
  registrado_por: number;
  creado_en: string;
}

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapUsuario(item: BackendUsuario): Usuario {
  return {
    id: item.id_usuario,
    nombre: item.nombre,
    correo: item.correo,
    rol: item.rol,
    creado_en: item.creado_en,
  };
}

export function mapEstanque(item: BackendEstanque): Estanque {
  return {
    id: item.id_estanque,
    nombre: item.nombre,
    ubicacion: item.ubicacion || '',
    superficie_m2: toNumber(item.superficie_m2),
    estado: item.estado,
    creado_en: item.creado_en,
  };
}

export function mapCiclo(item: BackendCiclo): Ciclo {
  return {
    id: item.id_ciclo,
    nombre: item.nombre,
    fecha_inicio: item.fecha_inicio,
    fecha_fin: item.fecha_fin,
    estado: item.estado,
    creado_en: item.creado_en,
  };
}

export function mapCicloEstanque(item: BackendCicloEstanque): CicloEstanque {
  return {
    id: item.id_ciclo_estanque,
    ciclo_id: item.id_ciclo,
    estanque_id: item.id_estanque,
    fecha_siembra: item.fecha_siembra,
    densidad_inicial_m2: toNumber(item.densidad_inicial_m2),
    peso_inicial_promedio_g: toNumber(item.peso_inicial_promedio_g),
    estado: item.estado,
  };
}

export function mapBiometria(item: BackendBiometria): Biometria {
  return {
    id: item.id_biometria,
    ciclo_estanque_id: item.id_ciclo_estanque,
    fecha: item.fecha,
    numero_muestra: item.numero_muestra,
    peso_total_muestra_g: toNumber(item.peso_total_muestra_g),
    peso_promedio_g: toNumber(item.peso_promedio_g),
    observaciones: item.observaciones || '',
    registrado_por_id: item.registrado_por,
  };
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  creado_en: string;
}

export interface Estanque {
  id: number;
  nombre: string;
  ubicacion: string;
  superficie_m2: number;
  estado: string;
  creado_en: string;
}

export interface Ciclo {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
  creado_en: string;
}

export interface CicloEstanque {
  id: number;
  ciclo_id: number;
  estanque_id: number;
  fecha_siembra: string;
  densidad_inicial_m2: number;
  peso_inicial_promedio_g: number;
  estado: string;
}

export interface Biometria {
  id: number;
  ciclo_estanque_id: number;
  fecha: string;
  numero_muestra: number;
  peso_total_muestra_g: number;
  peso_promedio_g: number;
  observaciones: string;
  registrado_por_id: number;
}

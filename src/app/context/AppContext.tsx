import React, { createContext, useContext, useState } from 'react';
import type { Usuario, Estanque, Ciclo, CicloEstanque, Biometria } from '../types';

const initialUsuarios: Usuario[] = [
  { id: 1, nombre: 'Ana Torres', correo: 'ana@acuicola.mx', rol: 'administrador', creado_en: '2025-01-10' },
  { id: 2, nombre: 'Luis Pérez', correo: 'luis@acuicola.mx', rol: 'usuario', creado_en: '2025-02-15' },
  { id: 3, nombre: 'María García', correo: 'maria@acuicola.mx', rol: 'usuario', creado_en: '2025-03-20' },
];

const initialEstanques: Estanque[] = [
  { id: 1, nombre: 'Estanque Norte 1', ubicacion: 'Granja A - Lote Norte', superficie_m2: 1200, estado: 'activo', creado_en: '2025-01-05' },
  { id: 2, nombre: 'Estanque Norte 2', ubicacion: 'Granja A - Lote Norte', superficie_m2: 1100, estado: 'activo', creado_en: '2025-01-05' },
  { id: 3, nombre: 'Estanque Sur 1', ubicacion: 'Granja A - Lote Sur', superficie_m2: 950, estado: 'activo', creado_en: '2025-02-10' },
  { id: 4, nombre: 'Estanque Sur 2', ubicacion: 'Granja A - Lote Sur', superficie_m2: 1050, estado: 'inactivo', creado_en: '2025-02-10' },
];

const initialCiclos: Ciclo[] = [
  { id: 1, nombre: 'Ciclo 2026-01', fecha_inicio: '2026-01-15', fecha_fin: null, estado: 'activo', creado_en: '2026-01-15' },
  { id: 2, nombre: 'Ciclo 2025-02', fecha_inicio: '2025-06-01', fecha_fin: '2025-11-30', estado: 'finalizado', creado_en: '2025-06-01' },
];

const initialCicloEstanques: CicloEstanque[] = [
  { id: 101, ciclo_id: 1, estanque_id: 1, fecha_siembra: '2026-01-20', densidad_inicial_m2: 120, peso_inicial_promedio_g: 0.8, estado: 'activo' },
  { id: 102, ciclo_id: 1, estanque_id: 3, fecha_siembra: '2026-01-22', densidad_inicial_m2: 110, peso_inicial_promedio_g: 0.9, estado: 'activo' },
  { id: 103, ciclo_id: 2, estanque_id: 2, fecha_siembra: '2025-06-05', densidad_inicial_m2: 100, peso_inicial_promedio_g: 1.0, estado: 'finalizado' },
];

const initialBiometrias: Biometria[] = [
  { id: 1, ciclo_estanque_id: 101, fecha: '2026-02-10', numero_muestra: 100, peso_total_muestra_g: 3500, peso_promedio_g: 35.0, observaciones: 'Muestreo semanal', registrado_por_id: 1 },
  { id: 2, ciclo_estanque_id: 101, fecha: '2026-02-17', numero_muestra: 100, peso_total_muestra_g: 4200, peso_promedio_g: 42.0, observaciones: 'Buen crecimiento', registrado_por_id: 1 },
  { id: 3, ciclo_estanque_id: 101, fecha: '2026-02-24', numero_muestra: 120, peso_total_muestra_g: 4800, peso_promedio_g: 40.0, observaciones: 'Muestreo semanal', registrado_por_id: 1 },
  { id: 4, ciclo_estanque_id: 102, fecha: '2026-02-12', numero_muestra: 80, peso_total_muestra_g: 2640, peso_promedio_g: 33.0, observaciones: '', registrado_por_id: 2 },
  { id: 5, ciclo_estanque_id: 102, fecha: '2026-02-19', numero_muestra: 80, peso_total_muestra_g: 2960, peso_promedio_g: 37.0, observaciones: 'Progreso normal', registrado_por_id: 2 },
  { id: 6, ciclo_estanque_id: 103, fecha: '2025-07-10', numero_muestra: 120, peso_total_muestra_g: 3960, peso_promedio_g: 33.0, observaciones: 'Normal', registrado_por_id: 1 },
];

interface AppContextType {
  currentUser: Usuario | null;
  login: (correo: string, password: string) => boolean;
  logout: () => void;
  usuarios: Usuario[];
  addUsuario: (u: Omit<Usuario, 'id' | 'creado_en'>) => void;
  updateUsuario: (id: number, u: Partial<Usuario>) => void;
  deleteUsuario: (id: number) => void;
  estanques: Estanque[];
  addEstanque: (e: Omit<Estanque, 'id' | 'creado_en'>) => void;
  updateEstanque: (id: number, e: Partial<Estanque>) => void;
  deleteEstanque: (id: number) => void;
  ciclos: Ciclo[];
  addCiclo: (c: Omit<Ciclo, 'id' | 'creado_en'>) => void;
  updateCiclo: (id: number, c: Partial<Ciclo>) => void;
  deleteCiclo: (id: number) => void;
  finalizarCiclo: (id: number) => void;
  cicloEstanques: CicloEstanque[];
  addCicloEstanque: (ce: Omit<CicloEstanque, 'id'>) => void;
  updateCicloEstanque: (id: number, ce: Partial<CicloEstanque>) => void;
  deleteCicloEstanque: (id: number) => void;
  finalizarCicloEstanque: (id: number) => void;
  biometrias: Biometria[];
  addBiometria: (b: Omit<Biometria, 'id' | 'peso_promedio_g'>) => void;
  updateBiometria: (id: number, b: Partial<Biometria>) => void;
  deleteBiometria: (id: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('datashrimp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [estanques, setEstanques] = useState<Estanque[]>(initialEstanques);
  const [ciclos, setCiclos] = useState<Ciclo[]>(initialCiclos);
  const [cicloEstanques, setCicloEstanques] = useState<CicloEstanque[]>(initialCicloEstanques);
  const [biometrias, setBiometrias] = useState<Biometria[]>(initialBiometrias);

  const login = (correo: string, _password: string): boolean => {
    const user = usuarios.find(u => u.correo === correo);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('datashrimp_user', JSON.stringify(user));
      return true;
    }
    // Allow login with any valid email format for demo
    if (correo.includes('@') && _password.length >= 4) {
      const demo = usuarios[0];
      setCurrentUser(demo);
      localStorage.setItem('datashrimp_user', JSON.stringify(demo));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('datashrimp_user');
  };

  // Usuarios
  const addUsuario = (u: Omit<Usuario, 'id' | 'creado_en'>) => {
    const id = Math.max(...usuarios.map(x => x.id), 0) + 1;
    setUsuarios(prev => [...prev, { ...u, id, creado_en: new Date().toISOString().split('T')[0] }]);
  };
  const updateUsuario = (id: number, u: Partial<Usuario>) =>
    setUsuarios(prev => prev.map(x => x.id === id ? { ...x, ...u } : x));
  const deleteUsuario = (id: number) =>
    setUsuarios(prev => prev.filter(x => x.id !== id));

  // Estanques
  const addEstanque = (e: Omit<Estanque, 'id' | 'creado_en'>) => {
    const id = Math.max(...estanques.map(x => x.id), 0) + 1;
    setEstanques(prev => [...prev, { ...e, id, creado_en: new Date().toISOString().split('T')[0] }]);
  };
  const updateEstanque = (id: number, e: Partial<Estanque>) =>
    setEstanques(prev => prev.map(x => x.id === id ? { ...x, ...e } : x));
  const deleteEstanque = (id: number) =>
    setEstanques(prev => prev.filter(x => x.id !== id));

  // Ciclos
  const addCiclo = (c: Omit<Ciclo, 'id' | 'creado_en'>) => {
    const id = Math.max(...ciclos.map(x => x.id), 0) + 1;
    setCiclos(prev => [...prev, { ...c, id, creado_en: new Date().toISOString().split('T')[0] }]);
  };
  const updateCiclo = (id: number, c: Partial<Ciclo>) =>
    setCiclos(prev => prev.map(x => x.id === id ? { ...x, ...c } : x));
  const deleteCiclo = (id: number) =>
    setCiclos(prev => prev.filter(x => x.id !== id));
  const finalizarCiclo = (id: number) =>
    setCiclos(prev => prev.map(x => x.id === id ? { ...x, estado: 'finalizado', fecha_fin: new Date().toISOString().split('T')[0] } : x));

  // CicloEstanques
  const addCicloEstanque = (ce: Omit<CicloEstanque, 'id'>) => {
    const id = Math.max(...cicloEstanques.map(x => x.id), 100) + 1;
    setCicloEstanques(prev => [...prev, { ...ce, id }]);
  };
  const updateCicloEstanque = (id: number, ce: Partial<CicloEstanque>) =>
    setCicloEstanques(prev => prev.map(x => x.id === id ? { ...x, ...ce } : x));
  const deleteCicloEstanque = (id: number) =>
    setCicloEstanques(prev => prev.filter(x => x.id !== id));
  const finalizarCicloEstanque = (id: number) =>
    setCicloEstanques(prev => prev.map(x => x.id === id ? { ...x, estado: 'finalizado' } : x));

  // Biometrias
  const addBiometria = (b: Omit<Biometria, 'id' | 'peso_promedio_g'>) => {
    const id = Math.max(...biometrias.map(x => x.id), 0) + 1;
    const peso_promedio_g = b.numero_muestra > 0 ? parseFloat((b.peso_total_muestra_g / b.numero_muestra).toFixed(2)) : 0;
    setBiometrias(prev => [...prev, { ...b, id, peso_promedio_g }]);
  };
  const updateBiometria = (id: number, b: Partial<Biometria>) =>
    setBiometrias(prev => prev.map(x => {
      if (x.id !== id) return x;
      const updated = { ...x, ...b };
      if (b.peso_total_muestra_g !== undefined || b.numero_muestra !== undefined) {
        updated.peso_promedio_g = updated.numero_muestra > 0
          ? parseFloat((updated.peso_total_muestra_g / updated.numero_muestra).toFixed(2))
          : 0;
      }
      return updated;
    }));
  const deleteBiometria = (id: number) =>
    setBiometrias(prev => prev.filter(x => x.id !== id));

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      usuarios, addUsuario, updateUsuario, deleteUsuario,
      estanques, addEstanque, updateEstanque, deleteEstanque,
      ciclos, addCiclo, updateCiclo, deleteCiclo, finalizarCiclo,
      cicloEstanques, addCicloEstanque, updateCicloEstanque, deleteCicloEstanque, finalizarCicloEstanque,
      biometrias, addBiometria, updateBiometria, deleteBiometria,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

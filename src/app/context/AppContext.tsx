import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Biometria, Ciclo, CicloEstanque, Estanque, Usuario } from '../types';
import * as authService from '../../services/authService';
import * as usuarioService from '../../services/usuarioService';
import * as estanqueService from '../../services/estanqueService';
import * as cicloService from '../../services/cicloService';
import * as cicloEstanqueService from '../../services/cicloEstanqueService';
import * as biometriaService from '../../services/biometriaService';

type AppContextType = {
  currentUser: Usuario | null;
  authLoading: boolean;
  authError: string;
  dataLoading: boolean;
  dataError: string;
  login: (correo: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshData: () => Promise<void>;
  usuarios: Usuario[];
  addUsuario: (u: { nombre: string; correo: string; rol: string; password: string }) => Promise<void>;
  updateUsuario: (id: number, u: Partial<Usuario> & { password?: string }) => Promise<void>;
  deleteUsuario: (id: number) => Promise<void>;
  estanques: Estanque[];
  addEstanque: (e: Omit<Estanque, 'id' | 'creado_en'>) => Promise<void>;
  updateEstanque: (id: number, e: Partial<Estanque>) => Promise<void>;
  deleteEstanque: (id: number) => Promise<void>;
  ciclos: Ciclo[];
  addCiclo: (c: Omit<Ciclo, 'id' | 'creado_en'>) => Promise<void>;
  updateCiclo: (id: number, c: Partial<Ciclo>) => Promise<void>;
  deleteCiclo: (id: number) => Promise<void>;
  finalizarCiclo: (id: number) => Promise<void>;
  cicloEstanques: CicloEstanque[];
  addCicloEstanque: (ce: Omit<CicloEstanque, 'id'>) => Promise<void>;
  updateCicloEstanque: (id: number, ce: Partial<CicloEstanque>) => Promise<void>;
  deleteCicloEstanque: (id: number) => Promise<void>;
  finalizarCicloEstanque: (id: number) => Promise<void>;
  biometrias: Biometria[];
  addBiometria: (b: Omit<Biometria, 'id' | 'peso_promedio_g' | 'registrado_por_id'>) => Promise<void>;
  updateBiometria: (id: number, b: Partial<Biometria>) => Promise<void>;
  deleteBiometria: (id: number) => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

function getMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estanques, setEstanques] = useState<Estanque[]>([]);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [cicloEstanques, setCicloEstanques] = useState<CicloEstanque[]>([]);
  const [biometrias, setBiometrias] = useState<Biometria[]>([]);

  const refreshData = async () => {
    if (!authService.hasToken()) return;
    setDataLoading(true);
    setDataError('');
    try {
      const [usuariosRes, estanquesRes, ciclosRes, biometriasRes] = await Promise.all([
        usuarioService.listUsuarios(),
        estanqueService.listEstanques(),
        cicloService.listCiclos(),
        biometriaService.listBiometrias(),
      ]);

      setUsuarios(usuariosRes);
      setEstanques(estanquesRes);
      setCiclos(ciclosRes);
      setBiometrias(biometriasRes);

      const cicloEstanquesRes = await cicloEstanqueService.listAllCicloEstanques(ciclosRes);
      setCicloEstanques(cicloEstanquesRes);
    } catch (error) {
      setDataError(getMessage(error));
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!authService.hasToken()) {
        setAuthLoading(false);
        return;
      }
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          authService.logout();
          setCurrentUser(null);
        } else {
          setCurrentUser(user);
          localStorage.setItem('datashrimp_user', JSON.stringify(user));
          await refreshData();
        }
      } catch {
        authService.logout();
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = async (correo: string, password: string): Promise<boolean> => {
    setAuthError('');
    try {
      await authService.login({ correo, password });
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('No fue posible obtener el usuario autenticado');
      }
      setCurrentUser(user);
      localStorage.setItem('datashrimp_user', JSON.stringify(user));
      await refreshData();
      return true;
    } catch (error) {
      authService.logout();
      setCurrentUser(null);
      setAuthError(getMessage(error));
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setUsuarios([]);
    setEstanques([]);
    setCiclos([]);
    setCicloEstanques([]);
    setBiometrias([]);
    localStorage.removeItem('datashrimp_user');
  };

  const addUsuario: AppContextType['addUsuario'] = async (u) => {
    const created = await usuarioService.createUsuario(u);
    setUsuarios((prev) => [...prev, created]);
  };

  const updateUsuario: AppContextType['updateUsuario'] = async (id, u) => {
    const payload: { nombre?: string; correo?: string; rol?: string; password?: string } = {};
    if (u.nombre !== undefined) payload.nombre = u.nombre;
    if (u.correo !== undefined) payload.correo = u.correo;
    if (u.rol !== undefined) payload.rol = u.rol;
    if (u.password !== undefined) payload.password = u.password;
    const updated = await usuarioService.updateUsuario(id, payload);
    setUsuarios((prev) => prev.map((item) => (item.id === id ? updated : item)));
    if (currentUser?.id === id) {
      setCurrentUser(updated);
      localStorage.setItem('datashrimp_user', JSON.stringify(updated));
    }
  };

  const deleteUsuario: AppContextType['deleteUsuario'] = async (id) => {
    await usuarioService.deleteUsuario(id);
    setUsuarios((prev) => prev.filter((item) => item.id !== id));
  };

  const addEstanque: AppContextType['addEstanque'] = async (e) => {
    const created = await estanqueService.createEstanque(e);
    setEstanques((prev) => [...prev, created]);
  };

  const updateEstanque: AppContextType['updateEstanque'] = async (id, e) => {
    const updated = await estanqueService.updateEstanque(id, e);
    setEstanques((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const deleteEstanque: AppContextType['deleteEstanque'] = async (id) => {
    await estanqueService.deleteEstanque(id);
    setEstanques((prev) => prev.filter((item) => item.id !== id));
    setCicloEstanques((prev) => prev.filter((item) => item.estanque_id !== id));
  };

  const addCiclo: AppContextType['addCiclo'] = async (c) => {
    const created = await cicloService.createCiclo(c);
    setCiclos((prev) => [...prev, created]);
  };

  const updateCiclo: AppContextType['updateCiclo'] = async (id, c) => {
    const updated = await cicloService.updateCiclo(id, c);
    setCiclos((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const deleteCiclo: AppContextType['deleteCiclo'] = async (id) => {
    await cicloService.deleteCiclo(id);
    setCiclos((prev) => prev.filter((item) => item.id !== id));
    setCicloEstanques((prev) => prev.filter((item) => item.ciclo_id !== id));
  };

  const finalizarCiclo: AppContextType['finalizarCiclo'] = async (id) => {
    const updated = await cicloService.finalizarCiclo(id);
    setCiclos((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const addCicloEstanque: AppContextType['addCicloEstanque'] = async (ce) => {
    const created = await cicloEstanqueService.createCicloEstanque({
      id_ciclo: ce.ciclo_id,
      id_estanque: ce.estanque_id,
      fecha_siembra: ce.fecha_siembra,
      densidad_inicial_m2: ce.densidad_inicial_m2,
      peso_inicial_promedio_g: ce.peso_inicial_promedio_g ?? null,
      estado: ce.estado,
    });
    setCicloEstanques((prev) => [...prev, created]);
  };

  const updateCicloEstanque: AppContextType['updateCicloEstanque'] = async (id, ce) => {
    const updated = await cicloEstanqueService.updateCicloEstanque(id, {
      fecha_siembra: ce.fecha_siembra,
      densidad_inicial_m2: ce.densidad_inicial_m2,
      peso_inicial_promedio_g: ce.peso_inicial_promedio_g,
      estado: ce.estado,
    });
    setCicloEstanques((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const deleteCicloEstanque: AppContextType['deleteCicloEstanque'] = async (id) => {
    await cicloEstanqueService.deleteCicloEstanque(id);
    setCicloEstanques((prev) => prev.filter((item) => item.id !== id));
    setBiometrias((prev) => prev.filter((item) => item.ciclo_estanque_id !== id));
  };

  const finalizarCicloEstanque: AppContextType['finalizarCicloEstanque'] = async (id) => {
    const updated = await cicloEstanqueService.finalizarCicloEstanque(id);
    setCicloEstanques((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const addBiometria: AppContextType['addBiometria'] = async (b) => {
    const created = await biometriaService.createBiometria({
      id_ciclo_estanque: b.ciclo_estanque_id,
      fecha: b.fecha,
      numero_muestra: b.numero_muestra,
      peso_total_muestra_g: b.peso_total_muestra_g,
      agua_temperatura: b.agua_temperatura,
      agua_salinidad: b.agua_salinidad,
      agua_oxigeno: b.agua_oxigeno,
      observaciones: b.observaciones,
    });
    setBiometrias((prev) => [...prev, created]);
  };

  const updateBiometria: AppContextType['updateBiometria'] = async (id, b) => {
    const updated = await biometriaService.updateBiometria(id, {
      id_ciclo_estanque: b.ciclo_estanque_id,
      fecha: b.fecha,
      numero_muestra: b.numero_muestra,
      peso_total_muestra_g: b.peso_total_muestra_g,
      agua_temperatura: b.agua_temperatura,
      agua_salinidad: b.agua_salinidad,
      agua_oxigeno: b.agua_oxigeno,
      observaciones: b.observaciones,
    });
    setBiometrias((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const deleteBiometria: AppContextType['deleteBiometria'] = async (id) => {
    await biometriaService.deleteBiometria(id);
    setBiometrias((prev) => prev.filter((item) => item.id !== id));
  };

  const value = useMemo<AppContextType>(
    () => ({
      currentUser,
      authLoading,
      authError,
      dataLoading,
      dataError,
      login,
      logout,
      refreshData,
      usuarios,
      addUsuario,
      updateUsuario,
      deleteUsuario,
      estanques,
      addEstanque,
      updateEstanque,
      deleteEstanque,
      ciclos,
      addCiclo,
      updateCiclo,
      deleteCiclo,
      finalizarCiclo,
      cicloEstanques,
      addCicloEstanque,
      updateCicloEstanque,
      deleteCicloEstanque,
      finalizarCicloEstanque,
      biometrias,
      addBiometria,
      updateBiometria,
      deleteBiometria,
    }),
    [currentUser, authLoading, authError, dataLoading, dataError, usuarios, estanques, ciclos, cicloEstanques, biometrias],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

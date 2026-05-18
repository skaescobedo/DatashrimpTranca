import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Usuarios } from './pages/Usuarios';
import { Estanques } from './pages/Estanques';
import { Ciclos } from './pages/Ciclos';
import { CicloDetalle } from './pages/CicloDetalle';
import { AsociarEstanque } from './pages/AsociarEstanque';
import { Biometrias } from './pages/Biometrias';
import { RegistroBiometria } from './pages/RegistroBiometria';
import { CicloEstanqueDetalle } from './pages/CicloEstanqueDetalle';
import Reportes from './pages/Reportes';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', Component: Dashboard },
      { path: 'usuarios', Component: Usuarios },
      { path: 'estanques', Component: Estanques },
      { path: 'ciclos', Component: Ciclos },
      { path: 'ciclos/:cicloId', Component: CicloDetalle },
      { path: 'ciclos/:cicloId/asociar', Component: AsociarEstanque },
      { path: 'biometrias', Component: Biometrias },
      { path: 'biometrias/nuevo', Component: RegistroBiometria },
      { path: 'biometrias/:biometriaId', Component: RegistroBiometria },
      { path: 'biometrias/:biometriaId/editar', Component: RegistroBiometria },
      { path: 'ciclo-estanque/:ceId', Component: CicloEstanqueDetalle },
      { path: 'reportes', Component: Reportes },
    ],
  },
]);

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router';
import {
  LayoutDashboard, Users, Waves, RefreshCw, Activity,
  LogOut, Menu, X, Fish, ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/estanques', icon: Waves, label: 'Estanques' },
  { to: '/ciclos', icon: RefreshCw, label: 'Ciclos' },
  { to: '/biometrias', icon: Activity, label: 'Biometrías' },
];

export function Layout() {
  const { currentUser, logout, authLoading } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50 text-slate-500">
        Validando sesión...
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = currentUser.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-sky-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ width: '240px', backgroundColor: '#0c2d4e', minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl" style={{ backgroundColor: '#0e7490' }}>
            <Fish className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm" style={{ fontWeight: 700, letterSpacing: '0.02em' }}>Shrimplytics</p>
            <p className="text-xs" style={{ color: '#7dd3fc' }}>Control de Cultivo</p>
          </div>
          <button
            className="ml-auto text-white/60 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group
                ${isActive
                  ? 'text-white'
                  : 'text-sky-200 hover:text-white hover:bg-white/10'
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: '#0e7490', fontWeight: 500 } : {}}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"
              style={{ backgroundColor: '#0e7490', color: 'white', fontWeight: 600 }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 500 }}>{currentUser.nombre}</p>
              <p className="text-xs truncate" style={{ color: '#7dd3fc' }}>{currentUser.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full mt-1 transition-all"
            style={{ color: '#f87171' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-100 shadow-sm">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{currentUser.nombre}</p>
              <p className="text-xs text-slate-500 capitalize">{currentUser.rol}</p>
            </div>
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ backgroundColor: '#0e7490', color: 'white', fontWeight: 600 }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

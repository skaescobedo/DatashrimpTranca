import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Fish, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Login() {
  const { login, currentUser, authLoading, authError } = useApp();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (currentUser) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!correo || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    const ok = await login(correo, password);
    if (ok) {
      navigate('/dashboard');
    } else {
      setError(authError || 'Credenciales incorrectas. Inténtalo de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: 'linear-gradient(135deg, #0c2d4e 0%, #0e4d6e 40%, #0a7ea4 100%)',
      }}
    >
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-12 text-white">
        <div className="max-w-sm text-center">
          <div
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
          >
            <Fish className="h-10 w-10 text-white" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>DataShrimp</h1>
          <p className="mt-3 text-sky-200" style={{ fontSize: '1.05rem' }}>
            Sistema de control y administración para el cultivo de camarón.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'Usuarios activos', val: '3' },
              { label: 'Estanques', val: '4' },
              { label: 'Ciclos activos', val: '1' },
              { label: 'Biometrías este mes', val: '5' },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="rounded-2xl p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
              >
                <p className="text-sky-200 text-xs">{label}</p>
                <p className="text-white mt-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div
              className="flex items-center justify-center h-10 w-10 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Fish className="h-6 w-6 text-white" />
            </div>
            <span className="text-white" style={{ fontWeight: 700, fontSize: '1.2rem' }}>DataShrimp</span>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-slate-800 mb-1" style={{ fontWeight: 700, fontSize: '1.4rem' }}>Iniciar sesión</h2>
            <p className="text-slate-500 text-sm mb-7">Accede con tu cuenta registrada</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                    placeholder="correo@empresa.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': '#0e7490' } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPass(p => !p)}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white text-sm transition-all mt-2"
                style={{
                  backgroundColor: loading ? '#7dd3fc' : '#0e7490',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Verificando...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-5 p-3 rounded-xl text-xs text-slate-500" style={{ backgroundColor: '#f0f9ff' }}>
              Accede con un usuario real registrado en la API.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

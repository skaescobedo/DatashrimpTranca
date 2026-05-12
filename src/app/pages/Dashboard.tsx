import React from 'react';
import { useNavigate } from 'react-router';
import { Users, Waves, RefreshCw, Activity, ArrowRight, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/Badge';

export function Dashboard() {
  const { usuarios, estanques, ciclos, biometrias, cicloEstanques, dataLoading, dataError } = useApp();
  const navigate = useNavigate();

  const usuariosActivos = usuarios.length;
  const estanquesActivos = estanques.filter(e => e.estado === 'activo').length;
  const ciclosActivos = ciclos.filter(c => c.estado === 'activo').length;
  const biometriasMes = biometrias.filter(b => b.fecha.startsWith('2026-02')).length;

  const recentBiometrias = [...biometrias]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 5);

  const chartData = [...biometrias]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-8)
    .map((item) => ({
      semana: item.fecha.slice(5),
      peso_prom: item.peso_promedio_g,
    }));

  const getCicloEstanqueInfo = (ceId: number) => {
    const ce = cicloEstanques.find(x => x.id === ceId);
    if (!ce) return { ciclo: '-', estanque: '-' };
    const ciclo = ciclos.find(c => c.id === ce.ciclo_id);
    const estanque = estanques.find(e => e.id === ce.estanque_id);
    return { ciclo: ciclo?.nombre || '-', estanque: estanque?.nombre || '-' };
  };

  const getUsuario = (id: number) => usuarios.find(u => u.id === id)?.nombre || '-';

  const stats = [
    { label: 'Usuarios activos', value: usuariosActivos, icon: Users, color: '#0e7490', bg: '#e0f2fe' },
    { label: 'Estanques activos', value: estanquesActivos, icon: Waves, color: '#059669', bg: '#d1fae5' },
    { label: 'Ciclos activos', value: ciclosActivos, icon: RefreshCw, color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Biometrías del mes', value: biometriasMes, icon: Activity, color: '#d97706', bg: '#fef3c7' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Resumen general del sistema</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{label}</p>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Tendencia de Peso Promedio</h3>
               <p className="text-xs text-slate-400 mt-0.5">Últimos registros de biometría</p>
             </div>
            <TrendingUp className="h-5 w-5 text-cyan-500" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(val: number) => [`${val} g`, 'Peso prom.']}
                />
                <Line
                  type="monotone"
                  dataKey="peso_prom"
                  stroke="#0e7490"
                  strokeWidth={2.5}
                  dot={{ fill: '#0e7490', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
              Sin datos de biometría para graficar.
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Acciones rápidas</h3>
          <button
            onClick={() => navigate('/ciclos')}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all hover:opacity-90 text-white"
            style={{ backgroundColor: '#0e7490' }}
          >
            <span style={{ fontWeight: 500 }}>Ir a Ciclos</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/biometrias')}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all hover:opacity-90 text-white"
            style={{ backgroundColor: '#059669' }}
          >
            <span style={{ fontWeight: 500 }}>Ir a Biometrías</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/estanques')}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <span style={{ fontWeight: 500 }}>Ver Estanques</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/usuarios')}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <span style={{ fontWeight: 500 }}>Gestionar Usuarios</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Recent biometrics table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Biometrías recientes</h3>
          <button
            onClick={() => navigate('/biometrias')}
            className="text-sm flex items-center gap-1 hover:underline"
            style={{ color: '#0e7490' }}
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Fecha', 'Ciclo', 'Estanque', 'N° Muestra', 'Peso Total (g)', 'Peso Prom. (g)', 'Registrado por'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">
                    Cargando datos...
                  </td>
                </tr>
              )}
              {!dataLoading && dataError && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-red-500 text-sm">
                    {dataError}
                  </td>
                </tr>
              )}
              {!dataLoading && !dataError && recentBiometrias.map(b => {
                const { ciclo, estanque } = getCicloEstanqueInfo(b.ciclo_estanque_id);
                return (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-700">{b.fecha}</td>
                    <td className="px-5 py-3.5 text-slate-600">{ciclo}</td>
                    <td className="px-5 py-3.5 text-slate-600">{estanque}</td>
                    <td className="px-5 py-3.5 text-slate-700">{b.numero_muestra}</td>
                    <td className="px-5 py-3.5 text-slate-700">{b.peso_total_muestra_g.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-cyan-700" style={{ fontWeight: 600 }}>{b.peso_promedio_g.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{getUsuario(b.registrado_por_id)}</td>
                  </tr>
                );
              })}
              {!dataLoading && !dataError && recentBiometrias.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">
                    No hay biometrías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AsociarEstanque() {
  const { cicloId } = useParams<{ cicloId: string }>();
  const navigate = useNavigate();
  const { ciclos, estanques, cicloEstanques, addCicloEstanque, currentUser } = useApp();

  const id = Number(cicloId);
  const ciclo = ciclos.find(c => c.id === id);

  // Estanques already in this cycle
  const estanquesEnCiclo = cicloEstanques.filter(ce => ce.ciclo_id === id).map(ce => ce.estanque_id);
  const estanquesDisponibles = estanques.filter(e => e.estado === 'activo' && !estanquesEnCiclo.includes(e.id));

  const [form, setForm] = useState({
    estanque_id: estanquesDisponibles[0]?.id ? String(estanquesDisponibles[0].id) : '',
    fecha_siembra: '',
    densidad_inicial_m2: '',
    peso_inicial_promedio_g: '',
    estado: 'activo' as 'activo' | 'finalizado',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!ciclo) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500">Ciclo no encontrado.</p>
        <button onClick={() => navigate('/ciclos')} className="text-cyan-600 hover:underline text-sm">Volver a ciclos</button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.estanque_id || !form.fecha_siembra || !form.densidad_inicial_m2) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    const estId = Number(form.estanque_id);
    // Check if already associated
    const yaAsociado = cicloEstanques.some(ce => ce.ciclo_id === id && ce.estanque_id === estId);
    if (yaAsociado) {
      setError('Este estanque ya está asociado a este ciclo.');
      return;
    }

    addCicloEstanque({
      ciclo_id: id,
      estanque_id: estId,
      fecha_siembra: form.fecha_siembra,
      densidad_inicial_m2: parseFloat(form.densidad_inicial_m2),
      peso_inicial_promedio_g: form.peso_inicial_promedio_g ? parseFloat(form.peso_inicial_promedio_g) : 0,
      estado: form.estado,
    });
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d1fae5' }}>
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <p className="text-slate-800" style={{ fontWeight: 600 }}>¡Estanque asociado exitosamente!</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/ciclos/${id}`)}
            className="px-5 py-2.5 rounded-xl text-white text-sm"
            style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
          >
            Ver ciclo
          </button>
          <button
            onClick={() => { setSuccess(false); setForm({ estanque_id: '', fecha_siembra: '', densidad_inicial_m2: '', peso_inicial_promedio_g: '', estado: 'activo' }); }}
            className="px-5 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Asociar otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => navigate(`/ciclos/${id}`)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al detalle del ciclo
      </button>

      {/* Header */}
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Asociar estanque</h1>
        <p className="text-slate-500 text-sm mt-0.5">Agrega un estanque al ciclo <strong>{ciclo.nombre}</strong></p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* Ciclo info */}
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6" style={{ backgroundColor: '#f0f9ff' }}>
          <div>
            <p className="text-xs text-slate-500">Ciclo seleccionado</p>
            <p className="text-slate-800" style={{ fontWeight: 600 }}>{ciclo.nombre}</p>
            <p className="text-xs text-slate-500 mt-0.5">Inicio: {ciclo.fecha_inicio}</p>
          </div>
        </div>

        {estanquesDisponibles.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-800">No hay estanques activos disponibles para asociar. Todos los estanques activos ya están en este ciclo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
                Estanque <span className="text-red-400">*</span>
              </label>
              <select
                value={form.estanque_id}
                onChange={e => setForm(f => ({ ...f, estanque_id: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              >
                <option value="">Seleccionar estanque...</option>
                {estanquesDisponibles.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} — {e.ubicacion} ({e.superficie_m2} m²)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
                Fecha de siembra <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.fecha_siembra}
                onChange={e => setForm(f => ({ ...f, fecha_siembra: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
                Densidad inicial (org/m²) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.densidad_inicial_m2}
                onChange={e => setForm(f => ({ ...f, densidad_inicial_m2: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
                placeholder="120"
                min={0}
                step={0.1}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
                Peso inicial promedio (g) <span className="text-slate-400">(opcional)</span>
              </label>
              <input
                type="number"
                value={form.peso_inicial_promedio_g}
                onChange={e => setForm(f => ({ ...f, peso_inicial_promedio_g: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
                placeholder="0.8"
                min={0}
                step={0.01}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Estado</label>
              <select
                value={form.estado}
                onChange={e => setForm(f => ({ ...f, estado: e.target.value as 'activo' | 'finalizado' }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              >
                <option value="activo">Activo</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/ciclos/${id}`)}
                className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-sm text-white transition-colors"
                style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
              >
                Asociar estanque
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

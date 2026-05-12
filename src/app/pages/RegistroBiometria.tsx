import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, AlertCircle, CheckCircle2, Calculator } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function RegistroBiometria() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cicloEstanques, ciclos, estanques, addBiometria } = useApp();

  const defaultCE = searchParams.get('ceId') || '';

  const [form, setForm] = useState({
    ciclo_estanque_id: defaultCE,
    fecha: new Date().toISOString().split('T')[0],
    numero_muestra: '',
    peso_total_muestra_g: '',
    observaciones: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Only active ciclo-estanques
  const ceOptions = cicloEstanques.map(ce => {
    const ciclo = ciclos.find(c => c.id === ce.ciclo_id);
    const estanque = estanques.find(e => e.id === ce.estanque_id);
    return { ce, label: `${ciclo?.nombre || '?'} — ${estanque?.nombre || '?'}` };
  });

  const pesoProm = useMemo(() => {
    const n = Number(form.numero_muestra);
    const t = Number(form.peso_total_muestra_g);
    if (n > 0 && t > 0) return (t / n).toFixed(2);
    return null;
  }, [form.numero_muestra, form.peso_total_muestra_g]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.ciclo_estanque_id || !form.fecha || !form.numero_muestra || !form.peso_total_muestra_g) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }
    if (Number(form.numero_muestra) <= 0) {
      setError('El número de muestra debe ser mayor a 0.');
      return;
    }
    if (Number(form.peso_total_muestra_g) <= 0) {
      setError('El peso total de la muestra debe ser mayor a 0.');
      return;
    }

    try {
      await addBiometria({
        ciclo_estanque_id: Number(form.ciclo_estanque_id),
        fecha: form.fecha,
        numero_muestra: Number(form.numero_muestra),
        peso_total_muestra_g: Number(form.peso_total_muestra_g),
        observaciones: form.observaciones,
      });
      setSuccess(true);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'No fue posible registrar la biometría.');
    }
  };

  const ceSeleccionado = cicloEstanques.find(ce => ce.id === Number(form.ciclo_estanque_id));

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d1fae5' }}>
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <p className="text-slate-800" style={{ fontWeight: 600 }}>¡Biometría registrada exitosamente!</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/biometrias')}
            className="px-5 py-2.5 rounded-xl text-white text-sm"
            style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
          >
            Ver biometrías
          </button>
          {ceSeleccionado && (
            <button
              onClick={() => navigate(`/ciclo-estanque/${ceSeleccionado.id}`)}
              className="px-5 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Ver ciclo-estanque
            </button>
          )}
          <button
            onClick={() => {
              setSuccess(false);
              setForm(f => ({ ...f, numero_muestra: '', peso_total_muestra_g: '', observaciones: '' }));
            }}
            className="px-5 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Registrar otra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => navigate('/biometrias')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a biometrías
      </button>

      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Registrar biometría</h1>
        <p className="text-slate-500 text-sm mt-0.5">Captura los datos de muestreo para un ciclo-estanque</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ciclo-estanque selector */}
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
              Ciclo - Estanque <span className="text-red-400">*</span>
            </label>
            <select
              value={form.ciclo_estanque_id}
              onChange={e => setForm(f => ({ ...f, ciclo_estanque_id: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
            >
              <option value="">Seleccionar ciclo-estanque...</option>
              {ceOptions.map(({ ce, label }) => (
                <option key={ce.id} value={ce.id}>#{ce.id} — {label}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
              Fecha <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.fecha}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
            />
          </div>

          {/* Número muestra */}
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
              Número de muestra <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={form.numero_muestra}
              onChange={e => setForm(f => ({ ...f, numero_muestra: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              placeholder="100"
              min={1}
            />
          </div>

          {/* Peso total */}
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
              Peso total de muestra (g) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={form.peso_total_muestra_g}
              onChange={e => setForm(f => ({ ...f, peso_total_muestra_g: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              placeholder="3500"
              min={0}
              step={0.1}
            />
          </div>

          {/* Peso promedio calculado */}
          <div>
            <label className="block text-sm text-slate-700 mb-1.5 flex items-center gap-2" style={{ fontWeight: 500 }}>
              <Calculator className="h-4 w-4 text-cyan-500" />
              Peso promedio (g) — <span className="text-slate-400" style={{ fontWeight: 400 }}>calculado automáticamente</span>
            </label>
            <div
              className="px-4 py-3 rounded-xl border text-sm"
              style={{
                backgroundColor: pesoProm ? '#ecfdf5' : '#f8fafc',
                borderColor: pesoProm ? '#a7f3d0' : '#e2e8f0',
                color: pesoProm ? '#065f46' : '#94a3b8',
                fontWeight: pesoProm ? 600 : 400,
              }}
            >
              {pesoProm ? `${pesoProm} g` : 'Se calculará al completar los campos anteriores'}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
              Observaciones <span className="text-slate-400">(opcional)</span>
            </label>
            <textarea
              value={form.observaciones}
              onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800 resize-none"
              placeholder="Muestreo semanal, condiciones del estanque, etc."
            />
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
              onClick={() => navigate('/biometrias')}
              className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm text-white transition-colors"
              style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
            >
              Guardar biometría
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

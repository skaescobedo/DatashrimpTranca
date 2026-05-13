import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, AlertCircle, CheckCircle2, Calculator, Droplet, Waves, Wind } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Biometria } from '../types';

export function RegistroBiometria() {
  const navigate = useNavigate();
  const { biometriaId } = useParams<{ biometriaId: string }>();
  const [searchParams] = useSearchParams();
  const { biometrias, cicloEstanques, ciclos, estanques, addBiometria, updateBiometria } = useApp();

  const defaultCE = searchParams.get('ceId') || '';
  const editId = biometriaId ? Number(biometriaId) : null;
  const biometriaEdit = editId !== null ? biometrias.find(b => b.id === editId) : null;
  const isEditing = Boolean(biometriaEdit);

  // Get today's date in local timezone (not UTC)
  const getLocalDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const [form, setForm] = useState({
    ciclo_estanque_id: defaultCE,
    fecha: getLocalDate(),
    numero_muestra: '',
    peso_total_muestra_g: '',
    observaciones: '',
    agua_temperatura: '',
    agua_salinidad: '',
    agua_oxigeno: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!biometriaEdit) return;
    setForm({
      ciclo_estanque_id: String(biometriaEdit.ciclo_estanque_id),
      fecha: biometriaEdit.fecha,
      numero_muestra: String(biometriaEdit.numero_muestra),
      peso_total_muestra_g: String(biometriaEdit.peso_total_muestra_g),
      observaciones: biometriaEdit.observaciones,
      agua_temperatura: String(biometriaEdit.agua_temperatura),
      agua_salinidad: String(biometriaEdit.agua_salinidad),
      agua_oxigeno: String(biometriaEdit.agua_oxigeno),
    });
  }, [biometriaEdit]);

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

    if (
      Number(form.agua_temperatura) <= 0 ||
      Number(form.agua_salinidad) <= 0 ||
      Number(form.agua_oxigeno) <= 0
    ) {
      setError('Los parámetros del agua deben ser mayores a 0.');
      return;
    }

    try {
      const payload = {
        ciclo_estanque_id: Number(form.ciclo_estanque_id),
        fecha: form.fecha,
        numero_muestra: Number(form.numero_muestra),
        peso_total_muestra_g: Number(form.peso_total_muestra_g),
        observaciones: form.observaciones,
        agua_temperatura: Number(form.agua_temperatura),
        agua_salinidad: Number(form.agua_salinidad),
        agua_oxigeno: Number(form.agua_oxigeno),
      };

      if (isEditing && biometriaEdit) {
        await updateBiometria(biometriaEdit.id, payload);
      } else {
        await addBiometria(payload);
      }
      setSuccess(true);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : isEditing ? 'No fue posible actualizar la biometría.' : 'No fue posible registrar la biometría.');
    }
  };

  const ceSeleccionado = cicloEstanques.find(ce => ce.id === Number(form.ciclo_estanque_id));

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d1fae5' }}>
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <p className="text-slate-800" style={{ fontWeight: 600 }}>{isEditing ? '¡Biometría actualizada exitosamente!' : '¡Biometría registrada exitosamente!'}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/biometrias')}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0a5a6f')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0e7490')}
            className="px-5 py-2.5 rounded-xl text-white text-sm cursor-pointer transition-colors"
            style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
          >
            Ver biometrías
          </button>
          {ceSeleccionado && (
            <button
              onClick={() => navigate(`/ciclo-estanque/${ceSeleccionado.id}`)}
              className="px-5 py-2.5 bg-white rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Ver ciclo-estanque
            </button>
          )}
          <button
            onClick={() => {
              setSuccess(false);
              setForm(f => ({ ...f, numero_muestra: '', peso_total_muestra_g: '', observaciones: '', agua_temperatura: '', agua_salinidad: '', agua_oxigeno: '' }));
            }}
            className="px-5 py-2.5 rounded-xl bg-white text-sm border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            Registrar otra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/biometrias')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a biometrías
      </button>

      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>{isEditing ? 'Editar biometría' : 'Registrar biometría'}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{isEditing ? 'Modifica los datos de muestreo de esta biometría' : 'Captura los datos de muestreo para un ciclo-estanque'}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
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

            <div className='hidden'>
              <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
                Observaciones <span className="text-slate-400">(opcional)</span>
              </label>
              <textarea
                value={form.observaciones}
                onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800 resize-none"
                placeholder="Muestreo semanal, condiciones del estanque, etc."
              />
            </div>

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

          </div>

          <div className="space-y-5">



            <div className="hidden">
              <label className="text-sm text-slate-700 mb-1.5 flex items-center gap-2" style={{ fontWeight: 500 }}>
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

            <div>
              <label className="text-sm text-slate-700 mb-1.5 flex items-center gap-2" style={{ fontWeight: 500 }}>
                <Droplet className="h-4 w-4 text-blue-500" />
                Temperatura del Agua (C°) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.agua_temperatura}
                onChange={e => setForm(f => ({ ...f, agua_temperatura: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
                placeholder="28"
                min={0}
                step={0.01}
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-1.5 flex items-center gap-2" style={{ fontWeight: 500 }}>
                <Waves className="h-4 w-4 text-cyan-500" />
                Salinidad (PPT) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.agua_salinidad}
                onChange={e => setForm(f => ({ ...f, agua_salinidad: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
                placeholder="25"
                min={0}
                step={0.01}
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-1.5 flex items-center gap-2" style={{ fontWeight: 500 }}>
                <Wind className="h-4 w-4 text-cyan-500" />
                Oxigeno Disuelto (mg/L) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.agua_oxigeno}
                onChange={e => setForm(f => ({ ...f, agua_oxigeno: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
                placeholder="5.5"
                min={0}
                step={0.01}
              />
            </div>
          </div>

          {error && (
            <div className="md:col-span-2 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="md:col-span-2 flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/biometrias')}
              className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm text-white transition-colors cursor-pointer"
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

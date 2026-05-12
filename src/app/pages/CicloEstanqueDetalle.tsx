import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Plus, Trash2, Pencil, CheckCircle, CalendarDays, Droplets, Weight, Hash } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import type { Biometria } from '../types';

export function CicloEstanqueDetalle() {
  const { ceId } = useParams<{ ceId: string }>();
  const navigate = useNavigate();
  const { cicloEstanques, ciclos, estanques, biometrias, usuarios, deleteBiometria, updateBiometria, finalizarCicloEstanque } = useApp();

  const id = Number(ceId);
  const ce = cicloEstanques.find(x => x.id === id);
  const ciclo = ce ? ciclos.find(c => c.id === ce.ciclo_id) : undefined;
  const estanque = ce ? estanques.find(e => e.id === ce.estanque_id) : undefined;
  const ceBiometrias = biometrias
    .filter(b => b.ciclo_estanque_id === id)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const [finalizarModal, setFinalizarModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; item: Biometria | null }>({ open: false, item: null });
  const [editForm, setEditForm] = useState({ fecha: '', numero_muestra: '', peso_total_muestra_g: '', observaciones: '' });
  const [actionError, setActionError] = useState('');

  if (!ce) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500">Ciclo-estanque no encontrado.</p>
        <button onClick={() => navigate('/ciclos')} className="text-cyan-600 hover:underline text-sm">Ir a ciclos</button>
      </div>
    );
  }

  const getUsuario = (id: number) => usuarios.find(u => u.id === id)?.nombre || '-';

  const openEdit = (b: Biometria) => {
    setEditForm({
      fecha: b.fecha,
      numero_muestra: String(b.numero_muestra),
      peso_total_muestra_g: String(b.peso_total_muestra_g),
      observaciones: b.observaciones,
    });
    setEditModal({ open: true, item: b });
  };

  const handleEditSave = async () => {
    if (!editModal.item) return;
    if (!editForm.fecha || Number(editForm.numero_muestra) <= 0 || Number(editForm.peso_total_muestra_g) <= 0) {
      setActionError('Verifica fecha, número de muestra y peso total.');
      return;
    }
    try {
      await updateBiometria(editModal.item.id, {
        fecha: editForm.fecha,
        numero_muestra: Number(editForm.numero_muestra),
        peso_total_muestra_g: Number(editForm.peso_total_muestra_g),
        observaciones: editForm.observaciones,
      });
      setEditModal({ open: false, item: null });
      setActionError('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No fue posible actualizar la biometría.');
    }
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteBiometria(deleteId);
        setDeleteId(null);
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'No fue posible eliminar la biometría.');
      }
    }
  };

  const handleFinalizar = async () => {
    try {
      await finalizarCicloEstanque(id);
      setFinalizarModal(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No fue posible finalizar el ciclo-estanque.');
    }
  };

  const chartData = ceBiometrias.map(b => ({
    fecha: b.fecha.slice(5), // MM-DD
    peso_prom: b.peso_promedio_g,
  }));

  const lastBio = ceBiometrias[ceBiometrias.length - 1];
  const firstBio = ceBiometrias[0];
  const ganancia = lastBio && firstBio
    ? (lastBio.peso_promedio_g - firstBio.peso_promedio_g).toFixed(1)
    : null;

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => ciclo ? navigate(`/ciclos/${ciclo.id}`) : navigate('/ciclos')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al detalle del ciclo
      </button>

      {/* CE Info card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: '#f0f9ff' }}>
          <div>
            <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.2rem' }}>
              {estanque?.nombre || '—'} <span className="text-slate-400" style={{ fontWeight: 400 }}>en</span> {ciclo?.nombre || '—'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Ciclo-Estanque #{ce.id}</p>
          </div>
          <Badge status={ce.estado} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-slate-100">
          {[
            { icon: Hash, label: 'ID', val: `#${ce.id}` },
            { icon: CalendarDays, label: 'Fecha siembra', val: ce.fecha_siembra },
            { icon: Droplets, label: 'Densidad inicial', val: `${ce.densidad_inicial_m2} org/m²` },
            { icon: Weight, label: 'Peso inicial prom.', val: `${ce.peso_inicial_promedio_g} g` },
            { icon: CalendarDays, label: 'Biometrías', val: String(ceBiometrias.length) },
            { icon: Weight, label: 'Ganancia de peso', val: ganancia ? `+${ganancia} g` : '—' },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="bg-white px-4 py-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3 w-3 text-cyan-500" />
                <span className="text-xs text-slate-400" style={{ fontWeight: 500 }}>{label}</span>
              </div>
              <p className="text-slate-700 text-sm" style={{ fontWeight: 600 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-slate-800 mb-1" style={{ fontWeight: 600 }}>Tendencia de peso promedio</h2>
          <p className="text-xs text-slate-400 mb-4">Evolución del peso promedio (g) por fecha de muestreo</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#94a3b8' }} />
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
        </div>
      )}

      {/* Biometrics table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-slate-800" style={{ fontWeight: 600 }}>Historial de biometrías</h2>
            <p className="text-xs text-slate-400 mt-0.5">{ceBiometrias.length} registro(s)</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/biometrias/nuevo?ceId=${ce.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-all"
              style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
            >
              <Plus className="h-4 w-4" /> Registrar biometría
            </button>
            {ce.estado === 'activo' && (
              <button
                onClick={() => setFinalizarModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-all"
                style={{ backgroundColor: '#059669', fontWeight: 500 }}
              >
                <CheckCircle className="h-4 w-4" /> Finalizar
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Fecha', 'N° Muestra', 'Peso total (g)', 'Peso prom. (g)', 'Observaciones', 'Registrado por', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...ceBiometrias].reverse().map(b => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-700">{b.fecha}</td>
                  <td className="px-5 py-3.5 text-slate-700">{b.numero_muestra}</td>
                  <td className="px-5 py-3.5 text-slate-700">{b.peso_total_muestra_g.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span style={{ color: '#0e7490', fontWeight: 600 }}>{b.peso_promedio_g.toFixed(1)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{b.observaciones || <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{getUsuario(b.registrado_por_id)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {ceBiometrias.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">
                    No hay biometrías registradas.{' '}
                    <button
                      onClick={() => navigate(`/biometrias/nuevo?ceId=${ce.id}`)}
                      className="text-cyan-600 hover:underline"
                    >
                      Registrar ahora
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {actionError && <div className="text-sm text-red-600">{actionError}</div>}

      {/* Finalizar modal */}
      <Modal open={finalizarModal} onClose={() => setFinalizarModal(false)} title="Finalizar ciclo-estanque" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Confirmas finalizar este ciclo-estanque? Ya no se podrán agregar más biometrías asociadas.</p>
        <div className="flex gap-3">
          <button onClick={() => setFinalizarModal(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleFinalizar} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#059669', fontWeight: 500 }}>Finalizar</button>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={editModal.open} onClose={() => setEditModal({ open: false, item: null })} title="Editar biometría">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Fecha</label>
            <input
              type="date"
              value={editForm.fecha}
              onChange={e => setEditForm(f => ({ ...f, fecha: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Número de muestra</label>
            <input
              type="number"
              value={editForm.numero_muestra}
              onChange={e => setEditForm(f => ({ ...f, numero_muestra: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Peso total muestra (g)</label>
            <input
              type="number"
              value={editForm.peso_total_muestra_g}
              onChange={e => setEditForm(f => ({ ...f, peso_total_muestra_g: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Peso promedio calculado</label>
            <div className="px-3 py-2.5 text-sm border border-slate-100 rounded-xl bg-slate-50 text-slate-500">
              {editForm.numero_muestra && Number(editForm.numero_muestra) > 0
                ? (Number(editForm.peso_total_muestra_g) / Number(editForm.numero_muestra)).toFixed(2)
                : '—'} g
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Observaciones</label>
            <textarea
              value={editForm.observaciones}
              onChange={e => setEditForm(f => ({ ...f, observaciones: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditModal({ open: false, item: null })} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button onClick={handleEditSave} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#0e7490', fontWeight: 500 }}>Guardar cambios</button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Eliminar biometría" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Estás seguro de que deseas eliminar esta biometría?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#dc2626', fontWeight: 500 }}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

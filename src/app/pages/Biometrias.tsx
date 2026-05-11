import React, { useState } from 'react';
import { Plus, Eye, Pencil, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import type { Biometria } from '../types';

export function Biometrias() {
  const { biometrias, cicloEstanques, ciclos, estanques, usuarios, deleteBiometria, updateBiometria, currentUser } = useApp();
  const navigate = useNavigate();

  const [filterCiclo, setFilterCiclo] = useState('todos');
  const [filterEstanque, setFilterEstanque] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; item: Biometria | null }>({ open: false, item: null });
  const [editForm, setEditForm] = useState({ fecha: '', numero_muestra: '', peso_total_muestra_g: '', observaciones: '' });

  const getCEInfo = (ceId: number) => {
    const ce = cicloEstanques.find(x => x.id === ceId);
    if (!ce) return { cicloNombre: '-', estanqueNombre: '-', cicloId: 0, estanqueId: 0 };
    const ciclo = ciclos.find(c => c.id === ce.ciclo_id);
    const estanque = estanques.find(e => e.id === ce.estanque_id);
    return {
      cicloNombre: ciclo?.nombre || '-',
      estanqueNombre: estanque?.nombre || '-',
      cicloId: ce.ciclo_id,
      estanqueId: ce.estanque_id,
    };
  };

  const getUsuarioNombre = (id: number) => usuarios.find(u => u.id === id)?.nombre || '-';

  const filtered = biometrias.filter(b => {
    const { cicloId, estanqueId } = getCEInfo(b.ciclo_estanque_id);
    const matchCiclo = filterCiclo === 'todos' || cicloId === Number(filterCiclo);
    const matchEst = filterEstanque === 'todos' || estanqueId === Number(filterEstanque);
    const matchFecha = !filterFecha || b.fecha.startsWith(filterFecha);
    return matchCiclo && matchEst && matchFecha;
  }).sort((a, b) => b.fecha.localeCompare(a.fecha));

  const openEdit = (b: Biometria) => {
    setEditForm({
      fecha: b.fecha,
      numero_muestra: String(b.numero_muestra),
      peso_total_muestra_g: String(b.peso_total_muestra_g),
      observaciones: b.observaciones,
    });
    setEditModal({ open: true, item: b });
  };

  const handleEditSave = () => {
    if (!editModal.item) return;
    updateBiometria(editModal.item.id, {
      fecha: editForm.fecha,
      numero_muestra: Number(editForm.numero_muestra),
      peso_total_muestra_g: Number(editForm.peso_total_muestra_g),
      observaciones: editForm.observaciones,
    });
    setEditModal({ open: false, item: null });
  };

  const handleDelete = () => {
    if (deleteId !== null) { deleteBiometria(deleteId); setDeleteId(null); }
  };

  const getCEById = (ceId: number) => cicloEstanques.find(ce => ce.id === ceId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Biometrías</h1>
          <p className="text-slate-500 text-sm mt-0.5">{biometrias.length} registros totales</p>
        </div>
        <button
          onClick={() => navigate('/biometrias/nuevo')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm hover:opacity-90 transition-all"
          style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
        >
          <Plus className="h-4 w-4" /> Registrar biometría
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="h-4 w-4" />
          <span className="text-sm">Filtrar:</span>
        </div>
        <select
          value={filterCiclo}
          onChange={e => setFilterCiclo(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          <option value="todos">Todos los ciclos</option>
          {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select
          value={filterEstanque}
          onChange={e => setFilterEstanque(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          <option value="todos">Todos los estanques</option>
          {estanques.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        <input
          type="month"
          value={filterFecha}
          onChange={e => setFilterFecha(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        />
        {(filterCiclo !== 'todos' || filterEstanque !== 'todos' || filterFecha) && (
          <button
            onClick={() => { setFilterCiclo('todos'); setFilterEstanque('todos'); setFilterFecha(''); }}
            className="text-sm text-slate-500 hover:text-slate-800 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Fecha', 'Ciclo', 'Estanque', 'N° Muestra', 'Peso total (g)', 'Peso prom. (g)', 'Registrado por', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const { cicloNombre, estanqueNombre } = getCEInfo(b.ciclo_estanque_id);
                const ce = getCEById(b.ciclo_estanque_id);
                return (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-400 text-xs">#{b.id}</td>
                    <td className="px-4 py-3.5 text-slate-700">{b.fecha}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">{cicloNombre}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">{estanqueNombre}</td>
                    <td className="px-4 py-3.5 text-slate-700">{b.numero_muestra}</td>
                    <td className="px-4 py-3.5 text-slate-700">{b.peso_total_muestra_g.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <span style={{ color: '#0e7490', fontWeight: 600 }}>{b.peso_promedio_g.toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">{getUsuarioNombre(b.registrado_por_id)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {ce && (
                          <button
                            onClick={() => navigate(`/ciclo-estanque/${ce.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                            title="Ver detalle ciclo-estanque"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400 text-sm">No se encontraron biometrías.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
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
              placeholder="Notas opcionales..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditModal({ open: false, item: null })} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button onClick={handleEditSave} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#0e7490', fontWeight: 500 }}>Guardar cambios</button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirmar eliminación" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Estás seguro de que deseas eliminar esta biometría?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#dc2626', fontWeight: 500 }}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import type { Ciclo } from '../types';

type ModalMode = 'create' | 'edit';

const emptyForm = { nombre: '', fecha_inicio: '', fecha_fin: '', estado: 'activo' };

export function Ciclos() {
  const { ciclos, addCiclo, updateCiclo, deleteCiclo, finalizarCiclo, dataLoading, dataError } = useApp();
  const navigate = useNavigate();
  const [filterEstado, setFilterEstado] = useState('todos');
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; item: Ciclo | null }>({ open: false, mode: 'create', item: null });
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [finalizarId, setFinalizarId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = ciclos.filter(c => filterEstado === 'todos' || c.estado === filterEstado);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, mode: 'create', item: null });
  };

  const openEdit = (c: Ciclo) => {
    setForm({ nombre: c.nombre, fecha_inicio: c.fecha_inicio, fecha_fin: c.fecha_fin || '', estado: c.estado });
    setModal({ open: true, mode: 'edit', item: c });
  };

  const closeModal = () => setModal(m => ({ ...m, open: false }));

  const handleSave = async () => {
    setFormError('');
    if (!form.nombre.trim()) {
      setFormError('El nombre es requerido.');
      return;
    }
    if (!form.fecha_inicio) {
      setFormError('La fecha_inicio es requerida.');
      return;
    }
    if (!form.estado.trim()) {
      setFormError('El estado es requerido.');
      return;
    }
    const data = {
      nombre: form.nombre,
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin || null,
      estado: form.estado,
    };
    setActionLoading(true);
    try {
      if (modal.mode === 'create') {
        await addCiclo(data);
      } else if (modal.mode === 'edit' && modal.item) {
        await updateCiclo(modal.item.id, data);
      }
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No fue posible guardar el ciclo.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteCiclo(deleteId);
        setDeleteId(null);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'No fue posible eliminar el ciclo.');
      }
    }
  };

  const handleFinalizar = async () => {
    if (finalizarId !== null) {
      try {
        await finalizarCiclo(finalizarId);
        setFinalizarId(null);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'No fue posible finalizar el ciclo.');
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Ciclos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{ciclos.length} ciclos registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm hover:opacity-90 transition-all"
          style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
        >
          <Plus className="h-4 w-4" /> Nuevo ciclo
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl bg-white px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Nombre', 'Fecha inicio', 'Fecha fin', 'Estado', 'Creado en', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataLoading && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">Cargando datos...</td></tr>
              )}
              {!dataLoading && dataError && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-red-500 text-sm">{dataError}</td></tr>
              )}
              {!dataLoading && !dataError && filtered.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 text-xs">#{c.id}</td>
                  <td className="px-5 py-3.5 text-slate-800" style={{ fontWeight: 500 }}>{c.nombre}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.fecha_inicio}</td>
                  <td className="px-5 py-3.5 text-slate-500">{c.fecha_fin || <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3.5"><Badge status={c.estado} /></td>
                  <td className="px-5 py-3.5 text-slate-500">{c.creado_en}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/ciclos/${c.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {c.estado === 'activo' && (
                        <button
                          onClick={() => setFinalizarId(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Finalizar ciclo"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!dataLoading && !dataError && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">No se encontraron ciclos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modal.open} onClose={closeModal} title={modal.mode === 'create' ? 'Nuevo ciclo' : 'Editar ciclo'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Nombre del ciclo</label>
            <input
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              placeholder="Ciclo 2026-01"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Fecha de inicio</label>
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Fecha de fin <span className="text-slate-400">(opcional)</span></label>
            <input
              type="date"
              value={form.fecha_fin}
              onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Estado</label>
             <select
               value={form.estado}
               onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
               className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
             >
              <option value="activo">Activo</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={closeModal} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button onClick={handleSave} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#0e7490', fontWeight: 500 }}>
              {actionLoading ? 'Guardando...' : modal.mode === 'create' ? 'Crear ciclo' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirmar eliminación" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Estás seguro de que deseas eliminar este ciclo?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#dc2626', fontWeight: 500 }}>Eliminar</button>
        </div>
      </Modal>

      {/* Finalizar confirm */}
      <Modal open={finalizarId !== null} onClose={() => setFinalizarId(null)} title="Finalizar ciclo" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Confirmas que deseas finalizar este ciclo? Se registrará la fecha de hoy como fecha de fin.</p>
        <div className="flex gap-3">
          <button onClick={() => setFinalizarId(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleFinalizar} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#059669', fontWeight: 500 }}>Finalizar</button>
        </div>
      </Modal>
    </div>
  );
}

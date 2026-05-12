import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import type { Estanque } from '../types';

type ModalMode = 'create' | 'edit' | 'view';

const emptyForm = { nombre: '', ubicacion: '', superficie_m2: '', estado: 'activo' };

export function Estanques() {
  const { estanques, addEstanque, updateEstanque, deleteEstanque, dataLoading, dataError } = useApp();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; item: Estanque | null }>({ open: false, mode: 'create', item: null });
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = estanques.filter(e => {
    const matchSearch = e.nombre.toLowerCase().includes(search.toLowerCase()) ||
      e.ubicacion.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === 'todos' || e.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, mode: 'create', item: null });
  };

  const openEdit = (e: Estanque) => {
    setForm({ nombre: e.nombre, ubicacion: e.ubicacion, superficie_m2: String(e.superficie_m2), estado: e.estado });
    setModal({ open: true, mode: 'edit', item: e });
  };

  const openView = (e: Estanque) => {
    setModal({ open: true, mode: 'view', item: e });
  };

  const closeModal = () => setModal(m => ({ ...m, open: false }));

  const handleSave = async () => {
    setFormError('');
    if (!form.nombre.trim()) {
      setFormError('El nombre es requerido.');
      return;
    }
    if (!form.superficie_m2 || Number.isNaN(Number(form.superficie_m2))) {
      setFormError('La superficie_m2 es requerida y debe ser numérica.');
      return;
    }
    if (!form.estado.trim()) {
      setFormError('El estado es requerido.');
      return;
    }
    const data = {
      nombre: form.nombre,
      ubicacion: form.ubicacion,
      superficie_m2: parseFloat(form.superficie_m2),
      estado: form.estado,
    };
    setActionLoading(true);
    try {
      if (modal.mode === 'create') {
        await addEstanque(data);
      } else if (modal.mode === 'edit' && modal.item) {
        await updateEstanque(modal.item.id, data);
      }
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No fue posible guardar el estanque.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteEstanque(deleteId);
        setDeleteId(null);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'No fue posible eliminar el estanque.');
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Estanques</h1>
          <p className="text-slate-500 text-sm mt-0.5">{estanques.length} estanques registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
        >
          <Plus className="h-4 w-4" /> Nuevo estanque
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar estanque..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-700"
          />
        </div>
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl bg-white px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Nombre', 'Ubicación', 'Superficie (m²)', 'Estado', 'Creado en', 'Acciones'].map(h => (
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
              {!dataLoading && !dataError && filtered.map(e => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 text-xs">#{e.id}</td>
                  <td className="px-5 py-3.5 text-slate-800" style={{ fontWeight: 500 }}>{e.nombre}</td>
                  <td className="px-5 py-3.5 text-slate-600">{e.ubicacion}</td>
                  <td className="px-5 py-3.5 text-slate-700">{e.superficie_m2.toLocaleString()} m²</td>
                  <td className="px-5 py-3.5"><Badge status={e.estado} /></td>
                  <td className="px-5 py-3.5 text-slate-500">{e.creado_en}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(e)} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors" title="Ver">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!dataLoading && !dataError && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">No se encontraron estanques.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modal.open && modal.mode !== 'view'}
        onClose={closeModal}
        title={modal.mode === 'create' ? 'Nuevo estanque' : 'Editar estanque'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Nombre</label>
            <input
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              placeholder="Estanque Norte 1"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Ubicación</label>
            <input
              value={form.ubicacion}
              onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              placeholder="Granja A - Lote Norte"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Superficie (m²)</label>
            <input
              type="number"
              value={form.superficie_m2}
              onChange={e => setForm(f => ({ ...f, superficie_m2: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              placeholder="1200"
              min={0}
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
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={closeModal} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button onClick={handleSave} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#0e7490', fontWeight: 500 }}>
              {actionLoading ? 'Guardando...' : modal.mode === 'create' ? 'Crear estanque' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={modal.open && modal.mode === 'view'} onClose={closeModal} title="Detalle del estanque">
        {modal.item && (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Nombre</span>
              <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{modal.item.nombre}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Ubicación</span>
              <span className="text-sm text-slate-700">{modal.item.ubicacion}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Superficie</span>
              <span className="text-sm text-slate-700">{modal.item.superficie_m2.toLocaleString()} m²</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Estado</span>
              <Badge status={modal.item.estado} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-500">Creado en</span>
              <span className="text-sm text-slate-700">{modal.item.creado_en}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirmar eliminación" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Estás seguro de que deseas eliminar este estanque?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#dc2626', fontWeight: 500 }}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

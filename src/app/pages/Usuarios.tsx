import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import type { Usuario } from '../types';

type ModalMode = 'create' | 'edit' | 'view';

const emptyForm = { nombre: '', correo: '', rol: 'usuario', password: '' };

export function Usuarios() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, currentUser, dataLoading, dataError } = useApp();
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState('todos');
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; user: Usuario | null }>({ open: false, mode: 'create', user: null });
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = usuarios.filter(u => {
    const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.correo.toLowerCase().includes(search.toLowerCase());
    const matchRol = filterRol === 'todos' || u.rol === filterRol;
    return matchSearch && matchRol;
  });

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, mode: 'create', user: null });
  };

  const openEdit = (u: Usuario) => {
    setForm({ nombre: u.nombre, correo: u.correo, rol: u.rol, password: '' });
    setModal({ open: true, mode: 'edit', user: u });
  };

  const openView = (u: Usuario) => {
    setModal({ open: true, mode: 'view', user: u });
  };

  const closeModal = () => setModal(m => ({ ...m, open: false }));

  const handleSave = async () => {
    setFormError('');
    if (!form.nombre.trim()) {
      setFormError('El nombre es requerido.');
      return;
    }
    if (!form.correo.trim()) {
      setFormError('El correo es requerido.');
      return;
    }
    if (!form.rol.trim()) {
      setFormError('El rol es requerido.');
      return;
    }
    if (modal.mode === 'create' && !form.password.trim()) {
      setFormError('La contraseña es requerida para crear usuario.');
      return;
    }

    setActionLoading(true);
    try {
      if (modal.mode === 'create') {
        await addUsuario({ nombre: form.nombre, correo: form.correo, rol: form.rol, password: form.password });
      } else if (modal.mode === 'edit' && modal.user) {
        await updateUsuario(modal.user.id, {
          nombre: form.nombre,
          correo: form.correo,
          rol: form.rol,
          ...(form.password ? { password: form.password } : {}),
        });
      }
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No fue posible guardar el usuario.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = (id: number) => setDeleteId(id);
  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteUsuario(deleteId);
        setDeleteId(null);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'No fue posible eliminar el usuario.');
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Usuarios</h1>
          <p className="text-slate-500 text-sm mt-0.5">{usuarios.length} usuarios registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
        >
          <Plus className="h-4 w-4" /> Nuevo usuario
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-700"
          />
        </div>
        <select
          value={filterRol}
          onChange={e => setFilterRol(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl bg-white px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          <option value="todos">Todos los roles</option>
          <option value="administrador">Administrador</option>
          <option value="usuario">Usuario</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Nombre', 'Correo', 'Rol', 'Creado en', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataLoading && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">Cargando datos...</td></tr>
              )}
              {!dataLoading && dataError && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-red-500 text-sm">{dataError}</td></tr>
              )}
              {!dataLoading && !dataError && filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 text-xs">#{u.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ backgroundColor: '#e0f2fe', color: '#0e7490', fontWeight: 600 }}
                      >
                        {u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-slate-800" style={{ fontWeight: 500 }}>{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{u.correo}</td>
                  <td className="px-5 py-3.5"><Badge status={u.rol} /></td>
                  <td className="px-5 py-3.5 text-slate-500">{u.creado_en}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(u)} className="p-1.5 cursor-pointer rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors" title="Ver">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(u)} className="p-1.5 cursor-pointer rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(u.id)}
                        disabled={u.id === currentUser?.id}
                        className="p-1.5 cursor-pointer rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!dataLoading && !dataError && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">No se encontraron usuarios.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modal.open && modal.mode !== 'view'}
        onClose={closeModal}
        title={modal.mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Nombre completo</label>
            <input
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              placeholder="Nombre Apellido"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Correo electrónico</label>
            <input
              type="email"
              value={form.correo}
              onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              placeholder="correo@empresa.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Rol</label>
              <select
                value={form.rol}
                onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
              >
              <option value="usuario">Usuario</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          {modal.mode === 'create' && (
            <div>
              <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-800"
                placeholder="••••••••"
              />
            </div>
          )}
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button
              onClick={closeModal}
              disabled={actionLoading}
              className="flex-1 py-2.5 cursor-pointer rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={actionLoading}
              className="flex-1 py-2.5 rounded-xl text-sm cursor-pointer text-white transition-colors"
              style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
            >
              {actionLoading ? 'Guardando...' : modal.mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={modal.open && modal.mode === 'view'} onClose={closeModal} title="Detalle de usuario">
        {modal.user && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: '#e0f2fe', color: '#0e7490', fontSize: '1.2rem', fontWeight: 700 }}
              >
                {modal.user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-slate-800" style={{ fontWeight: 600 }}>{modal.user.nombre}</p>
                <Badge status={modal.user.rol} />
              </div>
            </div>
            {[
              { label: 'ID', val: `#${modal.user.id}` },
              { label: 'Correo', val: modal.user.correo },
              { label: 'Creado en', val: modal.user.creado_en },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirmar eliminación" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteId(null)}
            className="flex-1 py-2.5 cursor-pointer rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-2.5 cursor-pointer rounded-xl text-sm text-white"
            style={{ backgroundColor: '#dc2626', fontWeight: 500 }}
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}

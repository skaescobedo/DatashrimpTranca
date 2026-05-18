import React, { useState } from 'react';
import { Plus, Eye, Pencil, Trash2, Filter, Sheet } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useNotification } from '../components/ui/use-notification';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { importExcelBiometrias } from '../../services/biometriaService';

export function Biometrias() {
  const { biometrias, cicloEstanques, ciclos, estanques, usuarios, deleteBiometria, dataLoading, dataError, refreshBiometrias } = useApp();
  const navigate = useNavigate();
  const [modal, setModal] = useState<{ open: boolean; mode: 'view' | 'edit'; item: any | null }>({ 
    open: false, 
    mode: 'view', 
    item: null 
  });
  const { success, error } = useNotification();
  const openView = (biometria: any) => {
    setModal({ open: true, mode: 'view', item: biometria });
  };
  const closeModal = () => setModal(m => ({ ...m, open: false }));
  const [filterCiclo, setFilterCiclo] = useState('todos');
  const [filterEstanque, setFilterEstanque] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const [importModal, setImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importCicloEstanque, setImportCicloEstanque] = useState('');
  const [importError, setImportError] = useState('');
  const [importLoading, setImportLoading] = useState(false);

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
  }).sort((a, b) => b.id - a.id);

  const openEdit = (id: number) => {
    navigate(`/biometrias/${id}/editar`);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteBiometria(deleteId);
        setDeleteId(null);
        success('Éxito', 'Biometría eliminada correctamente');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'No fue posible eliminar biometría.';
        error('Error', errorMsg);
        setActionError(errorMsg);
      }
    }
  };

  const getCEById = (ceId: number) => cicloEstanques.find(ce => ce.id === ceId);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
      setImportFile(file);
      setImportError('');
    } else {
      setImportError('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = async () => {
    setImportError('');
    if (!importFile) {
      setImportError('Por favor selecciona un archivo');
      return;
    }
    setImportLoading(true);
    try {
      console.log('Importando archivo:', importFile.name, 'para ciclo-estanque:', importCicloEstanque);
      await importExcelBiometrias(importFile);
      setImportModal(false);
      setImportFile(null);
      setImportCicloEstanque('');
      success('Importación completada', `Se importaron los registros del archivo ${importFile.name}`);
      await refreshBiometrias();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'No fue posible importar el archivo';
      error('Error en la importación', errorMsg);
    } finally {
      setImportLoading(false);
    }
  };

  const closeImportModal = () => {
    setImportModal(false);
    setImportFile(null);
    setImportCicloEstanque('');
    setImportError('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Biometrías</h1>
          <p className="text-slate-500 text-sm mt-0.5">{biometrias.length} registros totales</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setImportModal(true)}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: 'white', fontWeight: 500, color: '#0e7490', border: '1px solid #0e7490' }}
          >
            <Sheet className="h-4 w-4" /> Importar excel
          </button>
          <button
            onClick={() => navigate('/biometrias/nuevo')}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
          >
            <Plus className="h-4 w-4" /> Registrar biometría
          </button>
        </div>
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
            className="text-sm text-slate-500 cursor-pointer hover:text-slate-800 underline"
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
              {dataLoading && (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400 text-sm">Cargando datos...</td></tr>
              )}
              {!dataLoading && dataError && (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-red-500 text-sm">{dataError}</td></tr>
              )}
              {!dataLoading && !dataError && filtered.map(b => {
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 cursor-pointer hover:bg-cyan-50 transition-colors"
                            title="Ver detalle ciclo-estanque"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => openEdit(b.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 cursor-pointer hover:bg-amber-50 transition-colors" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer hover:bg-red-50 transition-colors" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!dataLoading && !dataError && filtered.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400 text-sm">No se encontraron biometrías.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {actionError && <div className="text-sm text-red-600">{actionError}</div>}

      {/* Delete confirm */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirmar eliminación" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Estás seguro de que deseas eliminar esta biometría?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 cursor-pointer py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleDelete} className="flex-1 cursor-pointer py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#dc2626', fontWeight: 500 }}>Eliminar</button>
        </div>
      </Modal>

      {/* Import Excel Modal */}
      <Modal open={importModal} onClose={closeImportModal} title="Importar biometrías desde Excel">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Archivo Excel</label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/30 transition-colors"
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {const file = e.target.files?.[0] ?? null;
                  if (file) handleFileSelect(file);
                }} className="hidden"
                id="excel-file-input"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer block">
                <div className="flex flex-col items-center gap-2">
                  <Sheet className="h-8 w-8 text-slate-400" />
                  {importFile ? (
                    <>
                      <p className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{importFile.name}</p>
                      <p className="text-xs text-slate-500">Haz clic para cambiar el archivo</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-700" style={{ fontWeight: 500 }}>Arrastra tu archivo Excel aquí</p>
                      <p className="text-xs text-slate-500">o haz clic para seleccionar</p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {importError && <p className="text-sm text-red-600">{importError}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={closeImportModal}
              disabled={importLoading}
              className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 cursor-pointer hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={importLoading}
              className="flex-1 py-2.5 rounded-xl text-sm cursor-pointer text-white"
              style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
            >
              {importLoading ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

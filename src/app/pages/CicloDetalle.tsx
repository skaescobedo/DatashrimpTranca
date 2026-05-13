import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Plus, Eye, Trash2, CheckCircle, CalendarDays, Droplets, Hash } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';

export function CicloDetalle() {
  const { cicloId } = useParams<{ cicloId: string }>();
  const navigate = useNavigate();
  const { ciclos, cicloEstanques, estanques, finalizarCiclo, finalizarCicloEstanque, deleteCicloEstanque } = useApp();

  const id = Number(cicloId);
  const ciclo = ciclos.find(c => c.id === id);
  const ceList = cicloEstanques.filter(ce => ce.ciclo_id === id);

  const [finalizarCicloModal, setFinalizarCicloModal] = useState(false);
  const [finalizarCEId, setFinalizarCEId] = useState<number | null>(null);
  const [deleteCEId, setDeleteCEId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  if (!ciclo) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500">Ciclo no encontrado.</p>
        <button onClick={() => navigate('/ciclos')} className="text-cyan-600 hover:underline text-sm">Volver a ciclos</button>
      </div>
    );
  }

  const getEstanque = (eid: number) => estanques.find(e => e.id === eid);

  const handleFinalizarCiclo = async () => {
    try {
      await finalizarCiclo(id);
      setFinalizarCicloModal(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No fue posible finalizar el ciclo.');
    }
  };

  const handleFinalizarCE = async () => {
    if (finalizarCEId !== null) {
      try {
        await finalizarCicloEstanque(finalizarCEId);
        setFinalizarCEId(null);
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'No fue posible finalizar el ciclo-estanque.');
      }
    }
  };

  const handleDeleteCE = async () => {
    if (deleteCEId !== null) {
      try {
        await deleteCicloEstanque(deleteCEId);
        setDeleteCEId(null);
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'No fue posible eliminar la asociación.');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/ciclos')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a ciclos
        </button>
      </div>

      {/* Cycle info card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: '#f0f9ff' }}>
          <div>
            <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.3rem' }}>{ciclo.nombre}</h1>
            <p className="text-slate-600 text-sm mt-0.5">Detalle del ciclo de producción</p>
          </div>
          <Badge status={ciclo.estado} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100">
          {[
            { icon: Hash, label: 'ID', val: `#${ciclo.id}` },
            { icon: CalendarDays, label: 'Fecha inicio', val: ciclo.fecha_inicio },
            { icon: CalendarDays, label: 'Fecha fin', val: ciclo.fecha_fin || 'Sin fecha fin' },
            { icon: Droplets, label: 'Estanques', val: `${ceList.length} asociados` },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="bg-white px-5 py-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-3.5 w-3.5 text-cyan-500" />
                <span className="text-xs text-slate-400" style={{ fontWeight: 500 }}>{label}</span>
              </div>
              <p className="text-slate-700 text-sm" style={{ fontWeight: 600 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{actionError}</div>
      )}

      {/* CicloEstanques table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-slate-800" style={{ fontWeight: 600 }}>Estanques asociados</h2>
            <p className="text-xs text-slate-400 mt-0.5">{ceList.length} estanque(s) en este ciclo</p>
          </div>
          <div className="flex gap-2">
            {ciclo.estado === 'activo' && (
              <>
                <button
                  onClick={() => navigate(`/ciclos/${id}/asociar`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#0e7490', fontWeight: 500 }}
                >
                  <Plus className="h-4 w-4" /> Asociar estanque
                </button>
                <button
                  onClick={() => setFinalizarCicloModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#059669', fontWeight: 500 }}
                >
                  <CheckCircle className="h-4 w-4" /> Finalizar ciclo
                </button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Estanque', 'Fecha siembra', 'Densidad inicial (m²)', 'Peso inicial prom. (g)', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 text-xs" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ceList.map(ce => {
                const est = getEstanque(ce.estanque_id);
                return (
                  <tr key={ce.id} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 text-xs">#{ce.id}</td>
                    <td className="px-5 py-3.5 text-slate-800" style={{ fontWeight: 500 }}>{est?.nombre || '-'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{ce.fecha_siembra}</td>
                    <td className="px-5 py-3.5 text-slate-700">{ce.densidad_inicial_m2} org/m²</td>
                    <td className="px-5 py-3.5 text-slate-700">{ce.peso_inicial_promedio_g} g</td>
                    <td className="px-5 py-3.5"><Badge status={ce.estado} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/ciclo-estanque/${ce.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                          title="Ver ciclo-estanque"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {ce.estado === 'activo' && (
                          <button
                            onClick={() => setFinalizarCEId(ce.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Finalizar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteCEId(ce.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {ceList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">
                    No hay estanques asociados a este ciclo.
                    {ciclo.estado === 'activo' && (
                      <button onClick={() => navigate(`/ciclos/${id}/asociar`)} className="ml-2 text-cyan-600 hover:underline">
                        Asociar ahora
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finalizar ciclo confirm */}
      <Modal open={finalizarCicloModal} onClose={() => setFinalizarCicloModal(false)} title="Finalizar ciclo" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Confirmas finalizar el ciclo <strong>{ciclo.nombre}</strong>? Se registrará la fecha actual como fecha de fin.</p>
        <div className="flex gap-3">
          <button onClick={() => setFinalizarCicloModal(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleFinalizarCiclo} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#059669', fontWeight: 500 }}>Finalizar</button>
        </div>
      </Modal>

      {/* Finalizar CE confirm */}
      <Modal open={finalizarCEId !== null} onClose={() => setFinalizarCEId(null)} title="Finalizar ciclo-estanque" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Finalizar la asociación de este estanque con el ciclo?</p>
        <div className="flex gap-3">
          <button onClick={() => setFinalizarCEId(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleFinalizarCE} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#059669', fontWeight: 500 }}>Finalizar</button>
        </div>
      </Modal>

      {/* Delete CE confirm */}
      <Modal open={deleteCEId !== null} onClose={() => setDeleteCEId(null)} title="Eliminar asociación" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Eliminar la asociación de este estanque con el ciclo?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteCEId(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleDeleteCE} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#dc2626', fontWeight: 500 }}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

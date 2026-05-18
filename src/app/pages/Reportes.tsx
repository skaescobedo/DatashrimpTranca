import React, { useEffect, useState, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as api from '../../services/api';
import { useApp } from '../context/AppContext';

interface GeneralGrowthItem {
    fecha: string;
    peso_promedio: number;
}

interface RankingItem {
    estanque: string;
    peso_promedio: number;
}

interface RelationItem {
    fecha: string;
    peso: number;
    temp: number;
    oxigeno: number;
    salinidad: number;
}

interface CompareItem {
    fecha: string;
    [key: string]: string | number;
}

type ReportType = 'general' | 'ranking' | 'relations' | 'compare';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#387908', '#e6194b', '#3cb44b', '#ffe119', '#f58231', '#911eb4'];

const formatChartDate = (value: string) => {
    // Agregar T00:00:00 para forzar interpretación LOCAL en vez de UTC
    const date = new Date(value + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
};

const formatWeight = (value: string | number) => `${Number(value).toFixed(2)} g`;

const formatRelationValue = (value: string | number, name: string) => {
    const formattedValue = Number(value).toFixed(2);

    if (name === 'Peso (g)') return `${formattedValue} g`;
    if (name === 'Temp (°C)') return `${formattedValue} °C`;
    if (name === 'Oxígeno') return `${formattedValue} mg/L`;
    if (name === 'Salinidad') return `${formattedValue} PPT`;

    return formattedValue;
};

export default function Reportes() {
    const { ciclos, estanques, cicloEstanques } = useApp();

    const [reportType, setReportType] = useState<ReportType>('general');

    // States for data
    const [generalGrowth, setGeneralGrowth] = useState<GeneralGrowthItem[]>([]);
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [relations, setRelations] = useState<RelationItem[]>([]);
    const [compareData, setCompareData] = useState<CompareItem[]>([]);

    // States for filters
    const [selectedCiclo, setSelectedCiclo] = useState<number | ''>('');
    const [selectedEstanque, setSelectedEstanque] = useState<number | 'all' | ''>('');

    // Default filters
    useEffect(() => {
        if (ciclos.length > 0 && selectedCiclo === '') {
            const latestCiclo = Math.max(...ciclos.map(c => c.id));
            setSelectedCiclo(latestCiclo);
        }
    }, [ciclos, selectedCiclo]);

    useEffect(() => {
        if (selectedCiclo && cicloEstanques.length > 0 && selectedEstanque === '') {
            if (reportType === 'general') {
                setSelectedEstanque('all');
            } else {
                const estanquesByCiclo = cicloEstanques.filter(ce => ce.ciclo_id === selectedCiclo);
                if (estanquesByCiclo.length > 0) {
                    const latestEstanque = Math.max(...estanquesByCiclo.map(ce => ce.estanque_id));
                    setSelectedEstanque(latestEstanque);
                }
            }
        }
    }, [selectedCiclo, cicloEstanques, selectedEstanque, reportType]);

    // Handle report type changes to maintain valid selection
    useEffect(() => {
        if (reportType === 'general') {
            setSelectedEstanque('all');
        } else if (selectedEstanque === 'all') {
            const estanquesByCiclo = cicloEstanques.filter(ce => ce.ciclo_id === selectedCiclo);
            if (estanquesByCiclo.length > 0) {
                setSelectedEstanque(Math.max(...estanquesByCiclo.map(ce => ce.estanque_id)));
            } else {
                setSelectedEstanque('');
            }
        }
    }, [reportType, selectedCiclo, cicloEstanques]);

    // Update filters logic when changing cycle
    const handleCicloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCicloId = Number(e.target.value);
        setSelectedCiclo(newCicloId);
        // Reset estanque if not valid in new cycle
        if (reportType === 'general') {
            setSelectedEstanque('all');
        } else {
            const estanquesByCiclo = cicloEstanques.filter(ce => ce.ciclo_id === newCicloId);
            if (estanquesByCiclo.length > 0) {
                setSelectedEstanque(Math.max(...estanquesByCiclo.map(ce => ce.estanque_id)));
            } else {
                setSelectedEstanque('');
            }
        }
    };

    const currentCicloEstanque = useMemo(() => {
        if (!selectedCiclo || !selectedEstanque) return null;
        return cicloEstanques.find(ce => ce.ciclo_id === selectedCiclo && ce.estanque_id === selectedEstanque);
    }, [selectedCiclo, selectedEstanque, cicloEstanques]);

    // Fetch data
    useEffect(() => {
        if (reportType === 'general') {
            const queryParam = selectedEstanque === 'all'
                ? `?ciclo_id=${selectedCiclo}`
                : (currentCicloEstanque ? `?ciclo_estanque_id=${currentCicloEstanque.id}` : '');

            if (queryParam) {
                api.get<GeneralGrowthItem[]>(`/analytics/general-growth${queryParam}`)
                    .then((res) => setGeneralGrowth(res))
                    .catch(console.error);
            } else {
                setGeneralGrowth([]);
            }
        }

        if (reportType === 'ranking' && selectedCiclo) {
            api.get<RankingItem[]>(`/analytics/ranking-estanques/${selectedCiclo}`)
                .then((res) => setRanking(res))
                .catch(console.error);
        }

        if (reportType === 'relations' && currentCicloEstanque) {
            api.get<RelationItem[]>(`/analytics/growth-relations/${currentCicloEstanque.id}`)
                .then((res) => setRelations(res))
                .catch(console.error);
        }

        if (reportType === 'compare' && selectedCiclo) {
            api.get<CompareItem[]>(`/analytics/compare-growth/${selectedCiclo}`)
                .then((res) => setCompareData(res))
                .catch(console.error);
        }
    }, [reportType, currentCicloEstanque, selectedCiclo, selectedEstanque]);

    // Helper options
    const estanquesOptions = useMemo(() => {
        if (!selectedCiclo) return [];
        const validIds = cicloEstanques.filter(ce => ce.ciclo_id === selectedCiclo).map(ce => ce.estanque_id);
        return estanques.filter(e => validIds.includes(e.id));
    }, [selectedCiclo, cicloEstanques, estanques]);

    const estanquesInCompare = useMemo(() => {
        if (compareData.length === 0) return [];
        const keys = new Set<string>();
        compareData.forEach(d => {
            Object.keys(d).forEach(k => {
                if (k !== 'fecha') keys.add(k);
            });
        });
        return Array.from(keys);
    }, [compareData]);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Reportes y Analítica</h1>

            <div className="bg-white p-4 rounded-xl shadow border mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-1 w-full md:w-1/3">
                        <label className="text-sm font-medium text-slate-700">Tipo de Reporte</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as ReportType)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5"
                        >
                            <option value="general">Reporte general de crecimiento</option>
                            <option value="ranking">Ranking de estanques actual</option>
                            <option value="relations">Crecimiento vs variables de agua</option>
                            <option value="compare">Comparativa entre estanques</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1 w-full md:w-1/3">
                        <label className="text-sm font-medium text-slate-700">Ciclo</label>
                        <select
                            value={selectedCiclo}
                            onChange={handleCicloChange}
                            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5"
                        >
                            {ciclos.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {(reportType === 'general' || reportType === 'relations') && (
                        <div className="flex flex-col gap-1 w-full md:w-1/3">
                            <label className="text-sm font-medium text-slate-700">Estanque</label>
                            <select
                                value={selectedEstanque}
                                onChange={(e) => setSelectedEstanque(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5"
                                disabled={estanquesOptions.length === 0}
                            >
                                {reportType === 'general' && <option value="all">Todos los estanques</option>}
                                {estanquesOptions.map(e => (
                                    <option key={e.id} value={e.id}>{e.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Reporte General de Crecimiento */}
                {reportType === 'general' && (
                    <div className="bg-white p-4 rounded-xl shadow border">
                        <h2 className="text-xl font-semibold mb-4">Reporte General de Crecimiento</h2>
                        <div className="h-[400px]">
                            {generalGrowth.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-slate-500 italic">
                                    Aún no se tiene ningún registro en la gráfica
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={generalGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="fecha" tickFormatter={formatChartDate} />
                                        <YAxis />
                                        <Tooltip labelFormatter={formatChartDate} formatter={formatWeight} />
                                        <Legend />
                                        <Line type="monotone" dataKey="peso_promedio" stroke="#8884d8" name="Peso (g)" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                )}

                {/* Ranking de Estanques */}
                {reportType === 'ranking' && (
                    <div className="bg-white p-4 rounded-xl shadow border">
                        <h2 className="text-xl font-semibold mb-4">Ranking de Estanques</h2>
                        <div className="h-[400px]">
                            {ranking.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-slate-500 italic">
                                    Aún no se tiene ningún registro en la gráfica
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ranking} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="estanque" type="category" width={80} />
                                        <Tooltip formatter={formatWeight} />
                                        <Legend />
                                        <Bar dataKey="peso_promedio" fill="#82ca9d" name="Peso (g)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                )}

                {/* Relación Crecimiento, Temp, Oxígeno, Salinidad */}
                {reportType === 'relations' && (
                    <div className="bg-white p-4 rounded-xl shadow border">
                        <h2 className="text-xl font-semibold mb-4">Crecimiento vs Variables de agua</h2>
                        <div className="h-[500px]">
                            {relations.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-slate-500 italic">
                                    Aún no se tiene ningún registro en la gráfica
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={relations}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="fecha" tickFormatter={formatChartDate} />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip labelFormatter={formatChartDate} formatter={formatRelationValue} />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="peso" stroke="#8884d8" name="Peso (g)" strokeWidth={3} />
                                        <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#ff7300" name="Temp (°C)" strokeWidth={3} />
                                        <Line yAxisId="right" type="monotone" dataKey="oxigeno" stroke="#387908" name="Oxígeno" strokeWidth={3} />
                                        <Line yAxisId="right" type="monotone" dataKey="salinidad" stroke="#82ca9d" name="Salinidad" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                )}

                {/* Comparativa entre estanques */}
                {reportType === 'compare' && (
                    <div className="bg-white p-4 rounded-xl shadow border">
                        <h2 className="text-xl font-semibold mb-4">Comparativa de Crecimiento</h2>
                        <div className="h-[500px]">
                            {compareData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-slate-500 italic">
                                    Aún no se tiene ningún registro en la gráfica
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={compareData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="fecha" tickFormatter={formatChartDate} />
                                        <YAxis />
                                        <Tooltip labelFormatter={formatChartDate} formatter={formatWeight} />
                                        <Legend />
                                        {estanquesInCompare.map((estanqueName, index) => (
                                            <Line
                                                key={estanqueName}
                                                type="monotone"
                                                dataKey={estanqueName}
                                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                                name={`${estanqueName} (g)`}
                                                connectNulls
                                                strokeWidth={3}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

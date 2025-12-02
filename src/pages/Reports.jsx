import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faHome } from '@fortawesome/free-solid-svg-icons';

const iconMap = {
    'fa-chart-bar': faChartBar, 'fa-home': faHome,
};

const Reports = () => {
    return (
        <main className="p-6 flex-1">
            <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                    <FontAwesomeIcon icon={iconMap['fa-home']} className="mr-1 text-indigo-500" />
                    <a href="#" className="hover:underline">Inicio</a> 
                    <span className="mx-2">/</span> 
                    <span className="font-semibold text-gray-700">Reportes y Analytics</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Reportes y Analytics</h1>
                <p className="text-gray-500 mt-1">Visualiza y genera reportes del sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Generar Reporte</h2>
                    <p className="text-gray-600 mb-4">Selecciona el tipo de reporte a generar</p>
                    <div className="space-y-3">
                        <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Reporte de Clientes</span>
                                <FontAwesomeIcon icon={faChartBar} className="text-indigo-600" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Lista completa de clientes</p>
                        </button>
                        <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Reporte de Muestras</span>
                                <FontAwesomeIcon icon={faChartBar} className="text-yellow-600" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Estado de las muestras</p>
                        </button>
                        <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Reporte de Resultados</span>
                                <FontAwesomeIcon icon={faChartBar} className="text-green-600" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Resultados de análisis</p>
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Analytics</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700">Muestras Procesadas</p>
                            <p className="text-3xl font-bold text-indigo-600">85%</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700">Promedio de Análisis</p>
                            <p className="text-3xl font-bold text-green-600">2.3 días</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Reports;


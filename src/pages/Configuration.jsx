import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faHome } from '@fortawesome/free-solid-svg-icons';

const iconMap = {
    'fa-cog': faCog, 'fa-home': faHome,
};

const Configuration = () => {
    return (
        <main className="p-6 flex-1">
            <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                    <FontAwesomeIcon icon={iconMap['fa-home']} className="mr-1 text-indigo-500" />
                    <a href="#" className="hover:underline">Inicio</a> 
                    <span className="mx-2">/</span> 
                    <span className="font-semibold text-gray-700">Configuración</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Configuración del Sistema</h1>
                <p className="text-gray-500 mt-1">Gestiona las configuraciones y preferencias del sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuración General */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Configuración General</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Laboratorio</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Laboratorio del Instituto"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">URL del Backend</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="http://localhost:5000"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="block text-sm font-medium text-gray-700">Notificaciones</label>
                            <input type="checkbox" className="rounded text-indigo-600" defaultChecked />
                        </div>
                    </div>
                    <button className="mt-4 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition">
                        Guardar Cambios
                    </button>
                </div>

                {/* Configuración de Alerts */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Configuración de Alertas</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email para Alertas</label>
                            <input 
                                type="email" 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="admin@laboratorio.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Recordatorios Automáticos</label>
                            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option>Diarios</option>
                                <option>Semanal</option>
                                <option>Mensual</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="block text-sm font-medium text-gray-700">Alertas por Email</label>
                            <input type="checkbox" className="rounded text-indigo-600" defaultChecked />
                        </div>
                    </div>
                    <button className="mt-4 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </main>
    );
};

export default Configuration;


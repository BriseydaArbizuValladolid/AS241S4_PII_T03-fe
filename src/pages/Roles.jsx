import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faHome } from '@fortawesome/free-solid-svg-icons';

const iconMap = {
    'fa-key': faKey, 'fa-home': faHome,
};

const Roles = () => {
    return (
        <main className="p-6 flex-1">
            <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                    <FontAwesomeIcon icon={iconMap['fa-home']} className="mr-1 text-indigo-500" />
                    <a href="#" className="hover:underline">Inicio</a> 
                    <span className="mx-2">/</span> 
                    <span className="font-semibold text-gray-700">Gestión de Roles</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Roles</h1>
                <p className="text-gray-500 mt-1">Administra los roles y permisos del sistema.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">Roles del Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2">Administrador</h3>
                        <p className="text-sm text-gray-600 mb-4">Acceso completo al sistema</p>
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500">✓ Gestión de Clientes</p>
                            <p className="text-xs text-gray-500">✓ Gestión de Muestras</p>
                            <p className="text-xs text-gray-500">✓ Configuración</p>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2">Analista</h3>
                        <p className="text-sm text-gray-600 mb-4">Análisis de muestras</p>
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500">✓ Ver Muestras</p>
                            <p className="text-xs text-gray-500">✓ Registro de Resultados</p>
                            <p className="text-xs text-gray-500">✗ Configuración</p>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2">Recepcionista</h3>
                        <p className="text-sm text-gray-600 mb-4">Recepción de muestras</p>
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500">✓ Recibir Muestras</p>
                            <p className="text-xs text-gray-500">✓ Ver Clientes</p>
                            <p className="text-xs text-gray-500">✗ Analizar</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Roles;


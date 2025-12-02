// src/components/Header.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    return (
        <header className="flex justify-between items-center p-4 border-b bg-white shadow-sm flex-shrink-0">
            <div className="flex items-center">
                <span className="text-xl font-bold text-gray-800">
                    VG <span className="text-sm font-normal text-gray-500 ml-1">Sistema Recepción de Muestras de Laboratorio</span>
                </span>
            </div>

            <div className="flex-grow max-w-lg mx-8 relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="w-full p-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="flex items-center space-x-4 text-gray-600">
                <button className="p-2 hover:bg-gray-100 rounded-full relative">
                    <FontAwesomeIcon icon={faBell} className="w-6 h-6 text-xl" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                
                <button className="flex items-center space-x-1 text-red-500 hover:text-red-700 font-semibold transition duration-200 ml-6">
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                    <span className="text-sm">Cerrar Sesión</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
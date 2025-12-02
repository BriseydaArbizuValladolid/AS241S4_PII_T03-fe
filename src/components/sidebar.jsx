// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHome, faFileInvoice, faKey, faUsers, faChartBar, faCog, 
    faFilePdf, faPlus, faCalendarAlt, faBell, faVial, faChartLine
} from '@fortawesome/free-solid-svg-icons';

const iconMap = {
    'fa-home': faHome, 'fa-file-invoice': faFileInvoice, 'fa-key': faKey, 'fa-users': faUsers, 
    'fa-chart-bar': faChartBar, 'fa-cog': faCog, 'fa-file-pdf': faFilePdf, 
    'fa-plus': faPlus, 'fa-calendar-alt': faCalendarAlt, 'fa-bell': faBell, 
    'fa-vial': faVial, 'fa-chart-line': faChartLine,
};

const initialNavItems = [
    { id: 1, name: 'Dashboard', iconName: 'fa-home', path: '/', active: true }, 
    { id: 2, name: 'Clientes', iconName: 'fa-users', path: '/clientes', active: false }, // Nombre acortado
    { id: 3, name: 'Solicitudes', iconName: 'fa-file-invoice', path: '/solicitudes', active: false },
    { id: 4, name: 'Muestras', iconName: 'fa-vial', path: '/muestras', active: false },
    { id: 5, name: 'Resultados', iconName: 'fa-chart-line', path: '/resultados', active: false },
    { id: 6, name: 'Roles', iconName: 'fa-key', path: '/roles', active: false }, // Nombre acortado
    { id: 7, name: 'Reportes', iconName: 'fa-chart-bar', path: '/reportes', active: false }, // Nombre acortado
    { id: 8, name: 'Configuración', iconName: 'fa-cog', path: '/configuracion', active: false },
];

const quickAccess = [
    { name: 'Reporte', iconName: 'fa-file-pdf', color: 'bg-blue-600', action: 'generateReport' },
    { name: 'Solicitud', iconName: 'fa-plus', color: 'bg-green-600', action: 'newRequest' },
    { name: 'Calendario', iconName: 'fa-calendar-alt', color: 'bg-purple-600', action: 'viewCalendar' },
    { name: 'Alertas', iconName: 'fa-bell', color: 'bg-orange-600', action: 'configureAlerts' },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const [navItems, setNavItems] = useState(initialNavItems);

    const handleItemClick = (clickedId, path) => {
        const updatedItems = navItems.map(item => ({
            ...item,
            active: item.id === clickedId, 
        }));
        setNavItems(updatedItems);
        navigate(path);
    };

    const handleQuickAction = (action) => {
        switch (action) {
            case 'generateReport': navigate('/reportes'); break;
            case 'newRequest': navigate('/solicitudes'); break;
            case 'viewCalendar': alert('Próximamente: Vista de calendario'); break;
            case 'configureAlerts': navigate('/configuracion'); break;
            default: console.log('Acción no implementada:', action);
        }
    };

    return (
        // CAMBIO 1: Ancho reducido a w-52 y padding reducido a p-3
        <nav className="w-52 h-full p-3 bg-gray-800 text-white flex flex-col flex-shrink-0 text-sm shadow-xl transition-all duration-300">
            
            {/* Perfil de Usuario Compacto */}
            <div className="flex flex-col items-center border-b border-gray-700 pb-3 mb-3">
                {/* CAMBIO 2: Avatar más pequeño */}
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold mb-2 shadow-lg">
                    VC
                </div>
                <p className="font-semibold text-sm">Administrador</p>
                <p className="text-xs text-gray-400 mb-2">admin@email.com</p>
                <button className="px-3 py-1 text-xs bg-gray-700 hover:bg-indigo-600 border border-gray-600 rounded-full transition duration-200">
                    Cambiar Rol
                </button>
            </div>

            {/* Navegación */}
            <ul className="space-y-1 mb-4 flex-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <li key={item.id}> 
                        <a 
                            href="#" 
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group relative
                                ${item.active 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            onClick={(e) => {
                                e.preventDefault(); 
                                handleItemClick(item.id, item.path); 
                            }}
                        >
                            {/* CAMBIO 3: Iconos y texto ajustados */}
                            <div className="w-5 flex justify-center mr-3">
                                <FontAwesomeIcon icon={iconMap[item.iconName]} className="text-sm" />
                            </div>
                            <span className="font-medium truncate">{item.name}</span>
                            
                            {/* Indicador activo pequeño a la izquierda */}
                            {item.active && (
                                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-r-md opacity-50"></span>
                            )}
                        </a>
                    </li>
                ))}
            </ul>

            {/* Accesos Rápidos Compactos */}
            <div className="mt-auto pt-3 border-t border-gray-700"> 
                <h3 className="uppercase text-[10px] font-bold text-gray-500 mb-2 tracking-wider">Accesos Rápidos</h3>
                {/* CAMBIO 4: Grid más apretado y elementos más pequeños */}
                <div className="grid grid-cols-2 gap-2">
                    {quickAccess.map((item) => (
                        <button 
                            key={item.name} 
                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 hover:shadow-md border border-transparent hover:border-gray-600 transition duration-200 group"
                            onClick={() => handleQuickAction(item.action)}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${item.color} group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                                <FontAwesomeIcon icon={iconMap[item.iconName]} className="text-white text-sm" />
                            </div>
                            <span className="text-[10px] text-gray-300 group-hover:text-white leading-tight">{item.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;
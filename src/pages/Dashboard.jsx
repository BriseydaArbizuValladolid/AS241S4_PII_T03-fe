import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBox, faVial, faMicroscope, faUsers, faMapPin, faTint, 
    faCheckCircle, faExclamationTriangle, faPaperPlane, faChevronRight, faSearch, faBell, faDatabase
} from '@fortawesome/free-solid-svg-icons';
import { getClients } from '../shared/api/clientApi';
import { getRequests } from '../shared/api/requestApi';
import { getSamples } from '../shared/api/sampleApi';
import { getAnalysisResults } from '../shared/api/analysisApi';

// Mapeo de íconos
const iconMap = {
    'fa-box': faBox, 'fa-vial': faVial, 'fa-microscope': faMicroscope, 
    'fa-users': faUsers, 'fa-map-pin': faMapPin, 'fa-tint': faTint, 
    'fa-check-circle': faCheckCircle, 'fa-exclamation-triangle': faExclamationTriangle, 
    'fa-paper-plane': faPaperPlane, 'fa-database': faDatabase
};

// Función auxiliar para calcular tiempo relativo
const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recientemente';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `Hace ${diffHours} h`;
    if (diffMins > 0) return `Hace ${diffMins} min`;
    return 'Hace un momento';
};

// --- COMPONENTES VISUALES ---

const KpiCard = ({ title, value, details, iconName, colorClass }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider">{title}</h3>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-base shadow-sm ${colorClass}`}>
                <FontAwesomeIcon icon={iconMap[iconName]} />
            </div>
        </div>
        <div className="mt-auto">
            {/* Animación simple de entrada para el número */}
            <p className="text-4xl font-bold text-slate-800 tracking-tight animate-fadeIn">{value}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">{details}</p>
        </div>
    </div>
);

const ModuleCard = ({ iconName, title, description, onOpen, iconColorBg, iconColorText }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all">
        <div className={`w-10 h-10 mb-3 rounded-xl flex items-center justify-center text-lg ${iconColorBg} ${iconColorText}`}>
            <FontAwesomeIcon icon={iconMap[iconName]} />
        </div>
        <h4 className="font-bold text-base text-slate-800 mb-1">{title}</h4>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed flex-grow">{description}</p>
        <div className="flex justify-end">
            <button onClick={onOpen} className="bg-slate-900 text-white px-5 py-1.5 rounded-full text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-1">
                Abrir
            </button>
        </div>
    </div>
);

const ListItem = ({ icon, title, subtitle, time, isActivity = false }) => (
    <div className="flex items-center p-3 bg-white rounded-xl border border-gray-50 mb-2 hover:bg-gray-50 transition-colors">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${isActivity ? 'bg-slate-800' : 'bg-slate-200 text-slate-600'}`}>
            {typeof icon === 'string' ? icon : <FontAwesomeIcon icon={icon} />}
        </div>
        <div className="ml-3 flex-1 min-w-0">
            <h5 className="font-bold text-slate-800 text-sm truncate">{title}</h5>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
        </div>
        {time && <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-2">{time}</span>}
        {!time && !isActivity && (
             <button className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs hover:bg-slate-700 flex-shrink-0 ml-2">
                <FontAwesomeIcon icon={faChevronRight} />
             </button>
        )}
    </div>
);

// --- COMPONENTE PRINCIPAL ---

const Dashboard = () => {
    const navigate = useNavigate();
    
    // Estado unificado para todos los datos
    const [stats, setStats] = useState({
        clients: { total: 0, active: 0, inactive: 0 },
        requests: { total: 0 },
        samples: { total: 0, pending: 0 },
        results: { total: 0 }
    });
    
    const [pendingTasks, setPendingTasks] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // 1. Carga paralela de todas las APIs
            const [rawClients, rawRequests, rawSamples, rawResults] = await Promise.all([
                getClients().catch(() => []),
                getRequests().catch(() => []),
                getSamples().catch(() => []),
                getAnalysisResults().catch(() => [])
            ]);

            // --- LÓGICA DE REFERENCIA APLICADA (Limpieza y Cálculo) ---

            // A. CLIENTES: Filtrar duplicados por ID (como en tu referencia)
            const uniqueClients = rawClients.filter((client, index, self) => 
                index === self.findIndex(c => c.customer_id === client.customer_id)
            );
            // Calcular estados
            const totalClients = uniqueClients.length;
            const activeClients = uniqueClients.filter(c => c.state === 'A').length;
            const inactiveClients = uniqueClients.filter(c => c.state === 'I').length;

            // B. MUESTRAS: Calcular totales
            const totalSamples = rawSamples.length;
            
            // C. RESULTADOS: Filtrar duplicados si fuera necesario (por seguridad)
            const uniqueResults = rawResults.filter((result, index, self) =>
                index === self.findIndex(r => r.id === result.id)
            );
            const totalResults = uniqueResults.length;

            // D. PENDIENTES: Muestras sin resultado asociado
            // Creamos un Set de IDs de muestras que YA tienen resultados para búsqueda rápida O(1)
            const samplesWithResults = new Set(uniqueResults.map(r => r.sample_id));
            const pendingSamplesCount = totalSamples - samplesWithResults.size;

            // Actualizar Estado de Estadísticas
            setStats({
                clients: { total: totalClients, active: activeClients, inactive: inactiveClients },
                requests: { total: rawRequests.length },
                samples: { total: totalSamples, pending: pendingSamplesCount },
                results: { total: totalResults }
            });

            // --- GENERACIÓN DE TAREAS ---
            const tasks = [];
            
            if (pendingSamplesCount > 0) {
                tasks.push({
                    icon: faMicroscope,
                    title: "Análisis Pendientes",
                    subtitle: `${pendingSamplesCount} muestras requieren atención`
                });
            }

            if (inactiveClients > 0) {
                tasks.push({
                    icon: faUsers,
                    title: "Clientes Inactivos",
                    subtitle: `${inactiveClients} usuarios marcados como inactivos`
                });
            }

            // Si hay solicitudes creadas recientemente sin muestras asociadas (Lógica de negocio simulada)
            if (rawRequests.length > totalSamples) {
                tasks.push({
                    icon: faPaperPlane,
                    title: "Solicitudes Nuevas",
                    subtitle: "Falta recepcionar muestras físicas"
                });
            }

            // Si no hay tareas, mensaje por defecto
            if (tasks.length === 0) {
                tasks.push({ icon: faCheckCircle, title: "Sin pendientes", subtitle: "Todo el sistema está al día" });
            }
            setPendingTasks(tasks.slice(0, 3));

            // --- GENERACIÓN DE ACTIVIDAD (Timeline Unificado) ---
            let timeline = [];

            // Mapear Clientes Recientes
            uniqueClients.forEach(c => {
                // Usamos created_at si existe, o simulamos fecha reciente para demostración si la API no la trae
                const date = c.created_at || new Date().toISOString(); 
                timeline.push({
                    date: date,
                    initials: (c.name?.[0] || 'C') + (c.surname?.[0] || 'L'),
                    name: `${c.name} ${c.surname}`,
                    action: c.state === 'A' ? 'Cliente Activo en sistema' : 'Cliente Inactivo',
                    type: 'client'
                });
            });

            // Mapear Muestras Recientes
            rawSamples.forEach(s => {
                timeline.push({
                    date: s.collection_date || new Date().toISOString(),
                    initials: 'MU',
                    name: `Muestra ${s.sample_code}`,
                    action: 'Recepcionada en laboratorio',
                    type: 'sample'
                });
            });

            // Ordenar por fecha descendente (Lo más nuevo primero)
            timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Formatear para visualización
            const formattedActivity = timeline.slice(0, 4).map(item => ({
                initials: item.initials,
                name: item.name,
                action: item.action,
                time: getTimeAgo(item.date)
            }));
            
            setRecentActivity(formattedActivity);

        } catch (error) {
            console.error('Error cargando dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-6 bg-gray-50 min-h-screen font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Dashboard General</h1>
                    <p className="text-gray-500 text-xs">Resumen de operaciones del laboratorio</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-full shadow-sm text-gray-400"><FontAwesomeIcon icon={faSearch} className="w-3.5 h-3.5" /></div>
                    <div className="bg-white p-1.5 rounded-full shadow-sm text-gray-400 relative">
                        <FontAwesomeIcon icon={faBell} className="w-3.5 h-3.5" />
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                    </div>
                    <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
                </div>
            </div>

            {/* Banner */}
            <div className="bg-amber-400 rounded-2xl p-6 mb-8 shadow-sm text-slate-900 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl font-extrabold mb-2">Bienvenido</h2>
                    <p className="text-slate-800 text-sm font-medium leading-relaxed opacity-90">
                        Gestiona eficientemente los procesos de recepción de muestras. Los datos a continuación son calculados en tiempo real desde la base de datos.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                    <FontAwesomeIcon icon={faDatabase} className="text-8xl text-white" />
                </div>
            </div>

            {/* KPIs con Datos Reales Calculados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                
                {/* 1. Clientes (Lógica aplicada: Total vs Activos) */}
                <KpiCard 
                    title="CLIENTES TOTALES" 
                    value={loading ? '-' : stats.clients.total} 
                    details={loading ? 'Calculando...' : `${stats.clients.active} Activos / ${stats.clients.inactive} Inactivos`} 
                    iconName="fa-users" 
                    colorClass="bg-blue-500" 
                />

                {/* 2. Solicitudes */}
                <KpiCard 
                    title="SOLICITUDES" 
                    value={loading ? '-' : stats.requests.total} 
                    details="Total Registrado" 
                    iconName="fa-map-pin" 
                    colorClass="bg-cyan-500" 
                />

                {/* 3. Muestras */}
                <KpiCard 
                    title="MUESTRAS" 
                    value={loading ? '-' : stats.samples.total} 
                    details="Total Histórico" 
                    iconName="fa-box" 
                    colorClass="bg-amber-500" 
                />

                {/* 4. Resultados (Lógica aplicada: Total vs Pendientes) */}
                <KpiCard 
                    title="RESULTADOS" 
                    value={loading ? '-' : stats.results.total} 
                    details={loading ? 'Calculando...' : `${stats.samples.pending} pendientes de análisis`} 
                    iconName="fa-check-circle" 
                    colorClass="bg-emerald-500" 
                />
            </div>

            {/* Módulos Principales */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-5">Módulos Principales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <ModuleCard iconName="fa-users" title="Gestión Clientes" description="Base de datos de clientes." onOpen={() => navigate('/clientes')} iconColorBg="bg-purple-100" iconColorText="text-purple-600" />
                    <ModuleCard iconName="fa-map-pin" title="Recolección" description="Solicitud de muestras." onOpen={() => navigate('/solicitudes')} iconColorBg="bg-cyan-100" iconColorText="text-cyan-600" />
                    <ModuleCard iconName="fa-box" title="Recepción" description="Entrada al laboratorio." onOpen={() => navigate('/muestras')} iconColorBg="bg-blue-100" iconColorText="text-blue-600" />
                    <ModuleCard iconName="fa-check-circle" title="Resultados" description="Reportes finales." onOpen={() => navigate('/resultados')} iconColorBg="bg-emerald-100" iconColorText="text-emerald-600" />
                </div>
            </div>

            {/* Listas Inferiores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-5">Tareas Pendientes</h3>
                    <div className="space-y-2">
                        {loading ? <p className="text-sm text-gray-400 animate-pulse">Analizando datos...</p> : 
                            pendingTasks.map((task, idx) => (
                                <ListItem key={idx} icon={task.icon} title={task.title} subtitle={task.subtitle} />
                            ))
                        }
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-5">Actividad Reciente</h3>
                    <div className="space-y-2">
                         {loading ? <p className="text-sm text-gray-400 animate-pulse">Cargando historial...</p> : 
                            recentActivity.map((act, idx) => (
                                <ListItem key={idx} isActivity={true} icon={act.initials} title={act.name} subtitle={act.action} time={act.time} />
                            ))
                        }
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
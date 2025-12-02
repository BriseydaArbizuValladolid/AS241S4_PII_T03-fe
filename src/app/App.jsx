// src/app/App.jsx 
import React from 'react'; 
import { Routes, Route } from 'react-router-dom';
import Header from '../components/header'; 
import Sidebar from '../components/sidebar'; 
import Dashboard from '../pages/Dashboard';
import Clients from '../pages/Clients';
import Requests from '../pages/Requests';
import Samples from '../pages/Samples';
import Results from '../pages/Results';
import Reports from '../pages/Reports';
import Roles from '../pages/Roles';
import Configuration from '../pages/Configuration';

// --- COMPONENTE PRINCIPAL ---
const App = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto bg-gray-50">
                <Header />

                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clientes" element={<Clients />} />
                    <Route path="/solicitudes" element={<Requests />} />
                    <Route path="/muestras" element={<Samples />} />
                    <Route path="/resultados" element={<Results />} />
                    <Route path="/reportes" element={<Reports />} />
                    <Route path="/roles" element={<Roles />} />
                    <Route path="/configuracion" element={<Configuration />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
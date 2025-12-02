import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, faCheck, faPowerOff, faClock, faSearch, faTable, 
    faList, faFileExport, faPlus, faEye, faEdit, faHome, faUserShield, faFilePdf, faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import FormClient from '../widgets/FormClient';
import DetailModal from '../components/DetailModal';
import EditModal from '../components/EditModal';
import { getClients, deleteClient, restoreClient, getClientsByStatus, updateClient, createClient } from '../shared/api/clientApi';
import { generatePDFFromData } from '../utils/pdfGenerator';
import { generateExcel } from '../utils/excelGenerator'; // Importar tu nueva función
// Mapeo de iconos
const iconMap = {
    'fa-users': faUsers, 'fa-check': faCheck, 'fa-power-off': faPowerOff, 
    'fa-clock': faClock, 'fa-search': faSearch, 'fa-table': faTable, 
    'fa-list': faList, 'fa-file-export': faFileExport, 'fa-plus': faPlus,
    'fa-eye': faEye, 'fa-edit': faEdit, 'fa-home': faHome, 'fa-user-shield': faUserShield, 'fa-file-pdf':faFilePdf, 'fa-file-excel':faFileExcel,
};

// Función para obtener iniciales del nombre completo
const getInitials = (name, surname) => {
    const firstInitial = name ? name.charAt(0).toUpperCase() : '';
    const lastInitial = surname ? surname.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
};

// Función para obtener nombre completo
const getFullName = (name, surname) => {
    return `${name || ''} ${surname || ''}`.trim();
};

const SummaryCard = ({ title, value, iconName, iconBgColor, iconColor, barColor }) => (
    // 1. Contenedor principal: Quitamos el 'p-6' de aquí. 
    // Añadimos 'overflow-hidden' para que las esquinas de la barra redondeada se vean bien dentro del borde.
    <div className="bg-white rounded-xl shadow-md border-b-4 border-transparent hover:border-indigo-500 transition duration-300 overflow-hidden">
        
        {/* 2. Contenedor del contenido superior: APLICAMOS el padding (p-6) aquí. */}
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconBgColor} ${iconColor}`}>
                    <FontAwesomeIcon icon={iconMap[iconName]} />
                </div>
            </div>
        </div>
        
        {/* 3. BARRA DE PROGRESO: Este div no tiene padding, por lo que se extiende de borde a borde. */}
        {/* Nota: Hemos movido el 'mb-4' de la barra de progreso a la mb-4 del contenedor flex superior. */}
        <div className="h-1 bg-gray-200 rounded-full">
            {/* 4. Aseguramos que el valor no exceda el 100% */}
            <div 
                className={`h-full ${barColor} rounded-full`} 
                style={{ width: `${Math.min(value * 5, 100)}%` }} // Asumiendo que `value * 5` es tu lógica de porcentaje (máx 100%)
            ></div>
        </div>
    </div>
);
const ClientTable = ({ data, onToggleStatus, onSelectClient, onSelectAll, onViewClient, onEditClient, selectedClients }) => (
    <div id="client-pdf-area" className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <input 
                            type="checkbox" 
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                            checked={data.length > 0 && selectedClients.length === data.length}
                            onChange={(e) => onSelectAll(e.target.checked)}
                        />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Dirección</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {data.map((client) => (
                    <tr key={client.customer_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap w-12">
                            <input 
                                type="checkbox" 
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                checked={selectedClients.includes(client.customer_id)}
                                onChange={(e) => onSelectClient(client.customer_id, e.target.checked)}
                            />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs mr-3`}>
                                    {getInitials(client.name, client.surname)}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{getFullName(client.name, client.surname)}</div>
                                    <div className="text-xs text-gray-500">ID: {client.customer_id}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700"> {client.address?.address_id || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${client.state === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {client.state === 'A' ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3 text-gray-500">
                                {client.state === 'A' ? (
                                    // Cliente Activo: mostrar Ver, Editar y Desactivar
                                    <>
                                        <button 
                                            onClick={() => onViewClient(client.customer_id)}
                                            className="hover:text-indigo-600 transition"
                                            title="Ver detalles"
                                        >
                                            <FontAwesomeIcon icon={iconMap['fa-eye']} />
                                        </button>
                                        <button 
                                            onClick={() => onEditClient(client.customer_id)}
                                            className="hover:text-indigo-600 transition"
                                            title="Editar"
                                        >
                                            <FontAwesomeIcon icon={iconMap['fa-edit']} />
                                        </button>
                                        <button 
                                            onClick={() => onToggleStatus(client.customer_id, client.state)}
                                            className="hover:text-red-600 transition"
                                            title="Desactivar"
                                        >
                                            <FontAwesomeIcon icon={iconMap['fa-power-off']} />
                                        </button>
                                    </>
                                ) : (
                                    // Cliente Inactivo: solo mostrar Restaurar
                                    <button 
                                        onClick={() => onToggleStatus(client.customer_id, client.state)}
                                        className="hover:text-green-600 transition"
                                        title="Restaurar cliente"
                                    >
                                        <FontAwesomeIcon icon={iconMap['fa-check']} />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Clients = () => {
    const [subView, setSubView] = useState('list');
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [viewMode, setViewMode] = useState('table');
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editClientData, setEditClientData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [summaryCards, setSummaryCards] = useState([
        { title: 'Total de Clientes', value: 0, iconName: 'fa-users', iconBgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', barColor: 'bg-indigo-600' },
        { title: 'Clientes Activos', value: 0, iconName: 'fa-check', iconBgColor: 'bg-green-100', iconColor: 'text-green-600', barColor: 'bg-green-600' },
        { title: 'Clientes Inactivos', value: 0, iconName: 'fa-power-off', iconBgColor: 'bg-red-100', iconColor: 'text-red-600', barColor: 'bg-red-600' },
        { title: 'Seleccionados', value: 0, iconName: 'fa-clock', iconBgColor: 'bg-teal-100', iconColor: 'text-teal-600', barColor: 'bg-teal-600' },
    ]);
    const [loading, setLoading] = useState(true);

    // Cargar datos del backend
    useEffect(() => {
        loadClients();
    }, []);

    // Filtrar clientes cuando cambien los filtros
    useEffect(() => {
        filterClients();
    }, [clients, searchTerm, statusFilter]);

    // Actualizar contador de seleccionados
    useEffect(() => {
        setSummaryCards(cards => [
            ...cards.slice(0, 3),
            { ...cards[3], value: selectedClients.length }
        ]);
    }, [selectedClients]);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await getClients();
            
            // Validar y limpiar datos duplicados
            const uniqueData = data.filter((client, index, self) => 
                index === self.findIndex(c => c.customer_id === client.customer_id)
            );
            
            console.log('📊 Clientes únicos cargados:', uniqueData.length);
            setClients(uniqueData);
            
            // Calcular estadísticas
            const total = uniqueData.length;
            const activos = uniqueData.filter(c => c.state === 'A').length;
            const inactivos = uniqueData.filter(c => c.state === 'I').length;
            
            setSummaryCards(cards => [
                { ...cards[0], value: total },
                { ...cards[1], value: activos },
                { ...cards[2], value: inactivos },
                { ...cards[3], value: selectedClients.length },
            ]);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterClients = () => {
        let filtered = clients;

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(client => 
                getFullName(client.name, client.surname).toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone_number.includes(searchTerm)
            );
        }

        // Filtrar por estado
        if (statusFilter !== 'Todos') {
            const stateFilter = statusFilter === 'Activo' ? 'A' : 'I';
            filtered = filtered.filter(client => client.state === stateFilter);
        }

        setFilteredClients(filtered);
    };

    const handleToggleStatus = async (customerId, currentState) => {
        try {
            if (currentState === 'A') {
                await deleteClient(customerId);
            } else {
                await restoreClient(customerId);
            }
            await loadClients(); // Recargar lista
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        }
    };

    const handleSelectClient = (customerId, isSelected) => {
        if (isSelected) {
            setSelectedClients(prev => [...prev, customerId]);
        } else {
            setSelectedClients(prev => prev.filter(id => id !== customerId));
        }
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedClients(filteredClients.map(client => client.customer_id));
        } else {
            setSelectedClients([]);
        }
    };

    const handleViewClient = (customerId) => {
        const client = clients.find(c => c.customer_id === customerId);
        setSelectedClient(client);
        setShowClientModal(true);
    };

const handleEditClient = (customerId) => {
        const client = clients.find(c => c.customer_id === customerId);

        if (client) {
            // 1. Extraer los datos base del cliente
            const clientData = {
                customer_id: client.customer_id,
                name: client.name,
                surname: client.surname,
                email: client.email,
                phone_number: client.phone_number || '',
                state: client.state
            };

            // 2. Extraer y APLANAR los datos de la dirección, si existen
            const addressData = client.address ? {
                // Campos de dirección aplanados
                address_id: client.address.address_id, // Necesario para identificar la dirección
                country: client.address.country || '',
                department: client.address.department || '',
                province: client.address.province || '',
                district: client.address.district || '',
                street: client.address.street || '',
                zip_code: client.address.zip_code || '',
                reference: client.address.reference || '',
            } : {}; // Si no hay dirección, es un objeto vacío.
            
            // 3. Establecer el estado con la data APLANADA
            setEditClientData({ ...clientData, ...addressData });
            setShowEditModal(true);
        }
    };
const handleSaveClient = async () => {
        if (!editClientData || !editClientData.customer_id) return;
        
        try {
            setEditLoading(true);
            
            const clientFields = ['name', 'surname', 'email', 'phone_number', 'state'];
            const addressFields = ['address_id', 'country', 'department', 'province', 'district', 'street', 'zip_code', 'reference'];
            
            // 1. Construir el objeto de datos del cliente
            const clientUpdateData = {};
            clientFields.forEach(field => {
                const value = editClientData[field];
                clientUpdateData[field] = (typeof value === 'string' && value) ? value.trim() : value;
            });
            
            // 2. REAGRUPAR los campos de dirección
            const addressUpdateData = {};
            addressFields.forEach(field => {
                addressUpdateData[field] = editClientData[field];
            });
            
            // 🚨 VERIFICACIÓN CRÍTICA: ¿Existe el ID de dirección?
            if (!addressUpdateData.address_id && addressFields.some(field => editClientData[field])) {
            delete addressUpdateData.address_id; 
            console.warn("Creando nueva dirección (sin address_id) en el payload.");
            } else if (!addressUpdateData.address_id) {
            // Si no hay ID y la dirección está vacía, no envíes el objeto 'address'.
            delete finalUpdatePayload.address;
            }
            
            // 3. Combinar todo en el payload final
            const finalUpdatePayload = {
                ...clientUpdateData,
                address: addressUpdateData 
            };
            
            console.log('📤 Payload Final (Reagrupado) para la API:', finalUpdatePayload);
            
            // 4. Llamada a la API
            const response = await updateClient(editClientData.customer_id, finalUpdatePayload);
            console.log('✅ Cliente actualizado. Respuesta API:', response);
            
            // Esperar un poco antes de recargar
            await new Promise(resolve => setTimeout(resolve, 500)); 
            await loadClients();
            
            setEditClientData(null);
            setShowEditModal(false);
        } catch (error) {
            console.error('❌ Error al actualizar cliente:', error);
            // Muestra el error de forma clara
            alert(`Error al actualizar el cliente: ${error.message}. Revisa la pestaña Network (Red) en la consola para más detalles.`);
        } finally {
            setEditLoading(false);
        }
    };
    const handleChangeEditField = (field, value) => {
        setEditClientData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleExportClients = () => {
        const dataToExport = selectedClients.length > 0 
            ? filteredClients.filter(client => selectedClients.includes(client.customer_id))
            : filteredClients;
        
        const csvContent = [
            ['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Estado'],
            ...dataToExport.map(client => [
                client.customer_id,
                client.name,
                client.surname,
                client.email,
                client.phone_number,
                client.state === 'A' ? 'Activo' : 'Inactivo'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };
const handleDownloadPDF = async () => {
    
    // 1. Validación inicial de datos
    const sourceData = clients || []; // Protección por si 'clients' es null
    
    // Lógica de selección: ¿Usuario seleccionó manual o quiere todo lo filtrado?
    const clientsToExport = selectedClients.length > 0
        ? sourceData.filter(client => selectedClients.includes(client.customer_id))
        : filteredClients;

    // CORRECCIÓN 1: Feedback visual al usuario (no solo consola)
    if (!clientsToExport || clientsToExport.length === 0) {
        const msg = "No hay datos para exportar. Por favor, selecciona clientes o aplica un filtro válido.";
        alert(msg); // O usa tu librería de notificaciones (ej. toast.error(msg))
        console.warn(msg);
        return;
    }

    // 2. Definir Columnas
    const columns = [
        "ID", "Cliente", "Email", "Teléfono", "ID Dir.", "Dirección Completa"
    ];

    // 3. Transformación de datos (Data Mapping)
    const transformedData = clientsToExport.map(client => {
        
        // Manejo seguro de Dirección
        const address = client.address || {}; // Evita error si address es null
        
        const addressParts = [
            address.street, 
            address.number, 
            address.city, 
            address.zip_code
        ].filter(part => part && part.toString().trim() !== ''); // Filtra nulos Y strings vacíos

        const fullAddress = addressParts.length > 0 
            ? addressParts.join(', ') 
            : 'Dirección no disponible';
        
        // CORRECCIÓN 2: Manejo seguro del nombre sin depender de funciones externas
        // Si tienes 'getFullName' importado, úsalo. Si no, usa esta lógica segura:
        const name = client.name || '';
        const surname = client.surname || '';
        // .trim() elimina espacios al inicio/final si falta el nombre o apellido
        const fullName = `${name} ${surname}`.trim() || 'Sin Nombre';
        
        const status = client.state === 'A' ? 'Activo' : 'Inactivo';
        const clientNameWithStatus = `${fullName} (${status})`;
        
        return [
            client.customer_id,
            clientNameWithStatus,
            client.email || 'N/A',
            client.phone_number || 'N/A',
            address.address_id || 'N/A',
            fullAddress 
        ];
    });

    try {
        console.log(`📥 Generando PDF para ${transformedData.length} clientes...`);

        // Nota: generatePDFFromData no es necesariamente asíncrono en jsPDF puro,
        // pero dejar el 'await' no hace daño y prepara por si cambias la lógica a futuro.
        await generatePDFFromData( 
            "Reporte de Clientes", 
            columns, 
            transformedData, 
            `Listado_Clientes_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf` // Nombre con fecha
        );
        
        // Feedback de éxito
        // alert("PDF generado correctamente"); // Opcional
        console.log('PDF generado con éxito.');
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert("Hubo un error al generar el documento PDF. Revisa la consola para más detalles.");
    }
};

const handleDownloadExcel = () => {
        const sourceData = clients || [];
        
        // Misma lógica de filtrado que en el PDF
        const clientsToExport = selectedClients.length > 0
            ? sourceData.filter(client => selectedClients.includes(client.customer_id))
            : filteredClients;

        if (clientsToExport.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        // Mapeamos los datos para que las columnas del Excel tengan nombres bonitos
        const dataForExcel = clientsToExport.map(client => {
            // Lógica de dirección
            const address = client.address || {};
            const addressParts = [address.street, address.number, address.city].filter(Boolean);
            const fullAddress = addressParts.join(', ') || 'S/D';
            
            // Lógica de nombre
            const fullName = `${client.name || ''} ${client.surname || ''}`.trim();

            return {
                "ID": client.customer_id,
                "Nombre Completo": fullName,
                "Estado": client.state === 'A' ? 'Activo' : 'Inactivo',
                "Email": client.email || 'N/A',
                "Teléfono": client.phone_number || 'N/A',
                "Dirección": fullAddress
            };
        });

        generateExcel(dataForExcel, `Lista_Clientes_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    };
    // ---------------------------------------------------------------------------------------------------------------------
    const renderClientList = () => (
        <main className="p-6 flex-1">
            <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                    <FontAwesomeIcon icon={iconMap['fa-home']} className="mr-1 text-indigo-500" />
                    <a href="#" className="hover:underline">Inicio</a> 
                    <span className="mx-2">/</span> 
                    <span className="font-semibold text-gray-700">Gestión de Clientes</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
                <p className="text-gray-500 mt-1">Administra eficientemente los clientes del sistema.</p>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
                {summaryCards.map((card, index) => (
                    <SummaryCard key={index} {...card} />
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative flex-grow max-w-sm mr-4">
                        <FontAwesomeIcon icon={iconMap['fa-search']} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Nombre, email o documento..." 
                            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="filter-estado" className="text-sm text-gray-600">FILTRAR POR ESTADO</label>
                            <select 
                                id="filter-estado" 
                                className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="Todos">Todos</option>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>

                        <div className="flex items-center border border-gray-300 rounded-lg p-1 bg-gray-50">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all duration-300 ${
                                    viewMode === 'list' 
                                        ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
                                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
                                }`}
                                title="Vista de tarjetas"
                            >
                                <FontAwesomeIcon icon={iconMap['fa-list']} className="text-lg" />
                            </button>
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-md transition-all duration-300 ${
                                    viewMode === 'table' 
                                        ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
                                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
                                }`}
                                title="Vista de tabla"
                            >
                                <FontAwesomeIcon icon={iconMap['fa-table']} className="text-lg" />
                            </button>
                        </div>
                        {/* 💡 BOTÓN DE DESCARGA DE PDF AÑADIDO */}
                        <button 
                            onClick={handleDownloadPDF} // Llama a la nueva función
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-400 transition"
                            title="Descargar reporte en PDF"
                        >
                            <FontAwesomeIcon icon={iconMap['fa-file-pdf']} />
                            <span>PDF</span>
                        </button>

                        {/* Botón EXCEL */}
                        <button 
                            onClick={handleDownloadExcel}
                            className="flex items-center space-x-2 px-4 py-2 border border-green-200 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition border-green-300"
                            title="Descargar Excel"
                        >
                            <FontAwesomeIcon icon={iconMap['fa-file-excel']} />
                            <span>Excel</span>
                        </button>

                        <button 
                            onClick={() => setSubView('form')}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                            <FontAwesomeIcon icon={iconMap['fa-plus']} />
                            <span>Nuevo Cliente</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-gray-500">Cargando clientes...</p>
                    </div>
                ) : clients.length === 0 ? (
                    <div className="text-center py-12">
                        <FontAwesomeIcon icon={iconMap['fa-users']} className="text-6xl text-gray-300 mb-4" />
                        <p className="text-lg text-gray-500">No hay clientes registrados</p>
                        <button 
                            onClick={() => setSubView('form')}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Agregar primer cliente
                        </button>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="animate-fadeIn">
                        <ClientTable 
                            data={filteredClients} 
                            onToggleStatus={handleToggleStatus}
                            onSelectClient={handleSelectClient}
                            onSelectAll={handleSelectAll}
                            onViewClient={handleViewClient}
                            onEditClient={handleEditClient}
                            selectedClients={selectedClients}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {filteredClients.map((client, index) => (
                            <div 
                                key={client.customer_id} 
                                className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-lg mr-3">
                                            {getInitials(client.name, client.surname)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{getFullName(client.name, client.surname)}</h3>
                                            <p className="text-xs text-gray-500">ID: {client.address?.address_id}</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="rounded text-indigo-600"
                                        checked={selectedClients.includes(client.customer_id)}
                                        onChange={(e) => handleSelectClient(client.customer_id, e.target.checked)}
                                    />
                                </div>
                                <div className="space-y-2 mb-4">
                                    {/* Nueva sección para ID de Dirección */}
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">ID Dirección:</span>
                                        <span className="text-gray-900 font-bold">{client.address?.address_id || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Email:</span>
                                        <span className="text-gray-900">{client.email}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Teléfono:</span>
                                        <span className="text-gray-900">{client.phone_number}</span>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${client.state === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {client.state === 'A' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {client.state === 'A' ? (
                                        // Cliente Activo: mostrar Ver, Editar y Desactivar
                                        <>
                                            <button 
                                                onClick={() => handleViewClient(client.customer_id)}
                                                className="flex-1 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                                            >
                                                Ver
                                            </button>
                                            <button 
                                                onClick={() => handleEditClient(client.customer_id)}
                                                className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => handleToggleStatus(client.customer_id, client.state)}
                                                className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                            >
                                                Desactivar
                                            </button>
                                        </>
                                    ) : (
                                        // Cliente Inactivo: solo mostrar Restaurar
                                        <button 
                                            onClick={() => handleToggleStatus(client.customer_id, client.state)}
                                            className="w-full px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                                        >
                                            Restaurar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );

    if (subView === 'form') {
        return <FormClient onBack={() => setSubView('list')} />;
    }

    return (
        <>
            {renderClientList()}
            
{/* Modal de detalles del cliente */}
<DetailModal
    isOpen={showClientModal}
    onClose={() => { setShowClientModal(false); setSelectedClient(null); }}
    title={`Cliente: ${selectedClient ? getFullName(selectedClient.name, selectedClient.surname) : ''}`}
>
    {selectedClient && (
        <div className="space-y-6">
            
            {/* 1. SECCIÓN DE DATOS PERSONALES */}
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Datos Personales</h3>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Nombre</p>
                    <p className="text-lg font-bold text-gray-900">{selectedClient.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Apellido</p>
                    <p className="text-lg font-bold text-gray-900">{selectedClient.surname}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-bold text-gray-900">{selectedClient.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Teléfono</p>
                    <p className="text-lg font-bold text-gray-900">{selectedClient.phone_number || 'N/A'}</p>
                </div>
            </div>
            
            {/* 2. SECCIÓN DE DIRECCIÓN (Lectura) */}
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 pt-4">Detalles de Dirección</h3>
            {/* Es vital verificar que 'selectedClient.address' exista antes de intentar acceder a sus propiedades */}
            {selectedClient.address ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg md:col-span-2">
                        <p className="text-sm font-semibold text-blue-500 mb-1">ID de Dirección</p>
                        <p className="text-lg font-bold text-blue-900">{selectedClient.address.address_id}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Ubicación</p>
                        <p className="text-lg font-bold text-gray-900">
                            {selectedClient.address.department} / {selectedClient.address.province} / {selectedClient.address.district}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Calle / Dirección</p>
                        <p className="text-lg font-bold text-gray-900">{selectedClient.address.street}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 mb-1">País</p>
                        <p className="text-lg font-bold text-gray-900">{selectedClient.address.country}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Código Postal</p>
                        <p className="text-lg font-bold text-gray-900">{selectedClient.address.zip_code || 'N/A'}</p>
                    </div>
                    {selectedClient.address.reference && (
                        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                            <p className="text-sm font-semibold text-gray-500 mb-1">Referencia</p>
                            <p className="text-base text-gray-900">{selectedClient.address.reference}</p>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-red-600">No hay datos de dirección asociados.</p>
            )}

            {/* 3. SECCIÓN DE ESTADO */}
            <div className={`p-4 rounded-lg border ${
                selectedClient.state === 'A' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
            }`}>
                <p className="text-sm font-semibold mb-2">Estado del Cliente</p>
                <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    selectedClient.state === 'A' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {selectedClient.state === 'A' ? '✓ Activo' : '✗ Inactivo'}
                </span>
            </div>
        </div>
    )}
</DetailModal>

{/* Modal de edición del cliente */}
<EditModal
    isOpen={showEditModal}
    onClose={() => { setShowEditModal(false); setEditClientData(null); }}
    onSave={handleSaveClient}
    title="Editar Cliente"
    loading={editLoading}
>
    {editClientData && (
        <div className="space-y-6">
            
            {/* 1. DATOS PERSONALES PARA EDICIÓN */}
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Datos Personales</h3>
            <div className="grid grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                        type="text"
                        value={editClientData.name}
                        onChange={(e) => handleChangeEditField('name', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    />
                </div>
                {/* Apellido */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                    <input
                        type="text"
                        value={editClientData.surname}
                        onChange={(e) => handleChangeEditField('surname', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    />
                </div>
                {/* Email */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={editClientData.email}
                        onChange={(e) => handleChangeEditField('email', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    />
                </div>
                {/* Teléfono */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                        type="text"
                        value={editClientData.phone_number}
                        onChange={(e) => handleChangeEditField('phone_number', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    />
                </div>
            </div>
            
            {/* 2. DATOS DE DIRECCIÓN PARA EDICIÓN */}
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 pt-4">Editar Dirección</h3>
            <div className="grid grid-cols-2 gap-4">
                
                {/* ID de Dirección (Solo lectura) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Dirección</label>
                    <input
                        type="text"
                        // 🚨 Accede al ID plano, asumido del aplanamiento
                        value={editClientData.address_id || ''} 
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-lg cursor-not-allowed bg-gray-200 text-gray-700"
                    />
                </div>
                {/* País */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                    <input
                        type="text"
                        value={editClientData.country}
                        onChange={(e) => handleChangeEditField('country', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    />
                </div>

                {/* Departamento */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                    <input
                        type="text"
                        value={editClientData.department}
                        onChange={(e) => handleChangeEditField('department', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    />
                </div>
                {/* Provincia */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                    <input
                        type="text"
                        value={editClientData.province}
                        onChange={(e) => handleChangeEditField('province', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    />
                </div>

                {/* Distrito */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distrito</label>
                    <input
                        type="text"
                        value={editClientData.district}
                        onChange={(e) => handleChangeEditField('district', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    />
                </div>

                {/* Calle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Calle / Dirección</label>
                    <input
                        type="text"
                        value={editClientData.street}
                        onChange={(e) => handleChangeEditField('street', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    />
                </div>

                {/* Código Postal */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                    <input
                        type="text"
                        value={editClientData.zip_code}
                        onChange={(e) => handleChangeEditField('zip_code', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    />
                </div>

                {/* Referencia */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Referencia</label>
                    <textarea
                        rows="2"
                        value={editClientData.reference}
                        onChange={(e) => handleChangeEditField('reference', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    ></textarea>
                </div>
            </div>

            {/* 3. ESTADO DEL CLIENTE */}
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 pt-4">Estado</h3>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                        value={editClientData.state}
                        onChange={(e) => handleChangeEditField('state', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                    >
                        <option value="A">Activo</option>
                        <option value="I">Inactivo</option>
                    </select>
                </div>
            </div>
        </div>
    )}
</EditModal>
        </>
    );
};

export default Clients;


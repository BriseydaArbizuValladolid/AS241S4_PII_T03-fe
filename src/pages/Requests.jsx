import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFileAlt, faCheckCircle, faClock, faSearch, faTable, 
    faList, faFileExport, faPlus, faEye, faEdit, faHome, faClipboardList, faTrash, faCheck, faFilePdf, faPrint, faFileExcel, faTimes, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

import { getRequests, getRequestsByCustomer, updateRequest, createRequest, deleteRequest } from '../shared/api/requestApi';
import { getServiceTypes } from '../shared/api/serviceTypeApi';
import DetailModal from '../components/DetailModal';
import EditModal from '../components/EditModal';
import { generatePDFFromData, generateSingleRequestPDF } from '../utils/pdfGenerator';
import { generateExcel } from '../utils/excelGenerator';

// Mapeo de iconos (Sin cambios)
const iconMap = {
    'fa-file-alt': faFileAlt, 'fa-check-circle': faCheckCircle, 'fa-clock': faClock, 
    'fa-search': faSearch, 'fa-table': faTable, 'fa-list': faList, 
    'fa-file-export': faFileExport, 'fa-plus': faPlus, 'fa-eye': faEye, 
    'fa-edit': faEdit, 'fa-home': faHome, 'fa-clipboard-list': faClipboardList,
    'fa-trash': faTrash, 'fa-check': faCheck, 'fa-file-pdf': faFilePdf, 'fa-print': faPrint, 'fa-file-excel':faFileExcel, 'fa-times': faTimes, 
    'fa-exclamation-triangle': faExclamationTriangle
};

const SummaryCard = ({ title, value, iconName, iconBgColor, iconColor, barColor }) => (
    // Contenedor principal: Quitamos el p-6 aquí y lo movemos al div de contenido.
    // Usamos overflow-hidden para asegurar que la barra no cause scroll si se extiende un poco.
    <div className="bg-white rounded-xl shadow-md border-b-4 border-transparent hover:border-indigo-500 transition duration-300 overflow-hidden">
        
        {/* Contenedor del contenido superior: Mantenemos el padding deseado (p-6) */}
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconBgColor} ${iconColor}`}>
                    {/* Asegúrate de que iconMap y FontAwesomeIcon estén definidos/importados */}
                    <FontAwesomeIcon icon={iconMap[iconName]} />
                </div>
            </div>
        </div> 
        
        {/* 🌟 BARRA DE PROGRESO CORREGIDA 🌟 */}
        {/* Este div está fuera del padding, por lo que se extiende de borde a borde (puedes ajustar el ancho si es necesario) */}
        {/* Usamos mt-auto para asegurar que esté anclada a la parte inferior si la altura del contenido varía */}
        <div className="h-1 bg-gray-200 rounded-full">
            {/* El ancho de la barra (ej: value * 5%) debe ser <= 100% */}
            <div 
                className={`h-full ${barColor} rounded-full`} 
                style={{ width: `${Math.min(value, 100)}%` }} // Usamos Math.min(value, 100) para evitar que se desborde si value > 100
            ></div>
        </div>
    </div>
);
// --- COMPONENTE TABLA ACTUALIZADO ---
const RequestTable = ({ data, onSelectRequest, onSelectAll, onViewRequest, onEditRequest, onDelete, selectedRequests, onPrint }) => {
    
    // Función auxiliar para formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount || 0);
    };

    // Función para el color del estado
    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETADA': return "bg-green-100 text-green-800";
            case 'CANCELADA': return "bg-red-100 text-red-800";
            case 'PENDIENTE': return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                            <input 
                                type="checkbox" 
                                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                checked={data.length > 0 && selectedRequests.length === data.length}
                                onChange={(e) => onSelectAll(e.target.checked)}
                            />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((request) => (
                        <tr key={request.service_request_id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap w-12">
                                <input 
                                    type="checkbox" 
                                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    checked={selectedRequests.includes(request.service_request_id)}
                                    onChange={(e) => onSelectRequest(request.service_request_id, e.target.checked)}
                                />
                            </td>
                            {/* ID */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                #{request.service_request_id}
                            </td>
                            
                            {/* Fecha */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {request.request_date}
                            </td>
                            
                            {/* Cliente (Ahora accedemos al objeto anidado) */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <div className="font-medium">
                                    {request.customer?.name} {request.customer?.surname}
                                </div>
                                <div className="text-xs text-gray-400">ID: {request.customer?.id}</div>
                            </td>

                            {/* Estado (Nuevo campo visual) */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                                    {request.status}
                                </span>
                            </td>

                            {/* Total (Nuevo campo calculado) */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(request.total_estimated)}
                            </td>

                            {/* Acciones */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-3 text-gray-500">
                                    {/* Botón Imprimir (Siempre visible) */}
                                    <button
                                        onClick={() => onPrint(request.service_request_id)}
                                        className="hover:text-gray-800 transition text-gray-400"
                                        title="Imprimir Orden de Servicio"
                                    >
                                        <FontAwesomeIcon icon={iconMap['fa-print']} />
                                    </button>

                                    {(() => {
                                        // NUEVA LÓGICA: Usamos el campo 'status' directo
                                        const isCancelled = request.status === 'CANCELADA';
                                        const isCompleted = request.status === 'COMPLETADA';
                                        
                                        const buttons = [];
                                        
                                        if (isCancelled) {
                                            // Si está cancelada, no mostramos editar ni borrar, quizás solo ver
                                            buttons.push(
                                                <button key="view" onClick={() => onViewRequest(request.service_request_id)} className="hover:text-indigo-600 transition" title="Ver detalles">
                                                    <FontAwesomeIcon icon={iconMap['fa-eye']} />
                                                </button>
                                            );
                                        } else if (isCompleted) {
                                            // Si está completada, solo ver
                                            buttons.push(
                                                <button key="view" onClick={() => onViewRequest(request.service_request_id)} className="hover:text-indigo-600 transition" title="Ver detalles">
                                                    <FontAwesomeIcon icon={iconMap['fa-eye']} />
                                                </button>
                                            );
                                        } else {
                                            // Estado PENDIENTE: Ver, Editar, Cancelar
                                            buttons.push(
                                                <button key="view" onClick={() => onViewRequest(request.service_request_id)} className="hover:text-indigo-600 transition" title="Ver detalles">
                                                    <FontAwesomeIcon icon={iconMap['fa-eye']} />
                                                </button>
                                            );
                                            buttons.push(
                                                <button key="edit" onClick={() => onEditRequest(request.service_request_id)} className="hover:text-blue-600 transition" title="Editar">
                                                    <FontAwesomeIcon icon={iconMap['fa-edit']} />
                                                </button>
                                            );
                                            buttons.push(
                                                <button key="delete" onClick={() => onDelete(request.service_request_id)} className="hover:text-red-600 transition" title="Cancelar Solicitud">
                                                    <FontAwesomeIcon icon={iconMap['fa-trash']} />
                                                </button>
                                            );
                                        }
                                        return buttons;
                                    })()}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editRequestData, setEditRequestData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRequestData, setNewRequestData] = useState({
        customer_id: '',
        service_type_id: '',
        notes: ''
    });
    const [serviceTypes, setServiceTypes] = useState([]);
    const [summaryCards, setSummaryCards] = useState([
        { title: 'Total Solicitudes', value: 0, iconName: 'fa-file-alt', iconBgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', barColor: 'bg-indigo-600' },
        { title: 'Completadas', value: 0, iconName: 'fa-check-circle', iconBgColor: 'bg-green-100', iconColor: 'text-green-600', barColor: 'bg-green-600' },
        { title: 'En Proceso', value: 0, iconName: 'fa-clock', iconBgColor: 'bg-yellow-100', iconColor: 'text-yellow-600', barColor: 'bg-yellow-600' },
        { title: 'Seleccionadas', value: 0, iconName: 'fa-clipboard-list', iconBgColor: 'bg-teal-100', iconColor: 'text-teal-600', barColor: 'bg-teal-600' },
    ]);
    const [loading, setLoading] = useState(true);
    // --- ESTADOS PARA EL MODAL DE CONFIRMACIÓN ---
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionData, setActionData] = useState({
        type: '', // 'cancel' | 'restore'
        requestId: null,
        reason: '', // Razón de cancelación actual (para mostrar al restaurar)
        inputReason: '' // Input del usuario (para cancelar)
    });
    // --- AGREGA ESTO AL INICIO DE TU COMPONENTE SI NO LO TIENES ---
    const [cartItems, setCartItems] = useState([]); 
    const [currentItem, setCurrentItem] = useState({ service_type_id: '', quantity: 1 });

    useEffect(() => {
        loadServiceTypes();
    }, []);

    useEffect(() => {
        if (serviceTypes.length > 0) {
            loadRequests();
        }
    }, [serviceTypes]);

    // Filtrar solicitudes cuando cambien los filtros
    useEffect(() => {
        filterRequests();
    }, [requests, searchTerm]);

    // Actualizar contador de seleccionados
    useEffect(() => {
        setSummaryCards(cards => [
            ...cards.slice(0, 3),
            { ...cards[3], value: selectedRequests.length }
        ]);
    }, [selectedRequests]);

    const loadServiceTypes = async () => {
        try {
            const data = await getServiceTypes();
            setServiceTypes(data);
        } catch (error) {
            console.error('Error al cargar tipos de servicio:', error);
        }
    };

const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await getRequests();
            // Mapear service_type_id a nombre (Lógica existente)
            const requestsWithServiceNames = data.map(request => {
                const serviceType = serviceTypes.find(st => st.service_type_id === request.service_type_id);
                return {
                    ...request,
                    service_type_name: serviceType ? serviceType.service_name : null
                };
            });
            setRequests(requestsWithServiceNames);
            
            const total = data.length;
            
            // --- 💡 LÓGICA DE CONTEO CORREGIDA ---
            const completadas = data.filter(req => req.status === 'COMPLETADA').length;
            // Consideramos 'En Proceso' a las que están PENDIENTE
            const enProceso = data.filter(req => req.status === 'PENDIENTE').length;
            // Opcional: Contar Canceladas, pero solo las usaremos para verificar
            // const canceladas = data.filter(req => req.status === 'CANCELADA').length;

            setSummaryCards(cards => [
                { ...cards[0], value: total }, // Total Solicitudes
                { ...cards[1], value: completadas }, // Completadas
                { ...cards[2], value: enProceso }, // En Proceso
                { ...cards[3], value: selectedRequests.length }, // Seleccionadas
            ]);
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        let filtered = requests;

        if (searchTerm) {
            filtered = filtered.filter(request => 
                request.service_request_id.toString().includes(searchTerm) ||
                request.customer_id.toString().includes(searchTerm) ||
                request.service_type_id.toString().includes(searchTerm)
            );
        }

        setFilteredRequests(filtered);
    };

// --- LÓGICA DEL CARRITO (CON RESTRICCIÓN DE DUPLICADOS) ---
    const handleAddItem = () => {
        // 1. Validaciones básicas
        if (!currentItem.service_type_id || !currentItem.quantity || currentItem.quantity < 1) return;

        // 2. RESTRICCIÓN: Máximo 5 servicios
        if (cartItems.length >= 5) {
            alert("Has alcanzado el límite máximo de 5 servicios por solicitud.");
            return;
        }

        // 3. RESTRICCIÓN NUEVA: NO DUPLICADOS
        // Verificamos si el ID seleccionado ya existe en el carrito actual
        const isDuplicate = cartItems.some(item => item.service_type_id === parseInt(currentItem.service_type_id));
        
        if (isDuplicate) {
            alert("Este servicio ya está en la lista. Si necesitas más cantidad, elimínalo y agrégalo nuevamente con la cantidad correcta.");
            return;
        }

        const serviceInfo = serviceTypes.find(s => s.service_type_id === parseInt(currentItem.service_type_id));
        
        // 4. Restricción de cantidad
        let finalQuantity = parseInt(currentItem.quantity);
        if (finalQuantity > 5) finalQuantity = 5;

        const newItem = {
            temp_id: Date.now(),
            service_type_id: parseInt(currentItem.service_type_id),
            service_name: serviceInfo?.service_name || 'Desconocido',
            quantity: finalQuantity,
            unit_price: serviceInfo?.unit_price || 0,
            subtotal: (serviceInfo?.unit_price || 0) * finalQuantity
        };

        setCartItems([...cartItems, newItem]);
        setCurrentItem({ service_type_id: '', quantity: 1 });
    };
    // --- FUNCIONES EXISTENTES CORREGIDAS ---

    // --- LÓGICA DEL CARRITO (QUITAR) ---
    const handleRemoveItem = (tempId) => {
        // Filtramos para dejar todos MENOS el que tenga ese ID
        const newItems = cartItems.filter(item => item.temp_id !== tempId);
        setCartItems(newItems);
    };
    const handleSelectRequest = (requestId, isSelected) => {
        if (isSelected) {
            setSelectedRequests(prev => [...prev, requestId]);
        } else {
            setSelectedRequests(prev => prev.filter(id => id !== requestId));
        }
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedRequests(filteredRequests.map(request => request.service_request_id));
        } else {
            setSelectedRequests([]);
        }
    };

    const handleViewRequest = (requestId) => {
        const request = requests.find(r => r.service_request_id === requestId);
        setSelectedRequest(request);
        setShowRequestModal(true);
    };

    const handleEditRequest = (requestId) => {
        const request = requests.find(r => r.service_request_id === requestId);
        // CORREGIDO: Extraer ID del objeto cliente y mapear estado
        setEditRequestData({ 
            ...request, 
            customer_id: request.customer?.id || request.customer_id,
            status: request.status // Asegurar que el estado se pasa al modal
        });
        setShowEditModal(true);
    };

    const handleSaveRequest = async () => {
        try {
            setEditLoading(true);
            
            // CORREGIDO: Enviar datos de cabecera incluyendo Status
            const updateData = {
                customer_id: parseInt(editRequestData.customer_id),
                status: editRequestData.status, 
                notes: editRequestData.notes,
                request_date: editRequestData.request_date
                // No enviamos service_type_id ni items aquí (solo se edita cabecera)
            };
            
            console.log('📤 Actualizando solicitud:', editRequestData.service_request_id, updateData);
            await updateRequest(editRequestData.service_request_id, updateData);
            
            await loadRequests();
            setShowEditModal(false);
            setEditRequestData(null);
        } catch (error) {
            console.error('❌ Error al actualizar solicitud:', error);
            alert(`Error al actualizar la solicitud: ${error.message}`);
        } finally {
            setEditLoading(false);
        }
    };

    const handleChangeEditField = (field, value) => {
        setEditRequestData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 1. Abre el modal de borrado
    const handleDeleteRequest = (requestId) => {
        const request = requests.find(r => r.service_request_id === requestId);
        
        // CORREGIDO: Usar el campo 'status' de la BD
        const isCancelled = request?.status === 'CANCELADA';

        if (isCancelled) {
            // Opción: Restaurar
            setActionData({
                type: 'restore',
                requestId: requestId,
                reason: request.notes?.replace('CANCELLED - ', '') || '', 
                inputReason: ''
            });
        } else {
            // Opción: Cancelar
            setActionData({
                type: 'cancel',
                requestId: requestId,
                reason: '',
                inputReason: ''
            });
        }
        setShowConfirmModal(true);
    };

    // 2. Ejecuta la acción (Cancelar/Restaurar)
    const executeAction = async () => {
        const { type, requestId, inputReason } = actionData;
        setEditLoading(true);

        try {
            if (type === 'cancel') {
                const finalReason = inputReason.trim() || 'Cancelada por el usuario';
                await deleteRequest(requestId, { reason: finalReason });
            } else if (type === 'restore') {
                // Para restaurar, cambiamos estado a PENDIENTE y limpiamos notas de cancelación
                // Nota: Asegúrate que tu backend soporte esto o usa solo Cancelar
                await updateRequest(requestId, { status: 'PENDIENTE', notes: 'Restaurada' }); 
            }
            
            await loadRequests();
            setShowConfirmModal(false);
        } catch (error) {
            console.error('❌ Error en acción:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setEditLoading(false);
        }
    };

    const handleNewRequest = () => {
        setNewRequestData({
            customer_id: '',
            notes: ''
        });
        setCartItems([]); // CORREGIDO: Limpiar carrito
        setShowCreateModal(true);
    };

    // CORREGIDO: Guardar con estructura Maestro-Detalle
    const handleSaveNewRequest = async () => {
        try {
            setEditLoading(true);
            
            // Validaciones
            if (!newRequestData.customer_id) {
                alert('Por favor, complete el ID Cliente');
                setEditLoading(false);
                return;
            }
            if (cartItems.length === 0) {
                alert('Debe agregar al menos un servicio al carrito');
                setEditLoading(false);
                return;
            }
            
            // Preparar Payload
            const requestData = {
                customer_id: parseInt(newRequestData.customer_id),
                notes: newRequestData.notes,
                items: cartItems.map(item => ({
                    service_type_id: item.service_type_id,
                    quantity: item.quantity
                }))
            };
            
            console.log('📤 Creando solicitud:', requestData);
            await createRequest(requestData);
            console.log('✅ Solicitud creada');
            
            await loadRequests();
            setShowCreateModal(false);
            setNewRequestData({ customer_id: '', notes: '' });
            setCartItems([]); // Limpiar
        } catch (error) {
            console.error('❌ Error al crear solicitud:', error);
            alert(`Error al crear la solicitud: ${error.message}`);
        } finally {
            setEditLoading(false);
        }
    };

    const handleExportExcel = () => {
        const sourceData = filteredRequests;
        const dataToExport = selectedRequests.length > 0 
            ? sourceData.filter(req => selectedRequests.includes(req.service_request_id))
            : filteredRequests;

        if (dataToExport.length === 0) {
            alert("No hay solicitudes para exportar.");
            return;
        }

        const excelData = dataToExport.map(req => {
            // CORREGIDO: Obtener nombres de servicios del array items
            const serviceNames = req.items?.map(i => i.service_name).join(', ') || 'Sin servicios';
            
            const notas = req.notes?.replace('CANCELLED - ', '') || '';

            return {
                "ID Solicitud": req.service_request_id,
                "Fecha": req.request_date,
                "Cliente": `${req.customer?.name} ${req.customer?.surname}`,
                "Servicios": serviceNames, // Nueva columna concatenada
                "Estado": req.status,
                "Total": req.total_estimated,
                "Notas": notas
            };
        });

        generateExcel(excelData, `Reporte_Solicitudes_${new Date().toISOString().split('T')[0]}.xlsx`, "Solicitudes");
    };

    // -------------------------------------------------------------------
    // --- FUNCIÓN PARA REPORTE GENERAL (handleDownloadPDF) ---
    // -------------------------------------------------------------------
 // Debe estar definida como async
    const handleDownloadPDF = async () => { 
        const sourceData = filteredRequests;
        
        // Lógica para determinar qué exportar (seleccionados o todos)
        const requestsToExport = selectedRequests.length > 0
            ? sourceData.filter(req => selectedRequests.includes(req.service_request_id))
            : filteredRequests;

        if (!requestsToExport || requestsToExport.length === 0) {
            alert("No hay solicitudes para exportar.");
            return;
        }

        const columns = [
            "ID", 
            "Fecha", 
            "Cliente", 
            "Servicios",
            "Estado",
            "Total Est. (S/)" 
        ];

        const data = requestsToExport.map(req => {
            const serviceNames = req.items?.map(i => i.service_name).join(', ') || '-';
            const cliente = `${req.customer?.name || ''} ${req.customer?.surname || ''}`;

            return [
                req.service_request_id,
                req.request_date,
                cliente,
                serviceNames,
                req.status,
                // Aseguramos el formato de moneda S/ 0.00
                `S/ ${parseFloat(req.total_estimated || 0).toFixed(2)}` 
            ];
        });

        try {
            // **Punto Crítico:** Llamada a la función del generador
            // No necesita 'await' a menos que 'generatePDFFromData' devuelva una promesa, 
            // pero lo mantendremos por si acaso.
            generatePDFFromData( 
                "REPORTE GENERAL DE SOLICITUDES", 
                columns,
                data,
                `Reporte_Solicitudes_${new Date().toISOString().split('T')[0]}.pdf`
            );
            
        } catch (error) {
            // Si hay un error de 'jsPDF' o 'autoTable', se atrapará aquí.
            console.error("Error al generar PDF (Reporte General):", error);
            alert("Ocurrió un error al intentar descargar el reporte.");
        }
    };
    // -------------------------------------------------------------------
    // --- FUNCIÓN PARA REPORTE INDIVIDUAL (handlePrintIndividual) ---
    // -------------------------------------------------------------------
    const handlePrintIndividual = (requestId) => {
        const request = requests.find(r => r.service_request_id === requestId);
        
        if (!request) {
            console.error(`Solicitud con ID ${requestId} no encontrada.`);
            return;
        }
        
        // **IMPORTANTE:** Verificar que 'request' tiene 'items' y 'customer'.
        if (!request.items || !request.customer) {
            console.error("Datos incompletos para reporte individual.");
            alert("Faltan detalles (ítems/cliente) en la solicitud para generar el reporte.");
            return;
        }

        // Ya que generateSingleRequestPDF usa directamente las propiedades
        // anidadas (customer, items, status), pasamos el objeto completo.
        // La propiedad statusFormatted ya no es necesaria en la nueva versión del PDF.
        const dataForPDF = {
            ...request,
        };

        generateSingleRequestPDF(
            dataForPDF, 
            `Orden_Servicio_${requestId}.pdf`
        );
    };
    return (
        <main className="p-6 flex-1">
            <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                    <FontAwesomeIcon icon={iconMap['fa-home']} className="mr-1 text-indigo-500" />
                    <a href="#" className="hover:underline">Inicio</a> 
                    <span className="mx-2">/</span> 
                    <span className="font-semibold text-gray-700">Solicitudes de Servicio</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Solicitudes de Servicio</h1>
                <p className="text-gray-500 mt-1">Gestiona las solicitudes de servicio del laboratorio.</p>
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
                            placeholder="Buscar por ID, cliente..." 
                            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">
                            <FontAwesomeIcon icon={iconMap['fa-list']} className="text-lg" />
                        </button>
                        <button className="p-2 border border-indigo-600 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
                            <FontAwesomeIcon icon={iconMap['fa-table']} className="text-lg" />
                        </button>
                        <button  onClick={handleDownloadPDF} className="flex items-center space-x-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition border-red-300" title="Descargar PDF">
                            <FontAwesomeIcon icon={iconMap['fa-file-pdf']} />
                            <span>PDF</span>
                        </button>
                        
                        <button onClick={handleExportExcel} className="flex items-center space-x-2 px-4 py-2 border border-green-200 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition border-green-300 ml-2" title="Descargar Excel">
                            <FontAwesomeIcon icon={iconMap['fa-file-excel']} />
                            <span>Excel</span>
                        </button>

                        <button 
                            onClick={handleNewRequest}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <FontAwesomeIcon icon={iconMap['fa-plus']} />
                            <span>Nueva Solicitud</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-gray-500">Cargando solicitudes...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12">
                        <FontAwesomeIcon icon={iconMap['fa-file-invoice']} className="text-6xl text-gray-300 mb-4" />
                        <p className="text-lg text-gray-500">No hay solicitudes registradas</p>
                    </div>
                ) : viewMode === 'table' ? (
                    <RequestTable 
                        data={filteredRequests}
                        onSelectRequest={handleSelectRequest}
                        onSelectAll={handleSelectAll}
                        onViewRequest={handleViewRequest}
                        onEditRequest={handleEditRequest}
                        onDelete={handleDeleteRequest}
                        selectedRequests={selectedRequests}
                        onPrint={handlePrintIndividual}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {filteredRequests.map((request, index) => (
                            <div 
                                key={request.service_request_id} 
                                className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">#{request.service_request_id}</h3>
                                        <p className="text-xs text-gray-500">{request.request_date}</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="rounded text-indigo-600"
                                        checked={selectedRequests.includes(request.service_request_id)}
                                        onChange={(e) => handleSelectRequest(request.service_request_id, e.target.checked)}
                                    />
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Cliente ID:</span>
                                        <span className="text-gray-900">{request.customer_id}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Tipo Servicio:</span>
                                        <span className="text-gray-900">{request.service_type_name || `Servicio ${request.service_type_id}`}</span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {(() => {
                                        const isCancelled = request.notes?.startsWith('CANCELLED');
                                        const isCompleted = request.status === 'COMPLETED';
                                        
                                        if (isCancelled) {
                                            return (
                                                <button 
                                                    onClick={() => handleDeleteRequest(request.service_request_id)}
                                                    className="w-full px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                                                >
                                                    Restaurar
                                                </button>
                                            );
                                        } else if (isCompleted) {
                                            return (
                                                <button 
                                                    onClick={() => handleViewRequest(request.service_request_id)}
                                                    className="w-full px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                                                >
                                                    Ver Detalles
                                                </button>
                                            );
                                        } else {
                                            return (
                                                <>
                                                    <button 
                                                        onClick={() => handleViewRequest(request.service_request_id)}
                                                        className="flex-1 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                                                    >
                                                        Ver
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditRequest(request.service_request_id)}
                                                        className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteRequest(request.service_request_id)}
                                                        className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

{/* Modal de detalles de solicitud */}
            <DetailModal
                isOpen={showRequestModal}
                onClose={() => { setShowRequestModal(false); setSelectedRequest(null); }}
                title={`Solicitud #${selectedRequest?.service_request_id || ''}`}
            >
                {selectedRequest && (
                    <div className="space-y-6">
                        {/* 1. Cabecera Informativa (Cliente, Fecha, Estado) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Cliente</p>
                                <p className="text-gray-900 font-medium">
                                    {selectedRequest.customer?.name} {selectedRequest.customer?.surname}
                                </p>
                                <p className="text-xs text-gray-400">ID: {selectedRequest.customer?.id}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Fecha</p>
                                <p className="text-gray-900 font-medium">{selectedRequest.request_date}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Estado</p>
                                <span className={`px-2 py-1 text-xs rounded-full font-bold
                                    ${selectedRequest.status === 'COMPLETADA' ? 'bg-green-100 text-green-800' : 
                                      selectedRequest.status === 'CANCELADA' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {selectedRequest.status}
                                </span>
                            </div>
                        </div>

                        {/* 2. Tabla de Detalle (Ítems) */}
                        <div>
                            <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Detalle de Servicios</h4>
                            <div className="overflow-hidden border rounded-lg shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">P. Unit</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedRequest.items?.length > 0 ? (
                                            selectedRequest.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2 text-gray-900">{item.service_name}</td>
                                                    <td className="px-4 py-2 text-center text-gray-600">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right text-gray-600">
                                                        {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(item.unit_price)}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                                                        {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(item.subtotal)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-3 text-center text-gray-500 italic">
                                                    No hay servicios registrados en el detalle.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {/* Pie de tabla con Total */}
                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-2 text-right text-sm font-bold text-gray-700">
                                                TOTAL ESTIMADO:
                                            </td>
                                            <td className="px-4 py-2 text-right text-sm font-bold text-indigo-700">
                                                {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(selectedRequest.total_estimated || 0)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* 3. Notas / Observaciones */}
                        {selectedRequest.notes && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                    {selectedRequest.notes.startsWith('CANCELLED') ? 'Razón de Cancelación' : 'Notas / Observaciones'}
                                </p>
                                <p className={`text-sm ${selectedRequest.notes.startsWith('CANCELLED') ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                                    {selectedRequest.notes.replace('CANCELLED - ', '')}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </DetailModal>

{/* Modal de Edición (Con restricciones) */}
            <EditModal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditRequestData(null); }}
                onSave={handleSaveRequest}
                title="Editar Solicitud"
                loading={editLoading}
                // RESTRICCIÓN: Deshabilitar si el ID Cliente está vacío
                disabled={!editRequestData?.customer_id}
            >
                {editRequestData && (
                    <div className="space-y-4">
                        {/* ID Solicitud (Solo lectura) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Solicitud</label>
                            <input
                                type="text"
                                value={editRequestData.service_request_id}
                                disabled
                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* ID Cliente (Solo Números) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID Cliente <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text" // Usamos text para controlar el regex
                                value={editRequestData.customer_id}
                                onChange={(e) => {
                                    // RESTRICCIÓN: Solo dígitos 0-9
                                    if (/^\d*$/.test(e.target.value)) {
                                        handleChangeEditField('customer_id', e.target.value);
                                    }
                                }}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 text-gray-900
                                    ${!editRequestData.customer_id ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}
                                maxLength={10}
                            />
                            {!editRequestData.customer_id && <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>}
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                value={editRequestData.status}
                                onChange={(e) => handleChangeEditField('status', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="PENDIENTE">PENDIENTE</option>
                                <option value="COMPLETADA">COMPLETADA</option>
                                <option value="CANCELADA">CANCELADA</option>
                            </select>
                        </div>

                        {/* Notas (Máximo 100 caracteres) */}
                        <div>
                            <div className="flex justify-between">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
                                <span className={`text-xs ${(editRequestData.notes || '').length >= 100 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                                    {(editRequestData.notes || '').length}/100
                                </span>
                            </div>
                            <textarea
                                value={editRequestData.notes || ''}
                                onChange={(e) => handleChangeEditField('notes', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows="3"
                                maxLength={100} // RESTRICCIÓN: Límite duro
                            />
                        </div>

                        {/* Fecha (No fechas futuras) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Creación</label>
                            <input
                                type="date"
                                value={editRequestData.request_date}
                                onChange={(e) => handleChangeEditField('request_date', e.target.value)}
                                max={new Date().toISOString().split("T")[0]} // RESTRICCIÓN: Máximo hoy
                                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                            />
                        </div>
                    </div>
                )}
            </EditModal>
{/* MODAL DE CREACIÓN (CON NUEVAS RESTRICCIONES) */}
            <EditModal
                isOpen={showCreateModal}
                onClose={() => { 
                    setShowCreateModal(false); 
                    setCartItems([]); 
                    setNewRequestData({ customer_id: '', notes: '' });
                }}
                onSave={handleSaveNewRequest}
                title="Nueva Solicitud"
                loading={editLoading}
                disabled={!newRequestData.customer_id || cartItems.length === 0}
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ID Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID Cliente <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newRequestData.customer_id}
                                onChange={(e) => {
                                    if (/^\d*$/.test(e.target.value)) {
                                        setNewRequestData({ ...newRequestData, customer_id: e.target.value });
                                    }
                                }}
                                className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                placeholder="Ej: 105"
                                maxLength={10}
                            />
                        </div>

                        {/* RESTRICCIÓN: NOTAS MÁXIMO 100 */}
                        <div>
                            <div className="flex justify-between">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas Generales</label>
                                <span className={`text-xs ${newRequestData.notes.length >= 100 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                                    {newRequestData.notes.length}/100
                                </span>
                            </div>
                            <input
                                type="text"
                                value={newRequestData.notes}
                                onChange={(e) => setNewRequestData({ ...newRequestData, notes: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                placeholder="Observaciones..."
                                maxLength={100} // Límite estricto de 100
                            />
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-700 flex items-center">
                                <FontAwesomeIcon icon={iconMap['fa-plus']} className="mr-2 text-indigo-600"/>
                                Agregar Servicios
                            </h4>
                            {/* Contador de servicios en carrito */}
                            <span className={`text-xs px-2 py-1 rounded font-bold ${cartItems.length >= 5 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                                {cartItems.length}/5 Servicios
                            </span>
                        </div>
                        
{/* Controles de Selección */}
                        <div className="flex flex-col md:flex-row gap-3 mb-4 items-end">
                            <div className="flex-grow w-full">
                                <label className="text-xs text-gray-500 mb-1 block">Servicio *</label>
                                <select
                                    value={currentItem.service_type_id}
                                    onChange={(e) => setCurrentItem({ ...currentItem, service_type_id: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
                                    disabled={cartItems.length >= 5}
                                >
                                    <option value="">
                                        {cartItems.length >= 5 ? "Límite alcanzado" : "Seleccione un servicio..."}
                                    </option>
                                    {serviceTypes.map(st => {
                                        // Opcional: Marcar visualmente los usados en la lista desplegable
                                        const isUsed = cartItems.some(item => item.service_type_id === st.service_type_id);
                                        return (
                                            <option 
                                                key={st.service_type_id} 
                                                value={st.service_type_id}
                                                disabled={isUsed} // Deshabilitar opción si ya está usada (Mejora UX)
                                                className={isUsed ? 'text-gray-400 bg-gray-100' : ''}
                                            >
                                                {st.service_name} {isUsed ? '(Ya agregado)' : `- ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(st.unit_price)}`}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            
                            <div className="w-24">
                                <label className="text-xs text-gray-500 mb-1 block">Cantidad *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={currentItem.quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) {
                                            setCurrentItem({ ...currentItem, quantity: val > 5 ? 5 : val });
                                        } else if (e.target.value === '') {
                                            setCurrentItem({ ...currentItem, quantity: '' });
                                        }
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded text-sm text-center bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
                                    disabled={cartItems.length >= 5}
                                />
                            </div>

                            <button
                                onClick={handleAddItem}
                                disabled={
                                    !currentItem.service_type_id || 
                                    !currentItem.quantity || 
                                    currentItem.quantity < 1 || 
                                    cartItems.length >= 5 ||
                                    // También deshabilitamos si es duplicado (doble seguridad)
                                    cartItems.some(i => i.service_type_id === parseInt(currentItem.service_type_id))
                                }
                                className={`px-4 py-2 text-white rounded transition text-sm font-medium h-[38px] min-w-[100px]
                                    ${cartItems.length >= 5 || cartItems.some(i => i.service_type_id === parseInt(currentItem.service_type_id))
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {cartItems.some(i => i.service_type_id === parseInt(currentItem.service_type_id)) 
                                    ? 'Repetido' 
                                    : cartItems.length >= 5 
                                        ? 'Lleno' 
                                        : 'Agregar'}
                            </button>
                        </div>

                        {/* Tabla Visual del Carrito */}
                        {cartItems.length > 0 ? (
                            <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {cartItems.map((item) => (
                                            <tr key={item.temp_id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 text-gray-900">{item.service_name}</td>
                                                <td className="px-3 py-2 text-center text-gray-600">{item.quantity}</td>
                                                <td className="px-3 py-2 text-right text-gray-900 font-medium">
                                                    {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(item.subtotal)}
                                                </td>
                                                    {/* Celda de la tabla del carrito donde está el botón */}
                                                <td className="px-3 py-2 text-center">
                                                    <button 
                                                        type="button" // <--- ¡ESTO ES CLAVE! Evita que el formulario intente guardarse
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Previene cualquier comportamiento extraño
                                                            handleRemoveItem(item.temp_id);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-2 transition hover:bg-red-50 rounded-full"
                                                        title="Eliminar ítem"
                                                    >
                                                        <FontAwesomeIcon icon={iconMap['fa-times']} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                                        <tr>
                                            <td colSpan="2" className="px-3 py-2 text-right text-gray-600 text-xs uppercase">Total Estimado:</td>
                                            <td className="px-3 py-2 text-right text-indigo-700 text-sm">
                                                {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
                                                    cartItems.reduce((acc, i) => acc + i.subtotal, 0)
                                                )}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                                <p className="text-gray-400 text-sm">El carrito está vacío.</p>
                            </div>
                        )}
                    </div>
                </div>
            </EditModal>
            {/* --- MODAL DE CONFIRMACIÓN --- */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative p-5 border w-96 shadow-lg rounded-xl bg-white animate-fadeIn">
                        
                        {/* Cabecera */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-bold ${actionData.type === 'cancel' ? 'text-red-600' : 'text-green-600'}`}>
                                <FontAwesomeIcon icon={actionData.type === 'cancel' ? iconMap['fa-exclamation-triangle'] : iconMap['fa-check-circle']} className="mr-2" />
                                {actionData.type === 'cancel' ? 'Cancelar Solicitud' : 'Restaurar Solicitud'}
                            </h3>
                            <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FontAwesomeIcon icon={iconMap['fa-times']} />
                            </button>
                        </div>

                        {/* Contenido Dinámico */}
                        <div className="mb-6">
                            {actionData.type === 'restore' ? (
                                <>
                                    <p className="text-gray-600 mb-2">¿Está seguro que desea restaurar esta solicitud?</p>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-500">
                                        <span className="font-semibold">Motivo de cancelación previa:</span><br/>
                                        {actionData.reason || 'Sin razón especificada'}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-600 mb-3">Esta acción cancelará la solicitud. Por favor ingrese el motivo:</p>
                                    <textarea 
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                                        rows="3"
                                        placeholder="Escriba la razón aquí..."
                                        value={actionData.inputReason}
                                        onChange={(e) => setActionData({...actionData, inputReason: e.target.value})}
                                    />
                                </>
                            )}
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                                disabled={editLoading}
                            >
                                Cerrar
                            </button>
                            <button 
                                onClick={executeAction}
                                disabled={editLoading}
                                className={`px-4 py-2 text-white rounded-lg transition font-medium flex items-center
                                    ${actionData.type === 'cancel' 
                                        ? 'bg-red-600 hover:bg-red-700' 
                                        : 'bg-green-600 hover:bg-green-700'
                                    } ${editLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {editLoading ? (
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                ) : null}
                                {actionData.type === 'cancel' ? 'Confirmar Cancelación' : 'Restaurar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Requests;


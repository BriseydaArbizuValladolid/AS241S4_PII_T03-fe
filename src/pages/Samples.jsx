import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faVial, faCheckCircle, faClock, faSearch, faTable, 
    faList, faFileExport, faPlus, faEye, faEdit, faHome, faFlask,
    faFileAlt, faFileContract, faHistory, faDownload, faTrash, faUndo
} from '@fortawesome/free-solid-svg-icons';
import { getSamples, getSampleByCode, updateSample, createSample, getSampleById, deleteSample, restoreSample, markSampleAsAnalyzed } from '../shared/api/sampleApi';
import { getSampleTypes } from '../shared/api/sampleTypeApi';
import { getChainOfCustody, getFinalReport, getStatusSummary, downloadFinalReportPDF, downloadChainOfCustodyPDF } from '../shared/api/documentApi';
import { getRequestById } from '../shared/api/requestApi';
import { getClientById } from '../shared/api/clientApi';
import { getAddressById } from '../shared/api/addressApi';
import { getAnalysisResultsBySample, getAnalysisParameters } from '../shared/api/analysisApi';
import DetailModal from '../components/DetailModal';
import EditModal from '../components/EditModal';
import ChainOfCustody from '../components/ChainOfCustody';
import { generatePDFFromHTML } from '../utils/pdfGenerator';
import { generateSamplesExcel } from '../utils/excelGenerator';

// Mapeo de iconos
const iconMap = {
    'fa-vial': faVial, 'fa-check-circle': faCheckCircle, 'fa-clock': faClock, 
    'fa-search': faSearch, 'fa-table': faTable, 'fa-list': faList, 
    'fa-file-export': faFileExport, 'fa-plus': faPlus, 'fa-eye': faEye, 
    'fa-edit': faEdit, 'fa-home': faHome, 'fa-flask': faFlask,
    'fa-file-alt': faFileAlt, 'fa-file-contract': faFileContract, 'fa-history': faHistory,
    'fa-download': faDownload, 'fa-trash': faTrash, 'fa-undo': faUndo,
};

const SummaryCard = ({ title, value, iconName, iconBgColor, iconColor, barColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-transparent hover:border-indigo-500 transition duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconBgColor} ${iconColor}`}>
                <FontAwesomeIcon icon={iconMap[iconName]} />
            </div>
        </div>
        <div className="h-1 bg-gray-200 rounded-full">
            <div className={`h-full ${barColor} rounded-full`} style={{ width: `${value * 5}%` }}></div>
        </div>
    </div>
);

const SampleTable = ({ data, onSelectSample, onSelectAll, onViewDetails, onEditSample, onDeleteSample, onRestoreSample, onViewFinalReport, onViewStatusSummary, onDownloadPDF, onMarkAsAnalyzed, selectedSamples }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <input 
                            type="checkbox" 
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                            checked={data.length > 0 && selectedSamples.length === data.length}
                            onChange={(e) => onSelectAll(e.target.checked)}
                        />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Recolección</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Muestra</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {data.map((sample) => (
                    <tr key={sample.sample_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap w-12">
                            <input 
                                type="checkbox" 
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                checked={selectedSamples.includes(sample.sample_id)}
                                onChange={(e) => onSelectSample(sample.sample_id, e.target.checked)}
                            />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs mr-3`}>
                                    <FontAwesomeIcon icon={iconMap['fa-flask']} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{sample.sample_code}</div>
                                    <div className="text-xs text-gray-500">ID: {sample.sample_id}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sample.collection_date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sample.collection_location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                {sample.sample_type_name || `Tipo ${sample.sample_type_id}`}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {(() => {
                                // Verificar si la muestra está archivada/eliminada
                                const isArchived = sample.current_status_id === 12 || sample.is_deleted === true;
                                // Estados que indican que la muestra está analizada: 4 (ANALIZADA), 6 (APROBADA), 9 (COMPLETADA), 11 (ENTREGADA)
                                const estadosAnalizadas = [4, 6, 9, 11];
                                const isAnalyzed = estadosAnalizadas.includes(sample.current_status_id);
                                const isPending = !isAnalyzed && !isArchived;
                                
                                return isArchived ? (
                                // Muestra eliminada/archivada: solo botón de restaurar
                                <div className="flex space-x-3">
                                    <button 
                                        className="hover:text-green-600 transition"
                                        title="Restaurar muestra"
                                        onClick={() => onRestoreSample(sample.sample_id)}
                                    >
                                        <FontAwesomeIcon icon={iconMap['fa-undo']} />
                                    </button>
                                </div>
                                ) : (
                                // Muestra activa: todos los botones
                                <div className="flex space-x-3 text-gray-500">
                                    <button 
                                        className="hover:text-indigo-600 transition"
                                        title="Ver detalles"
                                        onClick={() => onViewDetails(sample.sample_id)}
                                    >
                                        <FontAwesomeIcon icon={iconMap['fa-eye']} />
                                    </button>
                                    <button 
                                        className="hover:text-indigo-600 transition" 
                                        title="Editar"
                                        onClick={() => onEditSample(sample.sample_id)}
                                    >
                                        <FontAwesomeIcon icon={iconMap['fa-edit']} />
                                    </button>
                                    {isPending && onMarkAsAnalyzed && (
                                        <button 
                                            className="hover:text-emerald-600 transition"
                                            title="Marcar como analizada"
                                            onClick={() => onMarkAsAnalyzed(sample.sample_id)}
                                        >
                                            <FontAwesomeIcon icon={iconMap['fa-check-circle']} />
                                        </button>
                                    )}
                                    <button 
                                        className="hover:text-green-600 transition"
                                        title="Reporte Final"
                                        onClick={() => onViewFinalReport(sample.sample_id)}
                                    >
                                        <FontAwesomeIcon icon={iconMap['fa-file-alt']} />
                                    </button>
                                    <button 
                                        className="hover:text-purple-600 transition"
                                        title="Historial"
                                        onClick={() => onViewStatusSummary(sample.sample_id)}
                                    >
                                        <FontAwesomeIcon icon={iconMap['fa-history']} />
                                    </button>
                                    <button 
                                        className="hover:text-blue-600 transition"
                                        title="Cadena de Custodia (PDF)"
                                        onClick={() => onDownloadPDF(sample.sample_id)}
                                    >
                                        <FontAwesomeIcon icon={iconMap['fa-download']} />
                                    </button>
                                    <button 
                                        className="hover:text-red-600 transition"
                                        title="Eliminar muestra"
                                        onClick={() => onDeleteSample(sample.sample_id)}
                                    >
                                        <FontAwesomeIcon icon={iconMap['fa-trash']} />
                                    </button>
                                </div>
                                );
                            })()}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Samples = () => {
    const [samples, setSamples] = useState([]);
    const [filteredSamples, setFilteredSamples] = useState([]);
    const [selectedSamples, setSelectedSamples] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');
    
    // Estados para modales
    const [modalData, setModalData] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSampleData, setEditSampleData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSampleData, setNewSampleData] = useState({
        collection_date: '',
        collection_location: '',
        sample_type_id: '',
        service_request_id: ''
    });
    const [sampleTypes, setSampleTypes] = useState([]);
    const [summaryCards, setSummaryCards] = useState([
        { title: 'Total Muestras', value: 0, iconName: 'fa-vial', iconBgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', barColor: 'bg-indigo-600' },
        { title: 'Analizadas', value: 0, iconName: 'fa-check-circle', iconBgColor: 'bg-green-100', iconColor: 'text-green-600', barColor: 'bg-green-600' },
        { title: 'Pendientes', value: 0, iconName: 'fa-clock', iconBgColor: 'bg-yellow-100', iconColor: 'text-yellow-600', barColor: 'bg-yellow-600' },
        { title: 'Seleccionadas', value: 0, iconName: 'fa-flask', iconBgColor: 'bg-teal-100', iconColor: 'text-teal-600', barColor: 'bg-teal-600' },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSampleTypes();
    }, []);

    useEffect(() => {
        if (sampleTypes.length > 0) {
            loadSamples();
        }
    }, [sampleTypes]);

    // Filtrar muestras cuando cambien los filtros
    useEffect(() => {
        filterSamples();
    }, [samples, searchTerm]);

    // Actualizar estadísticas cuando cambien las muestras o seleccionados
    useEffect(() => {
        if (samples.length === 0) {
            // Si no hay muestras, resetear estadísticas
            setSummaryCards(cards => [
                { ...cards[0], value: 0 },
                { ...cards[1], value: 0 },
                { ...cards[2], value: 0 },
                { ...cards[3], value: selectedSamples.length },
            ]);
            return;
        }
        
        // Estados que indican que la muestra está analizada: 4 (ANALIZADA), 6 (APROBADA), 9 (COMPLETADA), 11 (ENTREGADA)
        const estadosAnalizadas = [4, 6, 9, 11];
        // Excluir archivadas (12) del total
        const total = samples.filter(s => {
            const statusId = s.current_status_id || 1;
            return statusId !== 12; // Excluir archivadas
        }).length;
        
        const analizadas = samples.filter(s => {
            const statusId = s.current_status_id || 1;
            return estadosAnalizadas.includes(statusId);
        }).length;
        
        const pendientes = samples.filter(s => {
            const statusId = s.current_status_id || 1; // Si no tiene estado, asumir REGISTRADA
            return !estadosAnalizadas.includes(statusId) && statusId !== 12; // Excluir archivadas
        }).length;
        
        console.log('📊 Actualizando estadísticas:', { total, analizadas, pendientes, selected: selectedSamples.length });
        
        setSummaryCards(cards => [
            { ...cards[0], value: total },
            { ...cards[1], value: analizadas },
            { ...cards[2], value: pendientes },
            { ...cards[3], value: selectedSamples.length },
        ]);
    }, [samples, selectedSamples]);

    const loadSampleTypes = async () => {
        try {
            const data = await getSampleTypes();
            setSampleTypes(data);
        } catch (error) {
            console.error('Error al cargar tipos de muestra:', error);
        }
    };

    const loadSamples = async () => {
        try {
            setLoading(true);
            const data = await getSamples();
            console.log('📥 Datos recibidos del backend:', data.length, 'muestras');
            
            // Mapear sample_type_id a nombre
            const samplesWithTypeNames = data.map(sample => {
                const sampleType = sampleTypes.find(st => st.sample_type_id === sample.sample_type_id);
                const sampleData = {
                    ...sample,
                    sample_type_name: sampleType ? sampleType.type_name : null
                };
                // Log para debugging
                if (sample.sample_id) {
                    console.log(`📋 Muestra ${sample.sample_code || sample.sample_id}: current_status_id = ${sample.current_status_id}`);
                }
                return sampleData;
            });
            
            // Ordenar por ID descendente para que la última esté primero
            const sortedData = samplesWithTypeNames.sort((a, b) => b.sample_id - a.sample_id);
            setSamples(sortedData);
            
            // Log de estadísticas después de cargar
            const estadosAnalizadas = [4, 6, 9, 11];
            const total = sortedData.filter(s => (s.current_status_id || 1) !== 12).length;
            const analizadas = sortedData.filter(s => estadosAnalizadas.includes(s.current_status_id || 1)).length;
            const pendientes = sortedData.filter(s => {
                const statusId = s.current_status_id || 1;
                return !estadosAnalizadas.includes(statusId) && statusId !== 12;
            }).length;
            console.log('📊 Estadísticas después de cargar:', { total, analizadas, pendientes });
            
            // Las estadísticas se actualizarán automáticamente mediante el useEffect
        } catch (error) {
            console.error('Error al cargar muestras:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterSamples = () => {
        let filtered = samples;

        // Filtrar por término de búsqueda
        if (searchTerm && searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(sample => {
                // Buscar en código de muestra
                const codeMatch = sample.sample_code?.toLowerCase().includes(searchLower);
                // Buscar en ubicación
                const locationMatch = sample.collection_location?.toLowerCase().includes(searchLower);
                // Buscar en ID
                const idMatch = sample.sample_id?.toString().includes(searchLower);
                // Buscar en tipo de muestra
                const typeMatch = sample.sample_type_name?.toLowerCase().includes(searchLower) ||
                                  sample.sample_type_id?.toString().includes(searchLower);
                // Buscar en fecha de recolección
                const dateMatch = sample.collection_date?.toLowerCase().includes(searchLower) ||
                                  sample.collection_date?.split('T')[0].includes(searchLower);
                
                return codeMatch || locationMatch || idMatch || typeMatch || dateMatch;
            });
        }

        setFilteredSamples(filtered);
    };

    const handleSelectSample = (sampleId, isSelected) => {
        if (isSelected) {
            setSelectedSamples(prev => [...prev, sampleId]);
        } else {
            setSelectedSamples(prev => prev.filter(id => id !== sampleId));
        }
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedSamples(filteredSamples.map(sample => sample.sample_id));
        } else {
            setSelectedSamples([]);
        }
    };

    const handleEditSample = (sampleId) => {
        const sample = samples.find(s => s.sample_id === sampleId);
        setEditSampleData({ ...sample });
        setShowEditModal(true);
    };

    // Función para formatear fecha a YYYY-MM-DD (sin hora)
    const formatDateForBackend = (dateValue) => {
        if (!dateValue) return '';
        // Si viene en formato ISO con hora (2025-10-29T00:00:00), extraer solo la fecha
        if (dateValue.includes('T')) {
            return dateValue.split('T')[0];
        }
        // Si ya viene en formato YYYY-MM-DD, retornarlo tal cual
        return dateValue;
    };

    const handleSaveSample = async () => {
        try {
            setEditLoading(true);
            
            // Preparar datos para actualizar
            const updateData = {
                sample_code: editSampleData.sample_code.trim(),
                collection_date: formatDateForBackend(editSampleData.collection_date),
                collection_location: editSampleData.collection_location.trim(),
                sample_type_id: parseInt(editSampleData.sample_type_id),
                service_request_id: parseInt(editSampleData.service_request_id)
            };
            
            console.log('📤 Actualizando muestra:', editSampleData.sample_id, updateData);
            const response = await updateSample(editSampleData.sample_id, updateData);
            console.log('✅ Muestra actualizada:', response);
            
            await loadSamples();
            setShowEditModal(false);
            setEditSampleData(null);
        } catch (error) {
            console.error('❌ Error al actualizar muestra:', error);
            alert(`Error al actualizar la muestra: ${error.message}`);
        } finally {
            setEditLoading(false);
        }
    };

    const handleChangeEditField = (field, value) => {
        setEditSampleData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNewSample = () => {
        setNewSampleData({
            collection_date: '',
            collection_location: '',
            sample_type_id: '',
            service_request_id: ''
        });
        setShowCreateModal(true);
    };

    const handleSaveNewSample = async () => {
        try {
            setEditLoading(true);
            
            // Validar campos requeridos
            if (!newSampleData.collection_date || !newSampleData.collection_location || !newSampleData.sample_type_id || !newSampleData.service_request_id) {
                alert('Por favor, complete todos los campos');
                setEditLoading(false);
                return;
            }
            
            // Generar código automático: LAB-2025-XXX
            let nextNumber = '001';
            if (samples.length > 0) {
                // Obtener el último número de muestra
                const lastSample = samples[0]; // Ya está ordenado por ID descendente
                const lastNumber = parseInt(lastSample.sample_code.split('-')[2]);
                nextNumber = String(lastNumber + 1).padStart(3, '0');
            }
            const autoCode = `LAB-2025-${nextNumber}`;
            
            // Preparar datos para crear
            const sampleData = {
                sample_code: autoCode,
                collection_date: formatDateForBackend(newSampleData.collection_date),
                collection_location: newSampleData.collection_location.trim(),
                sample_type_id: parseInt(newSampleData.sample_type_id),
                service_request_id: parseInt(newSampleData.service_request_id)
            };
            
            console.log('📤 Creando muestra:', sampleData);
            await createSample(sampleData);
            console.log('✅ Muestra creada');
            
            alert(`Muestra ${autoCode} creada exitosamente`);
            await loadSamples();
            setShowCreateModal(false);
        } catch (error) {
            console.error('❌ Error al crear muestra:', error);
            alert(`Error al crear la muestra: ${error.message}`);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteSample = async (sampleId) => {
        const sample = samples.find(s => s.sample_id === sampleId);
        const sampleCode = sample?.sample_code || sampleId;
        
        const reason = prompt('¿Por qué desea eliminar esta muestra? (Ingrese la razón):');
        if (!reason || reason.trim() === '') {
            alert('Debe ingresar una razón para eliminar la muestra');
            return;
        }
        
        if (!confirm(`¿Está seguro de eliminar la muestra ${sampleCode} (ID: ${sampleId})?`)) {
            return;
        }
        
        try {
            console.log('🗑️ Eliminando muestra:', sampleId);
            const result = await deleteSample(sampleId, reason.trim());
            console.log('✅ Muestra eliminada:', result);
            
            // Mostrar mensaje de éxito
            alert(`Muestra ${sampleCode} eliminada correctamente`);
            
            // Recargar la lista completa de muestras desde el backend
            // El backend retornará current_status_id: 12 para muestras archivadas
            await loadSamples();
        } catch (error) {
            console.error('❌ Error al eliminar muestra:', error);
            alert(`Error al eliminar la muestra: ${error.message}`);
        }
    };

    const handleRestoreSample = async (sampleId) => {
        const sample = samples.find(s => s.sample_id === sampleId);
        const sampleCode = sample?.sample_code || sampleId;
        
        if (!confirm(`¿Desea restaurar la muestra ${sampleCode} (ID: ${sampleId})?`)) {
            return;
        }
        
        try {
            console.log('♻️ Restaurando muestra:', sampleId);
            const result = await restoreSample(sampleId);
            console.log('✅ Muestra restaurada:', result);
            
            // Mostrar mensaje de éxito
            alert(`Muestra ${sampleCode} restaurada correctamente`);
            
            // Recargar la lista completa de muestras desde el backend
            // El backend retornará current_status_id: 1 (REGISTRADA) para muestras restauradas
            await loadSamples();
        } catch (error) {
            console.error('❌ Error al restaurar muestra:', error);
            alert(`Error al restaurar la muestra: ${error.message}`);
        }
    };

    const handleMarkAsAnalyzed = async (sampleId) => {
        const sample = samples.find(s => s.sample_id === sampleId);
        const sampleCode = sample?.sample_code || sampleId;
        
        if (!confirm(`¿Desea marcar la muestra ${sampleCode} (ID: ${sampleId}) como analizada?`)) {
            return;
        }
        
        try {
            console.log('✅ Marcando muestra como analizada:', sampleId);
            const result = await markSampleAsAnalyzed(sampleId);
            console.log('✅ Muestra marcada como analizada:', result);
            
            // Verificar que el resultado tenga el estado actualizado
            const updatedStatusId = result?.current_status_id || result?.data?.current_status_id || 4;
            console.log('📊 Estado retornado por backend:', updatedStatusId);
            
            // Actualizar el estado local con el resultado del backend
            setSamples(prevSamples => 
                prevSamples.map(s => 
                    s.sample_id === sampleId 
                        ? { ...s, current_status_id: updatedStatusId } 
                        : s
                )
            );
            
            // Mostrar mensaje de éxito
            alert(`Muestra ${sampleCode} marcada como analizada correctamente`);
            
            // Esperar un momento para que el backend procese la actualización
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Recargar la lista completa de muestras desde el backend para asegurar consistencia
            await loadSamples();
        } catch (error) {
            console.error('❌ Error al marcar muestra como analizada:', error);
            alert(`Error al marcar la muestra como analizada: ${error.message}`);
        }
    };

    const handleExportSamples = async () => {
        try {
            // Determinar qué muestras exportar
            const dataToExport = selectedSamples.length > 0 
                ? filteredSamples.filter(sample => selectedSamples.includes(sample.sample_id))
                : filteredSamples;
            
            if (dataToExport.length === 0) {
                alert('No hay muestras para exportar');
                return;
            }

            // Mapeo de estados
            const statusMap = {
                1: 'REGISTRADA',
                2: 'EN RECEPCIÓN',
                3: 'EN ANÁLISIS',
                4: 'ANALIZADA',
                5: 'EN REVISIÓN',
                6: 'APROBADA',
                7: 'RECHAZADA',
                8: 'EN CORRECCIÓN',
                9: 'COMPLETADA',
                10: 'ENVIADA',
                11: 'ENTREGADA',
                12: 'ARCHIVADA'
            };

            const getStatusName = (statusId) => {
                return statusMap[statusId] || `ESTADO ${statusId}`;
            };

            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                } catch {
                    return dateString.split('T')[0] || dateString;
                }
            };

            // Crear elemento HTML temporal para el PDF
            const exportContainer = document.createElement('div');
            exportContainer.id = 'export-samples-pdf';
            exportContainer.style.position = 'absolute';
            exportContainer.style.left = '-9999px';
            exportContainer.style.width = '210mm';
            exportContainer.style.padding = '20px';
            exportContainer.style.backgroundColor = '#ffffff';
            exportContainer.style.fontFamily = 'Arial, sans-serif';
            
            const today = new Date().toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            exportContainer.innerHTML = `
                <div style="margin-bottom: 25px; border-bottom: 2px solid #374151; padding-bottom: 15px;">
                    <h1 style="margin: 0 0 5px 0; color: #111827; font-size: 20px; font-weight: bold;">Sistema de Recepción de Muestras</h1>
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">Reporte de Muestras - ${today}</p>
                </div>

                <div style="background: #f3f4f6; padding: 12px; margin-bottom: 20px; border: 1px solid #d1d5db; display: flex; justify-content: space-around;">
                    <div style="text-align: center;">
                        <p style="margin: 0; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase;">Total Muestras</p>
                        <p style="margin: 5px 0 0 0; color: #111827; font-size: 20px; font-weight: bold;">${dataToExport.length}</p>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase;">Analizadas</p>
                        <p style="margin: 5px 0 0 0; color: #111827; font-size: 20px; font-weight: bold;">${dataToExport.filter(s => [4, 6, 9, 11].includes(s.current_status_id || 1)).length}</p>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase;">Pendientes</p>
                        <p style="margin: 5px 0 0 0; color: #111827; font-size: 20px; font-weight: bold;">${dataToExport.filter(s => {
                            const statusId = s.current_status_id || 1;
                            return ![4, 6, 9, 11].includes(statusId) && statusId !== 12;
                        }).length}</p>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid #d1d5db;">
                    <thead>
                        <tr style="background: #374151; color: white;">
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">Código</th>
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">ID</th>
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">Fecha Recolección</th>
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">Ubicación</th>
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">Tipo</th>
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dataToExport.map((sample, index) => {
                            const isEven = index % 2 === 0;
                            const statusId = sample.current_status_id || 1;
                            const statusName = getStatusName(statusId);
                            
                            return `
                                <tr style="background: ${isEven ? '#ffffff' : '#f9fafb'};">
                                    <td style="padding: 8px; font-size: 10px; color: #111827; font-weight: 600; border: 1px solid #e5e7eb;">${sample.sample_code || 'N/A'}</td>
                                    <td style="padding: 8px; font-size: 10px; color: #6b7280; border: 1px solid #e5e7eb;">#${sample.sample_id || 'N/A'}</td>
                                    <td style="padding: 8px; font-size: 10px; color: #111827; border: 1px solid #e5e7eb;">${formatDate(sample.collection_date)}</td>
                                    <td style="padding: 8px; font-size: 10px; color: #111827; border: 1px solid #e5e7eb;">${sample.collection_location || 'N/A'}</td>
                                    <td style="padding: 8px; font-size: 10px; border: 1px solid #e5e7eb;">
                                        <span style="background: #e5e7eb; color: #374151; padding: 3px 6px; border: 1px solid #d1d5db; font-weight: 600; font-size: 9px;">
                                            ${sample.sample_type_name || `Tipo ${sample.sample_type_id}`}
                                        </span>
                                    </td>
                                    <td style="padding: 8px; font-size: 10px; color: #374151; font-weight: 600; border: 1px solid #e5e7eb;">
                                        ${statusName}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #d1d5db; text-align: center; color: #6b7280; font-size: 9px;">
                    <p style="margin: 0;">Generado el ${today} - Sistema de Recepción de Muestras de Laboratorio</p>
                    <p style="margin: 5px 0 0 0;">Total de registros: ${dataToExport.length}</p>
                </div>
            `;

            document.body.appendChild(exportContainer);

            // Esperar un momento para que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 100));

            // Generar PDF
            const filename = `muestras_${new Date().toISOString().split('T')[0]}.pdf`;
            await generatePDFFromHTML('export-samples-pdf', filename);

            // Limpiar elemento temporal
            document.body.removeChild(exportContainer);

            alert(`PDF exportado correctamente: ${filename}`);
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            alert(`Error al exportar PDF: ${error.message}`);
        }
    };

    const handleViewDetails = async (sampleId) => {
        const sample = samples.find(s => s.sample_id === sampleId);
        if (sample) {
            setModalType('details');
            setModalData(sample);
        }
    };

    const handleViewFinalReport = async (sampleId) => {
        try {
            console.log('📊 Cargando reporte final para muestra ID:', sampleId);
            
            // Obtener datos de la muestra
            const sample = await getSampleById(sampleId);
            console.log('✅ Muestra obtenida:', sample);
            
            // Obtener resultados de análisis para esta muestra
            // NOTA: El backend ahora retorna un array directo con parameter_name y unit incluidos
            let results = [];
            
            try {
                const resultsResponse = await getAnalysisResultsBySample(sampleId);
                console.log('📥 Respuesta de resultados:', resultsResponse);
                
                // El endpoint retorna un array directo con parameter_name y unit ya incluidos
                if (Array.isArray(resultsResponse)) {
                    results = resultsResponse;
                } else {
                    console.warn('⚠️ Respuesta no es un array:', resultsResponse);
                    results = [];
                }
                
                console.log('📊 Resultados procesados:', results);
                console.log('📊 Cantidad de resultados:', results.length);
                
                // Verificar que los resultados tienen parameter_name y unit
                if (results.length > 0) {
                    console.log('📊 Primer resultado (ejemplo):', results[0]);
                    console.log('📊 Tiene parameter_name?', 'parameter_name' in results[0]);
                    console.log('📊 Tiene unit?', 'unit' in results[0]);
                }
            } catch (err) {
                console.warn('⚠️ No se pudieron obtener resultados:', err);
                results = [];
            }
            
            // Obtener datos del backend si existen
            let backendData = {};
            try {
                backendData = await getFinalReport(sampleId);
                console.log('📥 Datos del backend:', backendData);
            } catch (err) {
                console.warn('⚠️ No se pudieron obtener datos del backend:', err);
            }
            
            // Obtener tipo de muestra si no está en sample
            let sampleTypeName = sample.sample_type_name;
            if (!sampleTypeName && sample.sample_type_id) {
                const sampleType = sampleTypes.find(st => st.sample_type_id === sample.sample_type_id);
                sampleTypeName = sampleType?.type_name || `Tipo ${sample.sample_type_id}`;
            }
            
            // Combinar todos los datos
            // Los resultados ya vienen con parameter_name y unit del backend
            const reportData = {
                sample_id: sample.sample_id,
                sample_code: sample.sample_code || 'N/A',
                collection_date: sample.collection_date,
                collection_location: sample.collection_location,
                sample_type_name: sampleTypeName,
                results: results, // Ya incluyen parameter_name y unit
                observations: backendData.observations || sample.notes || '',
                ...backendData // Los datos del backend tienen prioridad
            };
            
            console.log('📊 Datos finales del reporte:', reportData);
            
            setModalType('finalReport');
            setModalData(reportData);
        } catch (error) {
            console.error('❌ Error al cargar reporte final:', error);
            alert(`Error al cargar el reporte final: ${error.message}`);
        }
    };

    const handleViewStatusSummary = async (sampleId) => {
        try {
            const data = await getStatusSummary(sampleId);
            setModalType('statusSummary');
            setModalData(data);
        } catch (error) {
            console.error('Error al cargar resumen:', error);
            alert('Error al cargar el resumen de estado');
        }
    };

    const closeModal = () => {
        setModalType(null);
        setModalData(null);
    };

    // Función para mapear datos a formato de cadena de custodia
    const mapDataToChainOfCustody = (sample, request, customer, address, sampleType) => {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('es-PE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        // Formatear fecha de recolección
        const collectionDate = sample.collection_date 
            ? new Date(sample.collection_date).toLocaleDateString('es-PE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            })
            : formattedDate;
        
        // Obtener hora actual
        const currentTime = today.toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Mapear tipo de muestra a código MATRIZ
        const matrixMap = {
            'Suelo': 'SUE',
            'Foliar': 'FOL',
            'Agua': 'AGU',
            'Enm. Inorg Sólida': 'EIS',
            'Enm.Org. líquida': 'EOS',
            'Fertilizantes': 'FERT',
            'Frutos': 'FRUT',
            'Savia Veget.': 'SVG',
            'Otros insumos': 'OTROS'
        };
        
        const matrixCode = sampleType 
            ? (matrixMap[sampleType.type_name] || sampleType.type_name?.substring(0, 3).toUpperCase() || 'OTROS')
            : 'OTROS';

        return {
            // Datos de recepción
            client_code: customer?.customer_id?.toString() || '',
            contract_number: request?.service_request_id?.toString() || '',
            date: formattedDate,
            
            // Datos de la empresa
            company_name: customer ? `${customer.name || ''} ${customer.surname || ''}`.trim() : '',
            ruc: customer?.ruc || customer?.tax_id || '',
            address: address 
                ? `${address.street || ''} ${address.reference || ''}`.trim() 
                : customer?.address || '',
            district: address?.district || customer?.district || '',
            province: address?.province || customer?.province || '',
            contact: customer ? `${customer.name || ''} ${customer.surname || ''}`.trim() : '',
            phone: customer?.phone_number || '',
            cell: customer?.phone_number || '',
            email: customer?.email || '',
            telefax: customer?.telefax || '',
            
            // Datos del muestreo
            farm: sample.collection_location || '',
            sampled_by: customer ? `${customer.name || ''} ${customer.surname || ''}`.trim() : '',
            
            // Datos de muestras
            samples: [{
                lab_code: sample.sample_code || '',
                field_code: sample.sample_code || '',
                sampling_time: currentTime,
                sampling_date: collectionDate,
                matrix: matrixCode,
                salinity: false,
                characterization: false,
                nutrition: false,
                physicochemical: false,
                special: false,
                observations: sample.notes || ''
            }],
            
            // Observaciones
            observations: sample.notes || request?.notes || '',
            
            // Entrega y recepción
            delivered_by: customer ? `${customer.name || ''} ${customer.surname || ''}`.trim() : '',
            delivered_date: formattedDate,
            delivered_time: currentTime,
            received_by: '', // Se llenará por recepción
            received_date: formattedDate,
            received_time: currentTime,
            
            // Condición de muestra
            sampling_correct: '',
            container_adequate: '',
            samples_within_period: '',
            comments: '',
            quoted: false,
            invoiced: false,
            paid: false,
            sent: false,
            
            // ID de muestra para referencia
            sample_id: sample.sample_id
        };
    };

    const handleDownloadPDF = async (sampleId) => {
        try {
            // Obtener código de muestra para el nombre del archivo
            const sample = await getSampleById(sampleId).catch(() => null);
            const sampleCode = sample?.sample_code || sampleId;
            
            // Usar endpoint del backend para descargar PDF
            await downloadChainOfCustodyPDF(sampleId, sampleCode);
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            alert(`Error al descargar el PDF: ${error.message}`);
        }
    };

    return (
        <main className="p-6 flex-1">
            <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                    <FontAwesomeIcon icon={iconMap['fa-home']} className="mr-1 text-indigo-500" />
                    <a href="#" className="hover:underline">Inicio</a> 
                    <span className="mx-2">/</span> 
                    <span className="font-semibold text-gray-700">Gestión de Muestras</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Muestras</h1>
                <p className="text-gray-500 mt-1">Control y seguimiento de muestras de laboratorio.</p>
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
                            placeholder="Buscar por código, ubicación, tipo, fecha o ID..." 
                            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-4">
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
                        
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={handleExportSamples}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                title="Exportar muestras a PDF"
                            >
                                <FontAwesomeIcon icon={iconMap['fa-file-export']} />
                                <span>Exportar PDF</span>
                            </button>
                            <button 
                                onClick={() => {
                                    const dataToExport = selectedSamples.length > 0 
                                        ? filteredSamples.filter(sample => selectedSamples.includes(sample.sample_id))
                                        : filteredSamples;
                                    
                                    if (dataToExport.length === 0) {
                                        alert('No hay muestras para exportar');
                                        return;
                                    }
                                    
                                    const filename = `muestras_${new Date().toISOString().split('T')[0]}.xlsx`;
                                    generateSamplesExcel(dataToExport, filename);
                                    alert(`Excel exportado correctamente: ${filename}`);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                title="Exportar muestras a Excel"
                            >
                                <FontAwesomeIcon icon={iconMap['fa-file-export']} />
                                <span>Exportar Excel</span>
                            </button>
                        </div>

                        <button 
                            onClick={handleNewSample}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <FontAwesomeIcon icon={iconMap['fa-plus']} />
                            <span>Nueva Muestra</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-gray-500">Cargando muestras...</p>
                    </div>
                ) : samples.length === 0 ? (
                    <div className="text-center py-12">
                        <FontAwesomeIcon icon={iconMap['fa-vial']} className="text-6xl text-gray-300 mb-4" />
                        <p className="text-lg text-gray-500">No hay muestras registradas</p>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="animate-fadeIn">
                        <SampleTable 
                            data={filteredSamples} 
                            onSelectSample={handleSelectSample}
                            onSelectAll={handleSelectAll}
                            onViewDetails={handleViewDetails}
                            onEditSample={handleEditSample}
                            onDeleteSample={handleDeleteSample}
                            onRestoreSample={handleRestoreSample}
                            onViewFinalReport={handleViewFinalReport}
                            onViewStatusSummary={handleViewStatusSummary}
                            onDownloadPDF={handleDownloadPDF}
                            onMarkAsAnalyzed={handleMarkAsAnalyzed}
                            selectedSamples={selectedSamples}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {filteredSamples.map((sample, index) => (
                            <div 
                                key={sample.sample_id} 
                                className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                                            <FontAwesomeIcon icon={iconMap['fa-flask']} className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{sample.sample_code}</h3>
                                            <p className="text-xs text-gray-500">ID: {sample.sample_id}</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="rounded text-indigo-600"
                                        checked={selectedSamples.includes(sample.sample_id)}
                                        onChange={(e) => handleSelectSample(sample.sample_id, e.target.checked)}
                                    />
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Fecha:</span>
                                        <span className="text-gray-900">{sample.collection_date}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Ubicación:</span>
                                        <span className="text-gray-900">{sample.collection_location}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Tipo:</span>
                                        <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">{sample.sample_type_name || `Tipo ${sample.sample_type_id}`}</span>
                                    </div>
                                </div>
                                {(() => {
                                    // Verificar si la muestra está archivada/eliminada
                                    const isArchived = sample.current_status_id === 12 || sample.is_deleted === true;
                                    // Estados que indican que la muestra está analizada: 4 (ANALIZADA), 6 (APROBADA), 9 (COMPLETADA), 11 (ENTREGADA)
                                    const estadosAnalizadas = [4, 6, 9, 11];
                                    const isAnalyzed = estadosAnalizadas.includes(sample.current_status_id);
                                    const isPending = !isAnalyzed && !isArchived;
                                    
                                    return isArchived ? (
                                    // Muestra eliminada/archivada: solo botón de restaurar
                                    <div className="flex justify-center">
                                        <button 
                                            onClick={() => handleRestoreSample(sample.sample_id)}
                                            className="px-4 py-2 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium"
                                            title="Restaurar muestra"
                                        >
                                            <FontAwesomeIcon icon={iconMap['fa-undo']} className="mr-1" />
                                            Restaurar
                                        </button>
                                    </div>
                                    ) : (
                                    // Muestra activa: todos los botones
                                    <div className="grid grid-cols-3 gap-2">
                                        <button 
                                            onClick={() => handleViewDetails(sample.sample_id)}
                                            className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                                            title="Ver detalles"
                                        >
                                            Ver
                                        </button>
                                        <button 
                                            onClick={() => handleEditSample(sample.sample_id)}
                                            className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                                            title="Editar"
                                        >
                                            Editar
                                        </button>
                                        {isPending ? (
                                            <button 
                                                onClick={() => handleMarkAsAnalyzed(sample.sample_id)}
                                                className="px-2 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
                                                title="Marcar como analizada"
                                            >
                                                <FontAwesomeIcon icon={iconMap['fa-check-circle']} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleDownloadPDF(sample.sample_id)}
                                                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                title="PDF"
                                            >
                                                PDF
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleViewFinalReport(sample.sample_id)}
                                            className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition col-span-2"
                                            title="Reporte Final"
                                        >
                                            Reporte Final
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSample(sample.sample_id)}
                                            className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                            title="Eliminar muestra"
                                        >
                                            <FontAwesomeIcon icon={iconMap['fa-trash']} />
                                        </button>
                                    </div>
                                    );
                                })()}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de detalles */}
            <DetailModal
                isOpen={modalType === 'details'}
                onClose={closeModal}
                title="Detalles de la Muestra"
            >
                <ModalContent type="details" data={modalData} />
            </DetailModal>

            <DetailModal
                isOpen={modalType === 'chainOfCustody'}
                onClose={closeModal}
                title="Cadena de Custodia"
                maxWidth="max-w-6xl"
            >
                <div className="max-h-[80vh] overflow-y-auto">
                    <ChainOfCustody data={modalData} />
                </div>
            </DetailModal>

            <DetailModal
                isOpen={modalType === 'finalReport'}
                onClose={closeModal}
                title="Reporte Final"
            >
                <ModalContent type="finalReport" data={modalData} />
            </DetailModal>

            <DetailModal
                isOpen={modalType === 'statusSummary'}
                onClose={closeModal}
                title="Historial de Estado"
            >
                <ModalContent type="statusSummary" data={modalData} />
            </DetailModal>

            {/* Modal de edición de muestra */}
            <EditModal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditSampleData(null); }}
                onSave={handleSaveSample}
                title="Editar Muestra"
                loading={editLoading}
            >
                {editSampleData && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Código de Muestra</label>
                            <input
                                type="text"
                                value={editSampleData.sample_code}
                                onChange={(e) => handleChangeEditField('sample_code', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Recolección</label>
                            <input
                                type="date"
                                value={editSampleData.collection_date}
                                onChange={(e) => handleChangeEditField('collection_date', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación de Recolección</label>
                            <input
                                type="text"
                                value={editSampleData.collection_location}
                                onChange={(e) => handleChangeEditField('collection_location', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Muestra</label>
                            <select
                                value={editSampleData.sample_type_id}
                                onChange={(e) => handleChangeEditField('sample_type_id', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            >
                                <option value="">Seleccione un tipo de muestra</option>
                                {sampleTypes.map(st => (
                                    <option key={st.sample_type_id} value={st.sample_type_id}>
                                        {st.type_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ID Solicitud de Servicio</label>
                            <input
                                type="number"
                                value={editSampleData.service_request_id}
                                onChange={(e) => handleChangeEditField('service_request_id', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            />
                        </div>
                    </div>
                )}
            </EditModal>

            {/* Modal de creación de muestra */}
            <EditModal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); }}
                onSave={handleSaveNewSample}
                title="Crear Nueva Muestra"
                loading={editLoading}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Código de Muestra</label>
                        <input
                            type="text"
                            value={(() => {
                                // Calcular el próximo código
                                let nextNumber = '001';
                                if (samples.length > 0) {
                                    const lastSample = samples[0];
                                    const lastNumber = parseInt(lastSample.sample_code.split('-')[2]);
                                    nextNumber = String(lastNumber + 1).padStart(3, '0');
                                }
                                return `LAB-2025-${nextNumber}`;
                            })()}
                            disabled
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Este código se generará automáticamente</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Recolección *</label>
                        <input
                            type="date"
                            value={newSampleData.collection_date}
                            onChange={(e) => setNewSampleData({ ...newSampleData, collection_date: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación de Recolección *</label>
                        <input
                            type="text"
                            value={newSampleData.collection_location}
                            onChange={(e) => setNewSampleData({ ...newSampleData, collection_location: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            placeholder="Ej: Lima, Perú - Agua potable"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Muestra *</label>
                        <select
                            value={newSampleData.sample_type_id}
                            onChange={(e) => setNewSampleData({ ...newSampleData, sample_type_id: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            required
                        >
                            <option value="">Seleccione un tipo de muestra</option>
                            {sampleTypes.map(st => (
                                <option key={st.sample_type_id} value={st.sample_type_id}>
                                    {st.type_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Solicitud de Servicio *</label>
                        <input
                            type="number"
                            value={newSampleData.service_request_id}
                            onChange={(e) => setNewSampleData({ ...newSampleData, service_request_id: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            placeholder="Ej: 15"
                            required
                        />
                    </div>
                </div>
            </EditModal>
        </main>
    );
};

// Componente para renderizar contenido del modal
const ModalContent = ({ type, data }) => {
    if (!data) return null;

    if (type === 'details') {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Código de Muestra</p>
                        <p className="text-lg font-bold text-gray-900">{data.sample_code}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 mb-1">ID</p>
                        <p className="text-lg font-bold text-gray-900">{data.sample_id}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Fecha Recolección</p>
                        <p className="text-lg font-bold text-gray-900">{data.collection_date}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Tipo de Muestra</p>
                        <p className="text-lg font-bold text-gray-900">{data.sample_type_name || `Tipo ${data.sample_type_id}`}</p>
                    </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm font-semibold text-indigo-600 mb-2">📍 Ubicación</p>
                    <p className="text-lg text-indigo-900">{data.collection_location}</p>
                </div>
            </div>
        );
    }

    if (type === 'finalReport') {
        // Visualización mejorada del reporte final
        const reportData = data || {};
        console.log('🎨 Renderizando reporte final con datos:', reportData);
        console.log('🎨 Resultados:', reportData.results);
        console.log('🎨 Es array?', Array.isArray(reportData.results));
        console.log('🎨 Longitud:', reportData.results?.length);
        
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-green-800">📊 Reporte Final de Análisis</h3>
                        <div className="bg-white px-4 py-2 rounded-lg shadow">
                            <p className="text-sm text-gray-600">Código: <span className="font-bold text-green-700">{reportData.sample_code || 'N/A'}</span></p>
                        </div>
                    </div>
                    
                    {/* Información de la muestra */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-xs font-semibold text-gray-500 mb-1">Fecha de Recolección</p>
                            <p className="text-sm font-bold text-gray-900">{reportData.collection_date || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-xs font-semibold text-gray-500 mb-1">Tipo de Muestra</p>
                            <p className="text-sm font-bold text-gray-900">{reportData.sample_type_name || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow col-span-2">
                            <p className="text-xs font-semibold text-gray-500 mb-1">Ubicación de Recolección</p>
                            <p className="text-sm font-bold text-gray-900">{reportData.collection_location || 'N/A'}</p>
                        </div>
                    </div>
                    
                    {/* Resultados de análisis */}
                    {reportData.results && reportData.results.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="px-6 py-4 bg-green-700 text-white">
                                <h4 className="text-lg font-bold">Resultados de Análisis</h4>
                                <p className="text-sm text-green-100">Total de parámetros analizados: {reportData.results.length}</p>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-green-600 text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Parámetro</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Valor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Unidad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha Análisis</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.results.map((result, index) => (
                                        <tr key={result.analysis_result_id || index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {result.parameter_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                                {result.result_value !== null && result.result_value !== undefined ? result.result_value : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {result.unit || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {result.analysis_date ? new Date(result.analysis_date).toLocaleDateString('es-PE') : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="text-yellow-800 font-semibold">No hay resultados disponibles</p>
                                    <p className="text-yellow-700 text-sm mt-1">Esta muestra aún no tiene resultados de análisis registrados.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Observaciones */}
                    {reportData.observations && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-800 mb-2">📝 Observaciones:</h4>
                            <p className="text-blue-700">{reportData.observations}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (type === 'statusSummary') {
        // Mapeo de IDs de estado a nombres y colores
        const statusMap = {
            1: { name: 'REGISTRADA', color: 'bg-blue-100', textColor: 'text-blue-800', icon: '📝' },
            2: { name: 'EN RECEPCIÓN', color: 'bg-yellow-100', textColor: 'text-yellow-800', icon: '📥' },
            3: { name: 'EN ANÁLISIS', color: 'bg-orange-100', textColor: 'text-orange-800', icon: '🔬' },
            4: { name: 'ANALIZADA', color: 'bg-green-100', textColor: 'text-green-800', icon: '✅' },
            5: { name: 'EN REVISIÓN', color: 'bg-purple-100', textColor: 'text-purple-800', icon: '👀' },
            6: { name: 'APROBADA', color: 'bg-emerald-100', textColor: 'text-emerald-800', icon: '✔️' },
            7: { name: 'RECHAZADA', color: 'bg-red-100', textColor: 'text-red-800', icon: '❌' },
            8: { name: 'EN CORRECCIÓN', color: 'bg-amber-100', textColor: 'text-amber-800', icon: '🔧' },
            9: { name: 'COMPLETADA', color: 'bg-teal-100', textColor: 'text-teal-800', icon: '🎉' },
            10: { name: 'ENVIADA', color: 'bg-indigo-100', textColor: 'text-indigo-800', icon: '📤' },
            11: { name: 'ENTREGADA', color: 'bg-cyan-100', textColor: 'text-cyan-800', icon: '📦' },
            12: { name: 'ARCHIVADA', color: 'bg-gray-100', textColor: 'text-gray-800', icon: '📁' },
        };

        const getStatusInfo = (statusId) => {
            return statusMap[statusId] || { 
                name: `ESTADO ${statusId}`, 
                color: 'bg-gray-100', 
                textColor: 'text-gray-800', 
                icon: '📋' 
            };
        };

        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch {
                return dateString;
            }
        };

        // Extraer datos del response
        const summaryData = data?.data || data;
        const sample = summaryData?.sample || {};
        const traceability = summaryData?.traceability || [];
        const totalChanges = summaryData?.total_status_changes || traceability.length;
        const generatedDate = summaryData?.generated_date || new Date().toISOString();

        return (
            <div className="space-y-6">
                {/* Información de la Muestra */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <FontAwesomeIcon icon={iconMap['fa-history']} className="text-purple-600 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Información de la Muestra</h3>
                            <p className="text-sm text-gray-600">Detalles del historial de estado</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-purple-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Código de Muestra</p>
                            <p className="text-lg font-bold text-indigo-600">{sample.sample_code || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-purple-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">ID de Muestra</p>
                            <p className="text-lg font-bold text-gray-800">#{sample.sample_id || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-purple-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Fecha de Recolección</p>
                            <p className="text-sm font-medium text-gray-700">{formatDate(sample.collection_date)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-purple-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Ubicación</p>
                            <p className="text-sm font-medium text-gray-700">{sample.collection_location || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Resumen de Cambios */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 text-xl">📊</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Resumen de Cambios</h3>
                                <p className="text-sm text-gray-600">Total de cambios de estado registrados</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
                            <p className="text-2xl font-bold text-indigo-600">{totalChanges}</p>
                            <p className="text-xs text-indigo-600 font-medium">Cambios</p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">Generado el:</span> {formatDate(generatedDate)}
                    </div>
                </div>

                {/* Timeline de Cambios */}
                {traceability.length > 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-purple-600 text-xl">🕐</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Historial de Cambios</h3>
                                <p className="text-sm text-gray-600">Timeline de estados de la muestra</p>
                            </div>
                        </div>
                        <div className="relative">
                            {/* Línea vertical del timeline */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                            
                            {/* Items del timeline */}
                            <div className="space-y-6">
                                {traceability.map((item, index) => {
                                    const statusInfo = getStatusInfo(item.sample_status_id);
                                    
                                    return (
                                        <div key={index} className="relative flex items-start">
                                            {/* Círculo del timeline */}
                                            <div className={`relative z-10 w-12 h-12 ${statusInfo.color} rounded-full flex items-center justify-center border-4 border-white shadow-md`}>
                                                <span className="text-lg">{statusInfo.icon}</span>
                                            </div>
                                            
                                            {/* Contenido del item */}
                                            <div className="ml-6 flex-1 pb-6">
                                                <div className={`${statusInfo.color} ${statusInfo.textColor} px-4 py-2 rounded-lg inline-block mb-2`}>
                                                    <span className="font-semibold">{statusInfo.name}</span>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Fecha del Cambio</p>
                                                            <p className="text-gray-700 font-medium">{formatDate(item.created_date || item.change_date)}</p>
                                                        </div>
                                                        {item.comments && (
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Comentarios</p>
                                                                <p className="text-gray-700">{item.comments}</p>
                                                            </div>
                                                        )}
                                                        {item.user_id && (
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Usuario</p>
                                                                <p className="text-gray-700">ID: {item.user_id}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-yellow-600 text-xl">⚠️</span>
                            </div>
                            <div>
                                <p className="text-yellow-800 font-semibold mb-1">No hay cambios de estado registrados</p>
                                <p className="text-yellow-700 text-sm">Esta muestra aún no tiene un historial de cambios de estado en el sistema.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default Samples;


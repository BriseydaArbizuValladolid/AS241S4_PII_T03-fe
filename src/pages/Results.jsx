import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChartLine, faCheckCircle, faEdit, faSearch, faTable, 
    faList, faFileExport, faPlus, faEye, faHome, faFlask, faTrash, faUndo
} from '@fortawesome/free-solid-svg-icons';
import { getAnalysisResults, getAnalysisResultsBySample, deleteAnalysisResult, restoreAnalysisResult, updateAnalysisResult, createAnalysisResult, getAnalysisParameters } from '../shared/api/analysisApi';
import { getSamples } from '../shared/api/sampleApi';
import DetailModal from '../components/DetailModal';
import EditModal from '../components/EditModal';
import { generatePDFFromHTML } from '../utils/pdfGenerator';
import { generateResultsExcel } from '../utils/excelGenerator';

const iconMap = {
    'fa-chart-line': faChartLine, 'fa-check-circle': faCheckCircle, 'fa-search': faSearch, 
    'fa-table': faTable, 'fa-list': faList, 'fa-file-export': faFileExport, 
    'fa-plus': faPlus, 'fa-eye': faEye, 'fa-home': faHome, 'fa-flask': faFlask,
    'fa-edit': faEdit, 'fa-trash': faTrash, 'fa-undo': faUndo,
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

const ResultsTable = ({ data, onSelectResult, onSelectAll, onViewResult, onEditResult, onDelete, onRestore, selectedResults }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <input 
                            type="checkbox" 
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                            checked={data.length > 0 && selectedResults.length === data.length}
                            onChange={(e) => onSelectAll(e.target.checked)}
                        />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Resultado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Muestra ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parámetro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Análisis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {data.map((result) => (
                    <tr key={result.analysis_result_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap w-12">
                            <input 
                                type="checkbox" 
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                checked={selectedResults.includes(result.analysis_result_id)}
                                onChange={(e) => onSelectResult(result.analysis_result_id, e.target.checked)}
                            />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{result.analysis_result_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Muestra {result.sample_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.parameter_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                            {result.result_value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.analysis_date || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {(() => {
                                const isDeleted = result.is_deleted === true || result.is_deleted === 1;
                                
                                return isDeleted ? (
                                    <div className="flex space-x-3 text-gray-500">
                                        <button 
                                            onClick={() => onViewResult(result.analysis_result_id)}
                                            className="hover:text-indigo-600 transition" 
                                            title="Ver detalles"
                                        >
                                            <FontAwesomeIcon icon={iconMap['fa-eye']} />
                                        </button>
                                        {onRestore && (
                                            <button 
                                                onClick={() => onRestore(result.analysis_result_id)}
                                                className="hover:text-green-600 transition" 
                                                title="Restaurar resultado"
                                            >
                                                <FontAwesomeIcon icon={iconMap['fa-undo']} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex space-x-3 text-gray-500">
                                        <button 
                                            onClick={() => onViewResult(result.analysis_result_id)}
                                            className="hover:text-indigo-600 transition" 
                                            title="Ver detalles"
                                        >
                                            <FontAwesomeIcon icon={iconMap['fa-eye']} />
                                        </button>
                                        <button 
                                            onClick={() => onEditResult(result.analysis_result_id)}
                                            className="hover:text-indigo-600 transition" 
                                            title="Editar"
                                        >
                                            <FontAwesomeIcon icon={iconMap['fa-edit']} />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(result.analysis_result_id)}
                                            className="hover:text-red-600 transition" 
                                            title="Eliminar resultado"
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

const Results = () => {
    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [selectedResults, setSelectedResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [showDeleted, setShowDeleted] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [samples, setSamples] = useState([]);
    const [parameters, setParameters] = useState([]);
    const [showResultModal, setShowResultModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editResultData, setEditResultData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newResultData, setNewResultData] = useState({
        sample_id: '',
        analysis_parameter_id: '',
        result_value: '',
        analysis_date: ''
    });
    const [summaryCards, setSummaryCards] = useState([
        { title: 'Total Resultados', value: 0, iconName: 'fa-chart-line', iconBgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', barColor: 'bg-indigo-600' },
        { title: 'Este Mes', value: 0, iconName: 'fa-check-circle', iconBgColor: 'bg-green-100', iconColor: 'text-green-600', barColor: 'bg-green-600' },
        { title: 'Muestras Analizadas', value: 0, iconName: 'fa-flask', iconBgColor: 'bg-purple-100', iconColor: 'text-purple-600', barColor: 'bg-purple-600' },
        { title: 'Seleccionados', value: 0, iconName: 'fa-chart-line', iconBgColor: 'bg-teal-100', iconColor: 'text-teal-600', barColor: 'bg-teal-600' },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [showDeleted]);

    // Filtrar resultados cuando cambien los filtros
    useEffect(() => {
        filterResults();
    }, [results, searchTerm, showDeleted]);

    // Actualizar contador de seleccionados
    useEffect(() => {
        setSummaryCards(cards => [
            ...cards.slice(0, 3),
            { ...cards[3], value: selectedResults.length }
        ]);
    }, [selectedResults]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [resultsData, samplesData, parametersData] = await Promise.all([
                getAnalysisResults(showDeleted).catch(() => []),
                getSamples().catch(() => []),
                getAnalysisParameters().catch(() => [])
            ]);
            
            // Relacionar los resultados con los parámetros
            const resultsWithParams = resultsData.map(result => {
                const param = parametersData.find(p => p.analysis_parameter_id === result.analysis_parameter_id);
                return {
                    ...result,
                    parameter_name: param ? param.parameter_name : 'N/A',
                    unit: param ? param.unit : result.unit || '-'
                };
            });
            
            setResults(resultsWithParams);
            setSamples(samplesData);
            setParameters(parametersData);
            
            const total = resultsData.length;
            const uniqueSamples = new Set(resultsData.map(r => r.sample_id)).size;
            
            setSummaryCards(cards => [
                { ...cards[0], value: total },
                { ...cards[1], value: Math.floor(total * 0.3) },
                { ...cards[2], value: uniqueSamples },
                { ...cards[3], value: selectedResults.length },
            ]);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterResults = () => {
        let filtered = results;

        // Filtrar por eliminados (por defecto no mostrar eliminados)
        if (!showDeleted) {
            filtered = filtered.filter(result => !result.is_deleted && result.is_deleted !== 1 && result.is_deleted !== true);
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(result => 
                result.analysis_result_id.toString().includes(searchTerm) ||
                result.sample_id.toString().includes(searchTerm) ||
                (result.parameter_name && result.parameter_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                result.result_value.toString().includes(searchTerm)
            );
        }

        setFilteredResults(filtered);
    };

    const handleSelectResult = (resultId, isSelected) => {
        if (isSelected) {
            setSelectedResults(prev => [...prev, resultId]);
        } else {
            setSelectedResults(prev => prev.filter(id => id !== resultId));
        }
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedResults(filteredResults.map(result => result.analysis_result_id));
        } else {
            setSelectedResults([]);
        }
    };

    const handleViewResult = (resultId) => {
        const result = results.find(r => r.analysis_result_id === resultId);
        setSelectedResult(result);
        setShowResultModal(true);
    };

    const handleEditResult = (resultId) => {
        const result = results.find(r => r.analysis_result_id === resultId);
        setEditResultData({ ...result });
        setShowEditModal(true);
    };

    const handleSaveResult = async () => {
        try {
            setEditLoading(true);
            
            // Preparar datos para actualizar
            const resultValue = editResultData.result_value || editResultData.parameter_value || '';
            const updateData = {
                sample_id: parseInt(editResultData.sample_id),
                analysis_parameter_id: parseInt(editResultData.analysis_parameter_id),
                result_value: typeof resultValue === 'string' ? resultValue.trim() : resultValue,
                analysis_date: editResultData.analysis_date
            };
            
            console.log('📤 Actualizando resultado:', editResultData.analysis_result_id, updateData);
            const response = await updateAnalysisResult(editResultData.analysis_result_id, updateData);
            console.log('✅ Resultado actualizado:', response);
            
            await loadData();
            setShowEditModal(false);
            setEditResultData(null);
        } catch (error) {
            console.error('❌ Error al actualizar resultado:', error);
            alert(`Error al actualizar el resultado: ${error.message}`);
        } finally {
            setEditLoading(false);
        }
    };

    const handleChangeEditField = (field, value) => {
        setEditResultData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNewResult = () => {
        setNewResultData({
            sample_id: '',
            analysis_parameter_id: '',
            result_value: '',
            analysis_date: ''
        });
        setShowCreateModal(true);
    };

    const handleSaveNewResult = async () => {
        try {
            setEditLoading(true);
            
            // Validar campos requeridos
            if (!newResultData.sample_id || !newResultData.analysis_parameter_id || !newResultData.result_value || !newResultData.analysis_date) {
                alert('Por favor, complete todos los campos');
                setEditLoading(false);
                return;
            }
            
            // Preparar datos para crear
            const resultData = {
                sample_id: parseInt(newResultData.sample_id),
                analysis_parameter_id: parseInt(newResultData.analysis_parameter_id),
                result_value: parseFloat(newResultData.result_value),
                analysis_date: newResultData.analysis_date
            };
            
            console.log('📤 Creando resultado:', resultData);
            await createAnalysisResult(resultData);
            console.log('✅ Resultado creado');
            
            alert('Resultado creado exitosamente');
            await loadData();
            setShowCreateModal(false);
        } catch (error) {
            console.error('❌ Error al crear resultado:', error);
            alert(`Error al crear el resultado: ${error.message}`);
        } finally {
            setEditLoading(false);
        }
    };

    const handleExportResults = async () => {
        try {
            // Determinar qué resultados exportar
            const dataToExport = selectedResults.length > 0 
                ? filteredResults.filter(result => selectedResults.includes(result.analysis_result_id))
                : filteredResults;
            
            if (dataToExport.length === 0) {
                alert('No hay resultados para exportar');
                return;
            }

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
            exportContainer.id = 'export-results-pdf';
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
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">Reporte de Resultados de Análisis - ${today}</p>
                </div>

                <div style="background: #f3f4f6; padding: 12px; margin-bottom: 20px; border: 1px solid #d1d5db; display: flex; justify-content: space-around;">
                    <div style="text-align: center;">
                        <p style="margin: 0; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase;">Total Resultados</p>
                        <p style="margin: 5px 0 0 0; color: #111827; font-size: 20px; font-weight: bold;">${dataToExport.length}</p>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase;">Muestras Únicas</p>
                        <p style="margin: 5px 0 0 0; color: #111827; font-size: 20px; font-weight: bold;">${new Set(dataToExport.map(r => r.sample_id)).size}</p>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase;">Parámetros</p>
                        <p style="margin: 5px 0 0 0; color: #111827; font-size: 20px; font-weight: bold;">${new Set(dataToExport.map(r => r.parameter_name || r.analysis_parameter_id)).size}</p>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid #d1d5db;">
                    <thead>
                        <tr style="background: #374151; color: white;">
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">ID Resultado</th>
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">Muestra ID</th>
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">Parámetro</th>
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">Valor</th>
                            <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid #4b5563;">Fecha Análisis</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dataToExport.map((result, index) => {
                            const isEven = index % 2 === 0;
                            
                            return `
                                <tr style="background: ${isEven ? '#ffffff' : '#f9fafb'};">
                                    <td style="padding: 8px; font-size: 10px; color: #111827; font-weight: 600; border: 1px solid #e5e7eb;">#${result.analysis_result_id || 'N/A'}</td>
                                    <td style="padding: 8px; font-size: 10px; color: #6b7280; border: 1px solid #e5e7eb;">Muestra ${result.sample_id || 'N/A'}</td>
                                    <td style="padding: 8px; font-size: 10px; border: 1px solid #e5e7eb;">
                                        <span style="background: #e5e7eb; color: #374151; padding: 3px 6px; border: 1px solid #d1d5db; font-weight: 600; font-size: 9px;">
                                            ${result.parameter_name || `Parámetro ${result.analysis_parameter_id}` || 'N/A'}
                                        </span>
                                    </td>
                                    <td style="padding: 8px; font-size: 10px; color: #111827; font-weight: 600; border: 1px solid #e5e7eb;">${result.result_value || 'N/A'}</td>
                                    <td style="padding: 8px; font-size: 10px; color: #374151; border: 1px solid #e5e7eb;">${formatDate(result.analysis_date)}</td>
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
            const filename = `resultados_${new Date().toISOString().split('T')[0]}.pdf`;
            await generatePDFFromHTML('export-results-pdf', filename);

            // Limpiar elemento temporal
            document.body.removeChild(exportContainer);

            alert(`PDF exportado correctamente: ${filename}`);
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            alert(`Error al exportar PDF: ${error.message}`);
        }
    };

    const loadResultsBySample = async (sampleId) => {
        try {
            setLoading(true);
            const data = await getAnalysisResultsBySample(sampleId, showDeleted);
            setResults(data);
            setSelectedSample(sampleId);
        } catch (error) {
            console.error('Error al cargar resultados por muestra:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (resultId) => {
        const result = results.find(r => r.analysis_result_id === resultId);
        const resultInfo = result ? `Resultado #${resultId} (${result.parameter_name || 'N/A'})` : `Resultado ${resultId}`;
        
        const reason = prompt(`¿Por qué desea eliminar ${resultInfo}? (Ingrese la razón):`);
        if (!reason || reason.trim() === '') {
            alert('Debe ingresar una razón para eliminar el resultado');
            return;
        }
        
        if (!confirm(`¿Está seguro de eliminar ${resultInfo}?`)) {
            return;
        }
        
        try {
            console.log('🗑️ Eliminando resultado lógicamente:', resultId);
            await deleteAnalysisResult(resultId, reason.trim());
            console.log('✅ Resultado eliminado');
            alert(`${resultInfo} eliminado correctamente`);
            await loadData();
        } catch (error) {
            console.error('❌ Error al eliminar resultado:', error);
            alert(`Error al eliminar el resultado: ${error.message}`);
        }
    };

    const handleRestore = async (resultId) => {
        const result = results.find(r => r.analysis_result_id === resultId);
        const resultInfo = result ? `Resultado #${resultId} (${result.parameter_name || 'N/A'})` : `Resultado ${resultId}`;
        
        if (!confirm(`¿Desea restaurar ${resultInfo}?`)) {
            return;
        }
        
        try {
            console.log('♻️ Restaurando resultado:', resultId);
            await restoreAnalysisResult(resultId);
            console.log('✅ Resultado restaurado');
            alert(`${resultInfo} restaurado correctamente`);
            await loadData();
        } catch (error) {
            console.error('❌ Error al restaurar resultado:', error);
            alert(`Error al restaurar el resultado: ${error.message}`);
        }
    };

    return (
        <main className="p-6 flex-1">
            <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                    <FontAwesomeIcon icon={iconMap['fa-home']} className="mr-1 text-indigo-500" />
                    <a href="#" className="hover:underline">Inicio</a> 
                    <span className="mx-2">/</span> 
                    <span className="font-semibold text-gray-700">Resultados de Análisis</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Resultados de Análisis</h1>
                <p className="text-gray-500 mt-1">Gestión de resultados de análisis de muestras.</p>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
                {summaryCards.map((card, index) => (
                    <SummaryCard key={index} {...card} />
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <div className="flex items-center space-x-4 mb-4">
                    <label className="text-sm font-medium text-gray-700">Filtrar por Muestra:</label>
                    <select
                        onChange={(e) => e.target.value ? loadResultsBySample(parseInt(e.target.value)) : loadData()}
                        className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Todas las muestras</option>
                        {samples.map(sample => (
                            <option key={sample.sample_id} value={sample.sample_id}>
                                {sample.sample_code}
                            </option>
                        ))}
                    </select>
                    {selectedSample && (
                        <button
                            onClick={() => {
                                setSelectedSample(null);
                                loadData();
                            }}
                            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Limpiar filtro
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative flex-grow max-w-sm mr-4">
                        <FontAwesomeIcon icon={iconMap['fa-search']} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar resultados..." 
                            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showDeleted}
                                onChange={(e) => setShowDeleted(e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Mostrar eliminados</span>
                        </label>
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
                                onClick={handleExportResults}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                title="Exportar resultados a PDF"
                            >
                                <FontAwesomeIcon icon={iconMap['fa-file-export']} />
                                <span>Exportar PDF</span>
                            </button>
                            <button 
                                onClick={() => {
                                    const dataToExport = selectedResults.length > 0 
                                        ? filteredResults.filter(result => selectedResults.includes(result.analysis_result_id))
                                        : filteredResults;
                                    
                                    if (dataToExport.length === 0) {
                                        alert('No hay resultados para exportar');
                                        return;
                                    }
                                    
                                    const filename = `resultados_${new Date().toISOString().split('T')[0]}.xlsx`;
                                    generateResultsExcel(dataToExport, filename);
                                    alert(`Excel exportado correctamente: ${filename}`);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                title="Exportar resultados a Excel"
                            >
                                <FontAwesomeIcon icon={iconMap['fa-file-export']} />
                                <span>Exportar Excel</span>
                            </button>
                        </div>

                        <button 
                            onClick={handleNewResult}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <FontAwesomeIcon icon={iconMap['fa-plus']} />
                            <span>Nuevo Resultado</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-gray-500">Cargando resultados...</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-12">
                        <FontAwesomeIcon icon={iconMap['fa-chart-line']} className="text-6xl text-gray-300 mb-4" />
                        <p className="text-lg text-gray-500">No hay resultados registrados</p>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="animate-fadeIn">
                        <ResultsTable 
                            data={filteredResults} 
                            onSelectResult={handleSelectResult}
                            onSelectAll={handleSelectAll}
                            onViewResult={handleViewResult}
                            onEditResult={handleEditResult}
                            onDelete={handleDelete}
                            onRestore={handleRestore}
                            selectedResults={selectedResults}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {filteredResults.map((result, index) => (
                            <div 
                                key={result.analysis_result_id} 
                                className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                                            <FontAwesomeIcon icon={iconMap['fa-chart-line']} className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">#{result.analysis_result_id}</h3>
                                            <p className="text-xs text-gray-500">Muestra: {result.sample_id}</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="rounded text-indigo-600"
                                        checked={selectedResults.includes(result.analysis_result_id)}
                                        onChange={(e) => handleSelectResult(result.analysis_result_id, e.target.checked)}
                                    />
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Parámetro:</span>
                                        <span className="text-gray-900">{result.parameter_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Valor:</span>
                                        <span className="text-gray-900 font-semibold text-indigo-600">{result.result_value}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Fecha:</span>
                                        <span className="text-gray-900">{result.analysis_date || 'N/A'}</span>
                                    </div>
                                </div>
                                {(() => {
                                    const isDeleted = result.is_deleted === true || result.is_deleted === 1;
                                    
                                    return isDeleted ? (
                                        <div className="flex justify-center">
                                            <button 
                                                onClick={() => handleRestore(result.analysis_result_id)}
                                                className="px-4 py-2 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium"
                                                title="Restaurar resultado"
                                            >
                                                <FontAwesomeIcon icon={iconMap['fa-undo']} className="mr-1" />
                                                Restaurar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2">
                                            <button 
                                                onClick={() => handleViewResult(result.analysis_result_id)}
                                                className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                                                title="Ver detalles"
                                            >
                                                Ver
                                            </button>
                                            <button 
                                                onClick={() => handleEditResult(result.analysis_result_id)}
                                                className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                                                title="Editar"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(result.analysis_result_id)}
                                                className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                                title="Eliminar resultado"
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
            {/* Modal de detalles de resultado */}
            <DetailModal
                isOpen={showResultModal}
                onClose={() => { setShowResultModal(false); setSelectedResult(null); }}
                title={`Resultado: #${selectedResult?.analysis_result_id || ''}`}
            >
                {selectedResult && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-gray-500 mb-1">ID Resultado</p>
                                <p className="text-lg font-bold text-gray-900">#{selectedResult.analysis_result_id}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-gray-500 mb-1">ID Muestra</p>
                                <p className="text-lg font-bold text-gray-900">{selectedResult.sample_id}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-gray-500 mb-1">Parámetro</p>
                                <p className="text-lg font-bold text-gray-900">{selectedResult.parameter_name || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-gray-500 mb-1">Fecha Análisis</p>
                                <p className="text-lg font-bold text-gray-900">{selectedResult.analysis_date || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                            <p className="text-sm font-semibold text-indigo-600 mb-2">📊 Valor del Resultado</p>
                            <p className="text-3xl font-bold text-indigo-900">{selectedResult.result_value}</p>
                        </div>
                    </div>
                )}
            </DetailModal>

            {/* Modal de edición de resultado */}
            <EditModal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditResultData(null); }}
                onSave={handleSaveResult}
                title="Editar Resultado"
                loading={editLoading}
            >
                {editResultData && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ID Resultado</label>
                            <input
                                type="text"
                                value={editResultData.analysis_result_id}
                                disabled
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ID Muestra</label>
                            <input
                                type="number"
                                value={editResultData.sample_id}
                                onChange={(e) => handleChangeEditField('sample_id', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Parámetro</label>
                            <select
                                value={editResultData.analysis_parameter_id || ''}
                                onChange={(e) => {
                                    const param = parameters.find(p => p.analysis_parameter_id == e.target.value);
                                    handleChangeEditField('analysis_parameter_id', e.target.value);
                                    handleChangeEditField('parameter_name', param ? param.parameter_name : '');
                                }}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            >
                                <option value="">Seleccionar parámetro</option>
                                {parameters.map(param => (
                                    <option key={param.analysis_parameter_id} value={param.analysis_parameter_id}>
                                        {param.parameter_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                            <input
                                type="text"
                                value={editResultData.result_value || editResultData.parameter_value || ''}
                                onChange={(e) => handleChangeEditField('result_value', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Análisis</label>
                            <input
                                type="date"
                                value={editResultData.analysis_date}
                                onChange={(e) => handleChangeEditField('analysis_date', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            />
                        </div>
                    </div>
                )}
            </EditModal>

            {/* Modal de creación de resultado */}
            <EditModal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); }}
                onSave={handleSaveNewResult}
                title="Crear Nuevo Resultado"
                loading={editLoading}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Muestra *</label>
                        <input
                            type="number"
                            value={newResultData.sample_id}
                            onChange={(e) => setNewResultData({ ...newResultData, sample_id: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            placeholder="Ej: 1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Parámetro *</label>
                        <select
                            value={newResultData.analysis_parameter_id}
                            onChange={(e) => {
                                const param = parameters.find(p => p.analysis_parameter_id == e.target.value);
                                setNewResultData({ 
                                    ...newResultData, 
                                    analysis_parameter_id: e.target.value 
                                });
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            required
                        >
                            <option value="">Seleccionar parámetro</option>
                            {parameters.map(param => (
                                <option key={param.analysis_parameter_id} value={param.analysis_parameter_id}>
                                    {param.parameter_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={newResultData.result_value}
                            onChange={(e) => setNewResultData({ ...newResultData, result_value: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            placeholder="Ej: 7.2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Análisis *</label>
                        <input
                            type="date"
                            value={newResultData.analysis_date}
                            onChange={(e) => setNewResultData({ ...newResultData, analysis_date: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white bg-gray-700"
                            required
                        />
                    </div>
                </div>
            </EditModal>
        </main>
    );
};

export default Results;


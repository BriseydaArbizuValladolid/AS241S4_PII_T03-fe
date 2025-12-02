/**
 * API para gestión de documentos
 * Backend: Flask + Oracle Database
 * Endpoints: /api/documents
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Obtiene datos para Cadena de Custodia
 * GET /api/documents/chain-of-custody/{sample_id}
 * 
 * @param {number} sampleId - ID de la muestra
 * @returns {Promise<Object>} Datos del documento
 */
export const getChainOfCustody = async (sampleId) => {
    try {
        const response = await fetch(`${API_URL}/api/documents/chain-of-custody/${sampleId}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getChainOfCustody:', error);
        throw error;
    }
};

/**
 * Obtiene datos para Reporte Final
 * GET /api/documents/final-report/{sample_id}
 * 
 * @param {number} sampleId - ID de la muestra
 * @returns {Promise<Object>} Datos del reporte final
 */
export const getFinalReport = async (sampleId) => {
    try {
        const response = await fetch(`${API_URL}/api/documents/final-report/${sampleId}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getFinalReport:', error);
        throw error;
    }
};

/**
 * Obtiene resumen de estado de una muestra
 * GET /api/documents/status-summary/{sample_id}
 * 
 * @param {number} sampleId - ID de la muestra
 * @returns {Promise<Object>} Resumen de estado y trazabilidad
 */
export const getStatusSummary = async (sampleId) => {
    try {
        const response = await fetch(`${API_URL}/api/documents/status-summary/${sampleId}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getStatusSummary:', error);
        throw error;
    }
};

/**
 * Descarga PDF del Reporte Final
 * GET /api/documents/final-report-pdf/{sample_id}
 * 
 * Este endpoint descarga directamente un PDF en el navegador
 * 
 * @param {number} sampleId - ID de la muestra
 * @param {string} sampleCode - Código de la muestra (opcional, para nombre de archivo)
 * @returns {Promise<void>} Descarga el archivo PDF
 */
export const downloadFinalReportPDF = async (sampleId, sampleCode = null) => {
    try {
        const response = await fetch(`${API_URL}/api/documents/final-report-pdf/${sampleId}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = sampleCode ? `reporte_final_${sampleCode}.pdf` : `reporte_final_${sampleId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al descargar PDF:', error);
        throw error;
    }
};

/**
 * Descarga PDF de Cadena de Custodia
 * GET /api/documents/chain-of-custody-pdf/{sample_id}
 * 
 * Este endpoint descarga directamente un PDF en el navegador
 * 
 * @param {number} sampleId - ID de la muestra
 * @param {string} sampleCode - Código de la muestra (opcional, para nombre de archivo)
 * @returns {Promise<void>} Descarga el archivo PDF
 */
export const downloadChainOfCustodyPDF = async (sampleId, sampleCode = null) => {
    try {
        const response = await fetch(`${API_URL}/api/documents/chain-of-custody-pdf/${sampleId}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = sampleCode ? `cadena_custodia_${sampleCode}.pdf` : `cadena_custodia_${sampleId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al descargar PDF:', error);
        throw error;
    }
};


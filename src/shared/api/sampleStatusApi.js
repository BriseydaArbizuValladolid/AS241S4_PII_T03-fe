/**
 * API para gestión de estados de muestra
 * Backend: Flask + Oracle Database
 * Endpoints: /api/sample-status
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Obtiene todos los estados de muestra
 * GET /api/sample-status
 */
export const getSampleStatuses = async () => {
    try {
        const response = await fetch(`${API_URL}/api/sample-status`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        return data.success ? data.data : data;
    } catch (error) {
        console.error('Error en getSampleStatuses:', error);
        throw error;
    }
};

/**
 * Obtiene un estado por ID
 * GET /api/sample-status/{id}
 */
export const getSampleStatusById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/sample-status/${id}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        return data.success ? data.data : data;
    } catch (error) {
        console.error('Error en getSampleStatusById:', error);
        throw error;
    }
};

/**
 * Obtiene solo estados activos
 * GET /api/sample-status/active
 */
export const getActiveSampleStatuses = async () => {
    try {
        const response = await fetch(`${API_URL}/api/sample-status/active`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        return data.success ? data.data : data;
    } catch (error) {
        console.error('Error en getActiveSampleStatuses:', error);
        throw error;
    }
};


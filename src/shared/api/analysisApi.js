/**
 * API para gestión de resultados de análisis
 * Backend: Flask + Oracle Database
 * Endpoints: /api/analysis-results, /api/analysis-parameters
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Obtiene todos los resultados de análisis
 * GET /api/analysis-results?include_deleted={include_deleted}
 * 
 * @param {boolean} includeDeleted - Si incluir resultados eliminados (default: false)
 * @returns {Promise<Array>} Lista de resultados
 */
export const getAnalysisResults = async (includeDeleted = false) => {
    try {
        const url = `${API_URL}/api/analysis-results${includeDeleted ? '?include_deleted=true' : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        return data.success ? data.data : data;
    } catch (error) {
        console.error('Error en getAnalysisResults:', error);
        throw error;
    }
};

/**
 * Obtiene un resultado por ID
 * GET /api/analysis-results/{id}
 */
export const getAnalysisResultById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/analysis-results/${id}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        return data.success ? data.data : data;
    } catch (error) {
        console.error('Error en getAnalysisResultById:', error);
        throw error;
    }
};

/**
 * Obtiene resultados de una muestra específica
 * GET /api/analysis-results/sample/{sample_id}?include_deleted={include_deleted}
 * 
 * NOTA: Este endpoint retorna un array directo (sin wrapper) con los siguientes campos:
 * - analysis_result_id
 * - sample_id
 * - analysis_parameter_id
 * - result_value
 * - analysis_date
 * - comments (opcional)
 * - analyst_id (opcional)
 * - created_date
 * - updated_date
 * - parameter_name (incluido desde JOIN con analysis_parameter)
 * - unit (incluido desde JOIN con analysis_parameter)
 * - is_deleted (0 o 1)
 * - deleted_at (null o fecha)
 * - deletion_comments (null o razón)
 * 
 * @param {string|number} sampleId - ID de la muestra
 * @param {boolean} includeDeleted - Si incluir resultados eliminados (default: false)
 * @returns {Promise<Array>} Lista de resultados de la muestra
 */
export const getAnalysisResultsBySample = async (sampleId, includeDeleted = false) => {
    try {
        const url = `${API_URL}/api/analysis-results/sample/${sampleId}${includeDeleted ? '?include_deleted=true' : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        
        // El backend retorna un array directo (sin wrapper)
        // Si viene con wrapper, extraer data; si no, usar directamente
        if (Array.isArray(data)) {
            return data;
        } else if (data.success && Array.isArray(data.data)) {
            return data.data;
        } else {
            // Si no es array, retornar array vacío
            console.warn('⚠️ Respuesta inesperada del endpoint:', data);
            return [];
        }
    } catch (error) {
        console.error('Error en getAnalysisResultsBySample:', error);
        throw error;
    }
};

/**
 * Crea un nuevo resultado de análisis
 * POST /api/analysis-results
 */
export const createAnalysisResult = async (resultData) => {
    try {
        const response = await fetch(`${API_URL}/api/analysis-results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en createAnalysisResult:', error);
        throw error;
    }
};

/**
 * Actualiza un resultado
 * PUT /api/analysis-results/{id}
 */
export const updateAnalysisResult = async (id, resultData) => {
    try {
        console.log('📤 PUT a:', `${API_URL}/api/analysis-results/${id}`);
        console.log('📤 Payload:', JSON.stringify(resultData, null, 2));
        
        const response = await fetch(`${API_URL}/api/analysis-results/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData),
        });
        
        console.log('📥 Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.error || errorData.message || `Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Resultado actualizado:', result);
        return result;
    } catch (error) {
        console.error('❌ Error en updateAnalysisResult:', error);
        throw error;
    }
};

/**
 * Elimina un resultado (eliminación lógica)
 * PATCH /api/analysis-results/{id}
 * 
 * @param {string|number} id - ID del resultado
 * @param {string} comments - Razón de la eliminación (opcional)
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteAnalysisResult = async (id, comments = '') => {
    try {
        const url = `${API_URL}/api/analysis-results/${id}`;
        console.log('📤 PATCH (eliminar) a:', url);
        
        const payload = comments ? { comments } : {};
        console.log('📤 Payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        
        console.log('📥 Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.error || errorData.message || `Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Resultado eliminado lógicamente:', result);
        return result.success ? result.data : result;
    } catch (error) {
        console.error('❌ Error en deleteAnalysisResult:', error);
        throw error;
    }
};

/**
 * Restaura un resultado eliminado lógicamente
 * PATCH /api/analysis-results/restaurar/{id}
 * 
 * @param {string|number} id - ID del resultado
 * @returns {Promise<Object>} Resultado restaurado
 */
export const restoreAnalysisResult = async (id) => {
    try {
        const url = `${API_URL}/api/analysis-results/restaurar/${id}`;
        console.log('📤 PATCH (restaurar) a:', url);
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        
        console.log('📥 Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.error || errorData.message || `Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Resultado restaurado:', result);
        return result.success ? result.data : result;
    } catch (error) {
        console.error('❌ Error en restoreAnalysisResult:', error);
        throw error;
    }
};

/**
 * Obtiene todos los parámetros de análisis
 * GET /api/analysis-parameters
 */
export const getAnalysisParameters = async () => {
    try {
        const response = await fetch(`${API_URL}/api/analysis-parameters`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        return data.success ? data.data : data;
    } catch (error) {
        console.error('Error en getAnalysisParameters:', error);
        throw error;
    }
};

/**
 * Obtiene un parámetro por ID
 * GET /api/analysis-parameters/{id}
 */
export const getAnalysisParameterById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/analysis-parameters/${id}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        return data.success ? data.data : data;
    } catch (error) {
        console.error('Error en getAnalysisParameterById:', error);
        throw error;
    }
};

/**
 * Crea un nuevo parámetro
 * POST /api/analysis-parameters
 */
export const createAnalysisParameter = async (parameterData) => {
    try {
        const response = await fetch(`${API_URL}/api/analysis-parameters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parameterData),
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en createAnalysisParameter:', error);
        throw error;
    }
};

/**
 * Actualiza un parámetro
 * PUT /api/analysis-parameters/{id}
 */
export const updateAnalysisParameter = async (id, parameterData) => {
    try {
        const response = await fetch(`${API_URL}/api/analysis-parameters/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parameterData),
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en updateAnalysisParameter:', error);
        throw error;
    }
};

/**
 * Elimina un parámetro
 * DELETE /api/analysis-parameters/{id}
 */
export const deleteAnalysisParameter = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/analysis-parameters/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en deleteAnalysisParameter:', error);
        throw error;
    }
};


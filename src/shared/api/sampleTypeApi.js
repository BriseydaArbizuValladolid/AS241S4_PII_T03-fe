/**
 * API para gestión de tipos de muestra (sample types)
 * Integración con backend Flask en Python + Oracle Database
 * 
 * Configuración:
 * - URL base configurable en .env como VITE_API_URL
 * - Por defecto: http://localhost:5000
 * 
 * Backend: Flask + Oracle Autonomous Database
 * Endpoints: /api/sample-types
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Obtiene todos los tipos de muestra
 * GET /api/sample-types
 * 
 * @returns {Promise<Array>} Lista de tipos de muestra
 */
export const getSampleTypes = async () => {
    try {
        const response = await fetch(`${API_URL}/api/sample-types`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error en getSampleTypes:', error);
        throw error;
    }
};

/**
 * Obtiene un tipo de muestra por ID
 * GET /api/sample-types/{id}
 * 
 * @param {string|number} id - ID del tipo de muestra
 * @returns {Promise<Object>} Datos del tipo de muestra
 */
export const getSampleTypeById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/sample-types/${id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error en getSampleTypeById:', error);
        throw error;
    }
};

/**
 * Crea un nuevo tipo de muestra
 * POST /api/sample-types
 * 
 * @param {Object} sampleTypeData - Datos del tipo de muestra
 * @param {string} sampleTypeData.type_name - Nombre del tipo
 * @param {string} [sampleTypeData.description] - Descripción
 * @returns {Promise<Object>} Tipo de muestra creado
 */
export const createSampleType = async (sampleTypeData) => {
    try {
        console.log('📤 POST a:', `${API_URL}/api/sample-types`);
        console.log('📤 Payload:', JSON.stringify(sampleTypeData, null, 2));
        const response = await fetch(`${API_URL}/api/sample-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sampleTypeData),
        });
        console.log('📥 Status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const result = await response.json();
        console.log('✅ Tipo de muestra creado:', result);
        return result.data || result;
    } catch (error) {
        console.error('❌ Error en createSampleType:', error);
        throw error;
    }
};

/**
 * Actualiza un tipo de muestra
 * PUT /api/sample-types/{id}
 * 
 * @param {string|number} id - ID del tipo de muestra
 * @param {Object} sampleTypeData - Datos a actualizar
 * @returns {Promise<Object>} Tipo de muestra actualizado
 */
export const updateSampleType = async (id, sampleTypeData) => {
    try {
        console.log('📤 PUT a:', `${API_URL}/api/sample-types/${id}`);
        console.log('📤 Payload:', JSON.stringify(sampleTypeData, null, 2));
        const response = await fetch(`${API_URL}/api/sample-types/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sampleTypeData),
        });
        console.log('📥 Status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const result = await response.json();
        console.log('✅ Tipo de muestra actualizado:', result);
        return result.data || result;
    } catch (error) {
        console.error('❌ Error en updateSampleType:', error);
        throw error;
    }
};

/**
 * Elimina un tipo de muestra
 * DELETE /api/sample-types/{id}
 * 
 * @param {string|number} id - ID del tipo de muestra
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteSampleType = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/sample-types/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en deleteSampleType:', error);
        throw error;
    }
};


/**
 * API para gestión de analistas (analysts)
 * Integración con backend Flask en Python + Oracle Database
 * 
 * Configuración:
 * - URL base configurable en .env como VITE_API_URL
 * - Por defecto: http://localhost:5000
 * 
 * Backend: Flask + Oracle Autonomous Database
 * Endpoints: /api/analysts
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Obtiene todos los analistas
 * GET /api/analysts
 * 
 * @returns {Promise<Array>} Lista de analistas
 */
export const getAnalysts = async () => {
    try {
        const response = await fetch(`${API_URL}/api/analysts`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error en getAnalysts:', error);
        throw error;
    }
};

/**
 * Obtiene un analista por ID
 * GET /api/analysts/{id}
 * 
 * @param {string|number} id - ID del analista
 * @returns {Promise<Object>} Datos del analista
 */
export const getAnalystById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/analysts/${id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error en getAnalystById:', error);
        throw error;
    }
};

/**
 * Crea un nuevo analista
 * POST /api/analysts
 * 
 * @param {Object} analystData - Datos del analista
 * @param {string} analystData.name - Nombre
 * @param {string} analystData.surname - Apellido
 * @param {string} analystData.specialty - Especialidad
 * @param {string} [analystData.state] - Estado ("A" = Activo, "I" = Inactivo)
 * @returns {Promise<Object>} Analista creado
 */
export const createAnalyst = async (analystData) => {
    try {
        console.log('📤 POST a:', `${API_URL}/api/analysts`);
        console.log('📤 Payload:', JSON.stringify(analystData, null, 2));
        const response = await fetch(`${API_URL}/api/analysts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analystData),
        });
        console.log('📥 Status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const result = await response.json();
        console.log('✅ Analista creado:', result);
        return result.data || result;
    } catch (error) {
        console.error('❌ Error en createAnalyst:', error);
        throw error;
    }
};

/**
 * Actualiza un analista
 * PUT /api/analysts/{id}
 * 
 * @param {string|number} id - ID del analista
 * @param {Object} analystData - Datos a actualizar
 * @returns {Promise<Object>} Analista actualizado
 */
export const updateAnalyst = async (id, analystData) => {
    try {
        console.log('📤 PUT a:', `${API_URL}/api/analysts/${id}`);
        console.log('📤 Payload:', JSON.stringify(analystData, null, 2));
        const response = await fetch(`${API_URL}/api/analysts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analystData),
        });
        console.log('📥 Status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const result = await response.json();
        console.log('✅ Analista actualizado:', result);
        return result.data || result;
    } catch (error) {
        console.error('❌ Error en updateAnalyst:', error);
        throw error;
    }
};

/**
 * Activa un analista
 * PATCH /api/analysts/{id}/activate
 * 
 * @param {string|number} id - ID del analista
 * @returns {Promise<Object>} Analista activado
 */
export const activateAnalyst = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/analysts/${id}/activate`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en activateAnalyst:', error);
        throw error;
    }
};

/**
 * Desactiva un analista
 * PATCH /api/analysts/{id}/deactivate
 * 
 * @param {string|number} id - ID del analista
 * @returns {Promise<Object>} Analista desactivado
 */
export const deactivateAnalyst = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/analysts/${id}/deactivate`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en deactivateAnalyst:', error);
        throw error;
    }
};


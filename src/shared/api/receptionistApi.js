/**
 * API para gestión de recepcionistas (receptionists)
 * Integración con backend Flask en Python + Oracle Database
 * 
 * Configuración:
 * - URL base configurable en .env como VITE_API_URL
 * - Por defecto: http://localhost:5000
 * 
 * Backend: Flask + Oracle Autonomous Database
 * Endpoints: /api/receptionists
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Obtiene todos los recepcionistas
 * GET /api/receptionists
 * 
 * @returns {Promise<Array>} Lista de recepcionistas
 */
export const getReceptionists = async () => {
    try {
        const response = await fetch(`${API_URL}/api/receptionists`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error en getReceptionists:', error);
        throw error;
    }
};

/**
 * Obtiene un recepcionista por ID
 * GET /api/receptionists/{id}
 * 
 * @param {string|number} id - ID del recepcionista
 * @returns {Promise<Object>} Datos del recepcionista
 */
export const getReceptionistById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/receptionists/${id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error en getReceptionistById:', error);
        throw error;
    }
};

/**
 * Crea un nuevo recepcionista
 * POST /api/receptionists
 * 
 * @param {Object} receptionistData - Datos del recepcionista
 * @param {string} receptionistData.name - Nombre
 * @param {string} receptionistData.surname - Apellido
 * @param {string} receptionistData.email - Email
 * @param {string} [receptionistData.state] - Estado ("A" = Activo, "I" = Inactivo)
 * @returns {Promise<Object>} Recepcionista creado
 */
export const createReceptionist = async (receptionistData) => {
    try {
        console.log('📤 POST a:', `${API_URL}/api/receptionists`);
        console.log('📤 Payload:', JSON.stringify(receptionistData, null, 2));
        const response = await fetch(`${API_URL}/api/receptionists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(receptionistData),
        });
        console.log('📥 Status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const result = await response.json();
        console.log('✅ Recepcionista creado:', result);
        return result.data || result;
    } catch (error) {
        console.error('❌ Error en createReceptionist:', error);
        throw error;
    }
};

/**
 * Actualiza un recepcionista
 * PUT /api/receptionists/{id}
 * 
 * @param {string|number} id - ID del recepcionista
 * @param {Object} receptionistData - Datos a actualizar
 * @returns {Promise<Object>} Recepcionista actualizado
 */
export const updateReceptionist = async (id, receptionistData) => {
    try {
        console.log('📤 PUT a:', `${API_URL}/api/receptionists/${id}`);
        console.log('📤 Payload:', JSON.stringify(receptionistData, null, 2));
        const response = await fetch(`${API_URL}/api/receptionists/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(receptionistData),
        });
        console.log('📥 Status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const result = await response.json();
        console.log('✅ Recepcionista actualizado:', result);
        return result.data || result;
    } catch (error) {
        console.error('❌ Error en updateReceptionist:', error);
        throw error;
    }
};

/**
 * Activa un recepcionista
 * PATCH /api/receptionists/{id}/activate
 * 
 * @param {string|number} id - ID del recepcionista
 * @returns {Promise<Object>} Recepcionista activado
 */
export const activateReceptionist = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/receptionists/${id}/activate`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en activateReceptionist:', error);
        throw error;
    }
};

/**
 * Desactiva un recepcionista
 * PATCH /api/receptionists/{id}/deactivate
 * 
 * @param {string|number} id - ID del recepcionista
 * @returns {Promise<Object>} Recepcionista desactivado
 */
export const deactivateReceptionist = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/receptionists/${id}/deactivate`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en deactivateReceptionist:', error);
        throw error;
    }
};


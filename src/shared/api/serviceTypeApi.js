/**
 * API para gestión de tipos de servicio (service types)
 * Integración con backend Flask en Python + Oracle Database
 * 
 * Configuración:
 * - URL base configurable en .env como VITE_API_URL
 * - Por defecto: http://localhost:5000
 * 
 * Backend: Flask + Oracle Autonomous Database
 * Endpoints: /api/service-types
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Obtiene todos los tipos de servicio
 * GET /api/service-types
 * 
 * @returns {Promise<Array>} Lista de tipos de servicio
 */
export const getServiceTypes = async () => {
    try {
        const response = await fetch(`${API_URL}/api/service-types`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error en getServiceTypes:', error);
        throw error;
    }
};

/**
 * Obtiene un tipo de servicio por ID
 * GET /api/service-types/{id}
 * 
 * @param {string|number} id - ID del tipo de servicio
 * @returns {Promise<Object>} Datos del tipo de servicio
 */
export const getServiceTypeById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/service-types/${id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error en getServiceTypeById:', error);
        throw error;
    }
};

/**
 * Crea un nuevo tipo de servicio
 * POST /api/service-types
 * 
 * @param {Object} serviceTypeData - Datos del tipo de servicio
 * @param {string} serviceTypeData.service_name - Nombre del servicio
 * @param {string} [serviceTypeData.description] - Descripción
 * @param {number} [serviceTypeData.unit_price] - Precio unitario
 * @param {number} [serviceTypeData.estimated_duration_d] - Duración estimada en días
 * @param {string} [serviceTypeData.state] - Estado ("A" = Activo, "I" = Inactivo)
 * @returns {Promise<Object>} Tipo de servicio creado
 */
export const createServiceType = async (serviceTypeData) => {
    try {
        console.log('📤 POST a:', `${API_URL}/api/service-types`);
        console.log('📤 Payload:', JSON.stringify(serviceTypeData, null, 2));
        const response = await fetch(`${API_URL}/api/service-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceTypeData),
        });
        console.log('📥 Status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const result = await response.json();
        console.log('✅ Tipo de servicio creado:', result);
        return result.data || result;
    } catch (error) {
        console.error('❌ Error en createServiceType:', error);
        throw error;
    }
};

/**
 * Actualiza un tipo de servicio
 * PUT /api/service-types/{id}
 * 
 * @param {string|number} id - ID del tipo de servicio
 * @param {Object} serviceTypeData - Datos a actualizar
 * @returns {Promise<Object>} Tipo de servicio actualizado
 */
export const updateServiceType = async (id, serviceTypeData) => {
    try {
        console.log('📤 PUT a:', `${API_URL}/api/service-types/${id}`);
        console.log('📤 Payload:', JSON.stringify(serviceTypeData, null, 2));
        const response = await fetch(`${API_URL}/api/service-types/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceTypeData),
        });
        console.log('📥 Status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const result = await response.json();
        console.log('✅ Tipo de servicio actualizado:', result);
        return result.data || result;
    } catch (error) {
        console.error('❌ Error en updateServiceType:', error);
        throw error;
    }
};

/**
 * Activa un tipo de servicio
 * PATCH /api/service-types/{id}/activate
 * 
 * @param {string|number} id - ID del tipo de servicio
 * @returns {Promise<Object>} Tipo de servicio activado
 */
export const activateServiceType = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/service-types/${id}/activate`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en activateServiceType:', error);
        throw error;
    }
};

/**
 * Desactiva un tipo de servicio
 * PATCH /api/service-types/{id}/deactivate
 * 
 * @param {string|number} id - ID del tipo de servicio
 * @returns {Promise<Object>} Tipo de servicio desactivado
 */
export const deactivateServiceType = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/service-types/${id}/deactivate`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en deactivateServiceType:', error);
        throw error;
    }
};


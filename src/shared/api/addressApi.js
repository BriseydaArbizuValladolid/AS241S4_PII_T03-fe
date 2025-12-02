/**
 * API para gestión de direcciones (addresses)
 * Integración con backend Flask en Python + Oracle Database
 * 
 * Configuración:
 * - URL base configurable en .env como VITE_API_URL
 * - Por defecto: http://localhost:5000
 * 
 * Backend: Flask + Oracle Autonomous Database
 * Endpoints: /api/addresses
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Obtiene todas las direcciones
 * GET /api/addresses
 * 
 * @returns {Promise<Array>} Lista de direcciones
 */
export const getAddresses = async () => {
    try {
        const response = await fetch(`${API_URL}/api/addresses`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error en getAddresses:', error);
        throw error;
    }
};

/**
 * Obtiene una dirección por ID
 * GET /api/addresses/{id}
 * 
 * @param {string|number} id - ID de la dirección
 * @returns {Promise<Object>} Datos de la dirección
 */
export const getAddressById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/addresses/${id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error en getAddressById:', error);
        throw error;
    }
};

/**
 * Crea una nueva dirección
 * POST /api/addresses
 * 
 * @param {Object} addressData - Datos de la dirección
 * @param {string} addressData.department - Departamento
 * @param {string} [addressData.province] - Provincia
 * @param {string} [addressData.district] - Distrito
 * @param {string} [addressData.street] - Calle
 * @param {string} [addressData.reference] - Referencia
 * @param {string} [addressData.zip_code] - Código postal
 * @param {string} [addressData.country] - País (por defecto "Peru")
 * @returns {Promise<Object>} Dirección creada
 */
export const createAddress = async (addressData) => {
    try {
        console.log('📤 POST a:', `${API_URL}/api/addresses`);
        console.log('📤 Payload:', JSON.stringify(addressData, null, 2));
        const response = await fetch(`${API_URL}/api/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addressData),
        });
        console.log('📥 Status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const result = await response.json();
        console.log('✅ Dirección creada:', result);
        return result.data || result;
    } catch (error) {
        console.error('❌ Error en createAddress:', error);
        throw error;
    }
};

/**
 * Actualiza una dirección
 * PUT /api/addresses/{id}
 * 
 * @param {string|number} id - ID de la dirección
 * @param {Object} addressData - Datos a actualizar
 * @returns {Promise<Object>} Dirección actualizada
 */
export const updateAddress = async (id, addressData) => {
    try {
        console.log('📤 PUT a:', `${API_URL}/api/addresses/${id}`);
        console.log('📤 Payload:', JSON.stringify(addressData, null, 2));
        const response = await fetch(`${API_URL}/api/addresses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addressData),
        });
        console.log('📥 Status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        const result = await response.json();
        console.log('✅ Dirección actualizada:', result);
        return result.data || result;
    } catch (error) {
        console.error('❌ Error en updateAddress:', error);
        throw error;
    }
};

/**
 * Elimina una dirección
 * DELETE /api/addresses/{id}
 * 
 * @param {string|number} id - ID de la dirección
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteAddress = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/addresses/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en deleteAddress:', error);
        throw error;
    }
};


/**
 * API para gestión de clientes (customers)
 * Integración con backend Flask en Python + Oracle Database
 * 
 * Configuración:
 * - URL base configurable en .env como VITE_API_URL
 * - Por defecto: http://localhost:5000
 * 
 * Backend: Flask + Oracle Autonomous Database
 * Endpoints: /api/customers
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://urban-train-r4r5jw67vrvw35pp4-5000.app.github.dev';

/**
 * Obtiene todos los clientes
 * GET /api/customers
 * 
 * @returns {Promise<Array>} Lista de clientes
 */
export const getClients = async () => {
    try {
        const response = await fetch(`${API_URL}/api/customers`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en getClients:', error);
        throw error;
    }
};

/**
 * Obtiene un cliente por ID
 * GET /api/customers/{id}
 * 
 * @param {string|number} id - ID del cliente
 * @returns {Promise<Object>} Datos del cliente
 */
export const getClientById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/customers/${id}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en getClientById:', error);
        throw error;
    }
};

/**
 * Crea un nuevo cliente
 * POST /api/customers
 * 
 * @param {Object} clientData - Datos del cliente con estructura:
 *   - name (string): Nombre
 *   - surname (string): Apellidos
 *   - email (string): Correo
 *   - phone_number (string): Teléfono
 *   - address_id (int, opcional): ID de dirección
 *   - state (string, opcional): 'A' (Activo) por defecto
 * @returns {Promise<Object>} Cliente creado
 */
export const createClient = async (clientData) => {
    try {
        const response = await fetch(`${API_URL}/api/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en createClient:', error);
        throw error;
    }
};

/**
 * Actualiza un cliente existente
 * PUT /api/customers/{id}
 * 
 * @param {string|number} id - ID del cliente
 * @param {Object} clientData - Nuevos datos del cliente
 * @returns {Promise<Object>} Cliente actualizado
 */
export const updateClient = async (id, clientData) => {
    try {
        console.log('🔵 PUT a:', `${API_URL}/api/customers/${id}`);
        console.log('🔵 Datos a enviar:', JSON.stringify(clientData, null, 2));
        
        const response = await fetch(`${API_URL}/api/customers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData),
        });
        
        console.log('🔵 Respuesta status:', response.status);
        
        if (!response.ok) {
            let errorMessage = `Error HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                console.error('🔴 Error del backend:', errorData);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                const text = await response.text();
                console.error('🔴 Error texto:', text);
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        return data;
    } catch (error) {
        console.error('Error en updateClient:', error);
        throw error;
    }
};

/**
 * Elimina un cliente (eliminación lógica)
 * PATCH /api/customers/eliminar/{id}
 * 
 * @param {string|number} id - ID del cliente
 * @returns {Promise<Object>} Cliente con state='I'
 */
export const deleteClient = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/customers/eliminar/${id}`, {
            method: 'PATCH',
        });
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en deleteClient:', error);
        throw error;
    }
};

/**
 * Restaura un cliente eliminado (cambia estado a 'A')
 * PATCH /api/customers/restaurar/{id}
 * 
 * @param {string|number} id - ID del cliente
 * @returns {Promise<Object>} Cliente con state='A'
 */
export const restoreClient = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/customers/restaurar/${id}`, {
            method: 'PATCH',
        });
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en restoreClient:', error);
        throw error;
    }
};

/**
 * Obtiene clientes por estado
 * GET /api/customers/estado/{estado}
 * 
 * @param {string} estado - 'A' (Activo) o 'I' (Inactivo)
 * @returns {Promise<Array>} Lista de clientes
 */
export const getClientsByStatus = async (estado) => {
    try {
        const response = await fetch(`${API_URL}/api/customers/estado/${estado}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en getClientsByStatus:', error);
        throw error;
    }
};


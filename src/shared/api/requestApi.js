/**
 * API para gestión de solicitudes de servicio
 * Backend: Flask + Oracle Database
 * Endpoints: /api/requests
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getRequests = async () => {
    try {
        const response = await fetch(`${API_URL}/api/requests`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getRequests:', error);
        throw error;
    }
};

export const getRequestById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/requests/${id}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getRequestById:', error);
        throw error;
    }
};

export const getRequestsByCustomer = async (customerId) => {
    try {
        const response = await fetch(`${API_URL}/api/requests/customer/${customerId}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getRequestsByCustomer:', error);
        throw error;
    }
};

export const createRequest = async (requestData) => {
    try {
        console.log('📤 POST a:', `${API_URL}/api/requests`);
        console.log('📤 Payload:', JSON.stringify(requestData, null, 2));
        
        const response = await fetch(`${API_URL}/api/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
        });
        
        console.log('📥 Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Solicitud creada:', result);
        return result;
    } catch (error) {
        console.error('❌ Error en createRequest:', error);
        throw error;
    }
};

export const updateRequest = async (id, requestData) => {
    try {
        const response = await fetch(`${API_URL}/api/requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en updateRequest:', error);
        throw error;
    }
};

export const deleteRequest = async (id, reason) => {
    try {
        // El backend espera solo "reason" (no "status")
        const response = await fetch(`${API_URL}/api/requests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                reason: reason || 'Cancelada por el usuario'
            }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.error || errorData.message || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en deleteRequest:', error);
        throw error;
    }
};


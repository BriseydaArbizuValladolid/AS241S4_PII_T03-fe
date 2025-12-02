/**
 * API para gestión de muestras
 * Backend: Flask + Oracle Database
 * Endpoints: /api/samples
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getSamples = async () => {
    try {
        const response = await fetch(`${API_URL}/api/samples`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getSamples:', error);
        throw error;
    }
};

export const getSampleById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/samples/${id}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getSampleById:', error);
        throw error;
    }
};

export const getSampleByCode = async (code) => {
    try {
        const response = await fetch(`${API_URL}/api/samples/code/${code}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getSampleByCode:', error);
        throw error;
    }
};

export const getSamplesByRequest = async (requestId) => {
    try {
        const response = await fetch(`${API_URL}/api/samples/request/${requestId}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getSamplesByRequest:', error);
        throw error;
    }
};

export const createSample = async (sampleData) => {
    try {
        console.log('📤 POST a:', `${API_URL}/api/samples`);
        console.log('📤 Payload:', JSON.stringify(sampleData, null, 2));
        
        const response = await fetch(`${API_URL}/api/samples`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sampleData),
        });
        
        console.log('📥 Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.error || errorData.message || `Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Muestra creada:', result);
        return result;
    } catch (error) {
        console.error('❌ Error en createSample:', error);
        throw error;
    }
};

export const updateSample = async (id, sampleData) => {
    try {
        console.log('📤 PUT a:', `${API_URL}/api/samples/${id}`);
        console.log('📤 Payload:', JSON.stringify(sampleData, null, 2));
        
        const response = await fetch(`${API_URL}/api/samples/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sampleData),
        });
        
        console.log('📥 Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            console.error('🔴 Error del backend:', errorData);
            throw new Error(errorData.error || errorData.message || `Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Muestra actualizada:', result);
        return result;
    } catch (error) {
        console.error('❌ Error en updateSample:', error);
        throw error;
    }
};

export const deleteSample = async (id, comments) => {
    try {
        const url = `${API_URL}/api/samples/${id}`;
        console.log('📤 PATCH (eliminar) a:', url);
        
        // El campo comments es opcional según el backend
        const payload = comments ? { comments } : {};
        console.log('📤 Payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        
        console.log('📥 Status:', response.status);
        
        // Verificar si la respuesta es JSON válido
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            console.error('🔴 Error al parsear JSON:', jsonError);
            throw new Error(`Error al procesar la respuesta del servidor: ${response.status} ${response.statusText}`);
        }
        
        if (!response.ok) {
            console.error('🔴 Error del backend:', result);
            throw new Error(result.error || result.message || `Error HTTP: ${response.status}`);
        }
        
        // El backend retorna: { success: true, message: "...", data: {...} }
        if (result.success) {
            console.log('✅ Muestra eliminada:', result.data);
            // Verificar que current_status_id cambió a 12 (ARCHIVADA)
            if (result.data && result.data.current_status_id === 12) {
                console.log('✅ Estado actualizado a ARCHIVADA (12)');
            }
            return result.data;
        } else {
            throw new Error(result.error || result.message || 'Error desconocido');
        }
    } catch (error) {
        // Manejar errores de conexión
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('NetworkError')) {
            console.error('❌ Error de conexión:', error);
            throw new Error('No se puede conectar al servidor. Verifique que el backend esté corriendo en ' + API_URL);
        }
        console.error('❌ Error en deleteSample:', error);
        throw error;
    }
};

export const restoreSample = async (id) => {
    try {
        const url = `${API_URL}/api/samples/restaurar/${id}`;
        console.log('📤 PATCH (restaurar) a:', url);
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        
        console.log('📥 Status:', response.status);
        
        // Verificar si la respuesta es JSON válido
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            console.error('🔴 Error al parsear JSON:', jsonError);
            throw new Error(`Error al procesar la respuesta del servidor: ${response.status} ${response.statusText}`);
        }
        
        // El backend retorna: { success: true, message: "...", data: {...} }
        if (response.ok && result.success) {
            console.log('✅ Muestra restaurada:', result.data);
            // Verificar que current_status_id cambió a 1 (REGISTRADA)
            if (result.data && result.data.current_status_id === 1) {
                console.log('✅ Estado actualizado a REGISTRADA (1)');
            }
            return result.data;
        } else {
            // Manejar diferentes tipos de errores
            let errorMessage = result.error || result.message || 'Error desconocido';
            
            if (response.status === 404) {
                errorMessage = 'Muestra no encontrada';
            } else if (response.status === 400) {
                errorMessage = result.error || 'La muestra no está archivada. Solo se pueden restaurar muestras archivadas.';
            } else if (response.status === 500) {
                errorMessage = result.error || 'Error interno del servidor';
            }
            
            console.error('🔴 Error del backend:', result);
            throw new Error(errorMessage);
        }
    } catch (error) {
        // Manejar errores de conexión
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('NetworkError')) {
            console.error('❌ Error de conexión:', error);
            throw new Error('No se puede conectar al servidor. Verifique que el backend esté corriendo en ' + API_URL);
        }
        console.error('❌ Error en restoreSample:', error);
        throw error;
    }
};

/**
 * Marca una muestra como analizada
 * Cambia el estado de la muestra a ANALIZADA (4)
 * 
 * @param {number} id - ID de la muestra
 * @param {string} comments - Comentarios opcionales sobre el análisis
 * @returns {Promise<Object>} Datos de la muestra actualizada
 */
export const markSampleAsAnalyzed = async (id, comments = '') => {
    try {
        const url = `${API_URL}/api/samples/${id}`;
        console.log('📤 PUT (marcar como analizada) a:', url);
        
        // Actualizar el estado a ANALIZADA (4)
        const payload = {
            current_status_id: 4
        };
        
        // Agregar comentarios si se proporcionan
        if (comments && comments.trim() !== '') {
            payload.comments = comments.trim();
        }
        
        console.log('📤 Payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(url, {
            method: 'PUT',
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
        console.log('✅ Muestra marcada como analizada:', result);
        
        // Verificar que current_status_id cambió a 4 (ANALIZADA)
        if (result.data && result.data.current_status_id === 4) {
            console.log('✅ Estado actualizado a ANALIZADA (4)');
        }
        
        return result.data || result;
    } catch (error) {
        // Manejar errores de conexión
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('NetworkError')) {
            console.error('❌ Error de conexión:', error);
            throw new Error('No se puede conectar al servidor. Verifique que el backend esté corriendo en ' + API_URL);
        }
        console.error('❌ Error en markSampleAsAnalyzed:', error);
        throw error;
    }
};


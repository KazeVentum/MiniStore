import { getBackendUrl } from './config';

/**
 * Servicio para realizar peticiones al backend local (Node.js/Express)
 * utilizando la URL configurada dinámicamente por el usuario.
 */
export const localApi = {
    async get(endpoint) {
        const baseUrl = await getBackendUrl();
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    },

    async post(endpoint, data) {
        const baseUrl = await getBackendUrl();
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    },

    // Función para testear la conexión con el backend local
    async testConnection() {
        try {
            const baseUrl = await getBackendUrl();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout

            const response = await fetch(`${baseUrl}/common/health`, { 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            
            return response.ok;
        } catch (error) {
            console.warn('Local backend not reachable:', error.message);
            return false;
        }
    }
};

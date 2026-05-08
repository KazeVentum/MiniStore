import axios from 'axios';

// [Req 7 - Peticiones] Configuración base de Axios — URL del backend leída desde variable de entorno
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export default api;

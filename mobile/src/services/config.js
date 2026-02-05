import * as SecureStore from 'expo-secure-store';

const DEFAULT_IP = '192.168.1.90';
const DEFAULT_URL = `http://${DEFAULT_IP}:3000/api`;

const CONFIG = {
  development: {
    supabaseUrl: 'https://tgtfnxjsijioirdqwlwo.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndGZueGpzaWppb2lyZHF3bHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjYzMDEsImV4cCI6MjA4NTY0MjMwMX0.6oRZ0G6ckRbLnkpadKTj8ZjDB79XXPmF9VsTPaMBF_o',
    localBackendUrl: DEFAULT_URL,
    syncInterval: 30000,
    notificationHour: 9,
  },
  production: {
    supabaseUrl: 'https://tgtfnxjsijioirdqwlwo.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndGZueGpzaWppb2lyZHF3bHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjYzMDEsImV4cCI6MjA4NTY0MjMwMX0.6oRZ0G6ckRbLnkpadKTj8ZjDB79XXPmF9VsTPaMBF_o',
    localBackendUrl: DEFAULT_URL,
    syncInterval: 30000,
    notificationHour: 9,
  },
};

// Función para obtener la URL guardada o la por defecto
export const getBackendUrl = async () => {
  try {
    const savedUrl = await SecureStore.getItemAsync('custom_backend_url');
    return savedUrl || DEFAULT_URL;
  } catch (error) {
    return DEFAULT_URL;
  }
};

export const saveBackendUrl = async (url) => {
  await SecureStore.setItemAsync('custom_backend_url', url);
};

const getConfig = () => {
  const env = 'development';
  return CONFIG[env];
};

export default getConfig();

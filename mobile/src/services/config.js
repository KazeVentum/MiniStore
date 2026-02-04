const CONFIG = {
  development: {
    supabaseUrl: 'https://tgtfnxjsijioirdqwlwo.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndGZueGpzaWppb2lyZHF3bHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjYzMDEsImV4cCI6MjA4NTY0MjMwMX0.6oRZ0G6ckRbLnkpadKTj8ZjDB79XXPmF9VsTPaMBF_o',
    localBackendUrl: 'http://localhost:3000/api',
    syncInterval: 30000,
    notificationHour: 9,
  },
  production: {
    supabaseUrl: 'https://tgtfnxjsijioirdqwlwo.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndGZueGpzaWppb2lyZHF3bHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjYzMDEsImV4cCI6MjA4NTY0MjMwMX0.6oRZ0G6ckRbLnkpadKTj8ZjDB79XXPmF9VsTPaMBF_o',
    localBackendUrl: 'http://localhost:3000/api',
    syncInterval: 30000,
    notificationHour: 9,
  },
};

const getConfig = () => {
  const env = 'development';
  return CONFIG[env];
};

export default getConfig();

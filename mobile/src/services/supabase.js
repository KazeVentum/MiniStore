import React, { createContext, useContext, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import config from './config';

const SupabaseContext = createContext(null);

const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const SupabaseProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  return (
    <SupabaseContext.Provider value={{ supabase, session, setSession }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
};

export default supabase;

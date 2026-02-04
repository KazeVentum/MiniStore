import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import { SupabaseProvider } from './src/services/supabase';
import { initDatabase } from './src/services/database';

export default function App() {
  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        console.log('App initialized: Database ready');
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };
    setup();
  }, []);

  return (
    <SafeAreaProvider>
      <SupabaseProvider>
        <Navigation />
        <StatusBar style="auto" />
      </SupabaseProvider>
    </SafeAreaProvider>
  );
}

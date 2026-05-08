import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import { SupabaseProvider } from './src/services/supabase';
import { initDatabase } from './src/services/database';
import { startNetworkMonitoring, processAutoSync } from './src/services/network';

export default function App() {
  useEffect(() => {
    let unsubscribeNetwork;
    const setup = async () => {
      try {
        await initDatabase();
        console.log('App initialized: Database ready');

        // Start watching for network changes
        unsubscribeNetwork = startNetworkMonitoring();

        // Immediate sync attempt if online
        processAutoSync();
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };
    setup();

    return () => {
      if (unsubscribeNetwork) unsubscribeNetwork();
    };
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

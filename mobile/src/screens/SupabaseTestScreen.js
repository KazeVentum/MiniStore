import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import supabase from '../services/supabase';

const SupabaseTestScreen = () => {
  const [status, setStatus] = useState('Connecting...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const testSupabaseConnection = async () => {
    try {
      setStatus('Testing connection...');
      setError(null);

      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('id_producto, nombre_producto, precio')
        .limit(3);

      if (productosError) {
        throw productosError;
      }

      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id_cliente, nombre_cliente')
        .limit(3);

      if (clientesError) {
        throw clientesError;
      }

      setStatus('Connected! ✅');
      setData({
        productos: productosData,
        clientes: clientesData,
      });
    } catch (err) {
      console.error('Supabase connection error:', err);
      setStatus('Connection Failed ❌');
      setError(err.message || JSON.stringify(err));
      setData(null);
    }
  };

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  // Determine dynamic color for status text
  const statusColor = status === 'Connected! ✅' ? '#155724' : '#721c24';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>

      <View style={[styles.statusCard, status.includes('Connected') ? styles.success : styles.error]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
      </View>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={testSupabaseConnection}
      >
        <Text style={styles.retryText}>Retry Test</Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Error Details:</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      )}

      {data && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Productos (Sample):</Text>
            {data.productos?.map((prod) => (
              <Text key={prod.id_producto} style={styles.cardText}>
                • {prod.nombre_producto} - ${prod.precio}
              </Text>
            ))}
            {(!data.productos || data.productos.length === 0) && (
              <Text style={styles.cardText}>No products found</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Clientes (Sample):</Text>
            {data.clientes?.map((cliente) => (
              <Text key={cliente.id_cliente} style={styles.cardText}>
                • {cliente.nombre_cliente}
              </Text>
            ))}
            {(!data.clientes || data.clientes.length === 0) && (
              <Text style={styles.cardText}>No clients found</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  statusCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  success: {
    backgroundColor: '#d4edda',
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  error: {
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorCard: {
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  errorTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#856404',
  },
  errorMessage: {
    color: '#856404',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
});

export default SupabaseTestScreen;

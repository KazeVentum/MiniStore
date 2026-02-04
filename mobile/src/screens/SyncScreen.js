import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSupabase } from '../services/supabase';
import { saveProductosBulk, saveClientesBulk, savePedidosBulk, saveCanalesBulk, getProductos, getClientes, getPedidos, getCanales } from '../services/database';
import { performFullSync } from '../services/sync';

const SyncScreen = () => {
    const { supabase } = useSupabase();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        lastSync: 'Nuca',
        localProducts: 0,
        localClients: 0,
        localPedidos: 0,
        localCanales: 0
    });

    const syncData = async () => {
        setLoading(true);
        try {
            // Use the shared sync service
            await performFullSync();

            // Update stats
            const localP = await getProductos();
            const localC = await getClientes();
            const localO = await getPedidos();
            const localCh = await getCanales();

            setStats({
                lastSync: new Date().toLocaleString(),
                localProducts: localP.rows.length,
                localClients: localC.rows.length,
                localPedidos: localO.rows.length,
                localCanales: localCh.rows.length
            });

            Alert.alert('Éxito', 'Sincronización completada correctamente');
        } catch (error) {
            console.error('Sync failed:', error);
            Alert.alert('Error', 'No se pudo sincronizar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = async () => {
        try {
            const localP = await getProductos();
            const localC = await getClientes();
            const localO = await getPedidos();
            const localCh = await getCanales();
            setStats(prev => ({
                ...prev,
                localProducts: localP.rows.length,
                localClients: localC.rows.length,
                localPedidos: localO.rows.length,
                localCanales: localCh.rows.length
            }));
        } catch (error) {
            console.error('Failed to refresh stats:', error);
        }
    };

    React.useEffect(() => {
        refreshStats();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Sincronización</Text>
                <Text style={styles.subtitle}>Sincroniza datos con la nube</Text>
            </View>

            <View style={styles.statsCard}>
                <Text style={styles.cardTitle}>Estado Local</Text>
                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Productos:</Text>
                    <Text style={styles.statValue}>{stats.localProducts}</Text>
                </View>
                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Clientes:</Text>
                    <Text style={styles.statValue}>{stats.localClients}</Text>
                </View>
                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Pedidos:</Text>
                    <Text style={styles.statValue}>{stats.localPedidos}</Text>
                </View>
                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Canales:</Text>
                    <Text style={styles.statValue}>{stats.localCanales}</Text>
                </View>
                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Última Sinc:</Text>
                    <Text style={styles.statValue}>{stats.lastSync}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.syncButton, loading && styles.disabledButton]}
                onPress={syncData}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.syncButtonText}>🔄 Sincronizar Todo</Text>
                    </>
                )}
            </TouchableOpacity>

            <Text style={styles.note}>
                * Esta acción descargará todos los productos y clientes de Supabase y los guardará en tu dispositivo para uso offline.
            </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        marginTop: 5,
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 30,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
        paddingBottom: 10,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statLabel: {
        fontSize: 16,
        color: '#495057',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    syncButton: {
        backgroundColor: '#4dabf7',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    syncButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#a5d8ff',
    },
    note: {
        marginTop: 20,
        fontSize: 12,
        color: '#adb5bd',
        textAlign: 'center',
        fontStyle: 'italic',
    }
});

export default SyncScreen;

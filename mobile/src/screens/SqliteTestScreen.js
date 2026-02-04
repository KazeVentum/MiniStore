import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getProductos, saveProductosBulk, getClientes, initDatabase } from '../services/database';

const SqliteTestScreen = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({
        db: 'Waiting...',
        tables: 'Unknown',
        data: []
    });

    const checkStatus = async () => {
        setLoading(true);
        try {
            const productos = await getProductos();
            const clientes = await getClientes();

            setStatus({
                db: 'Connected',
                tables: 'Created',
                data: `Productos: ${productos.rows.length}, Clientes: ${clientes.rows.length}`
            });
        } catch (error) {
            setStatus({
                db: 'Error',
                tables: 'Failed/Missing',
                data: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const insertTestData = async () => {
        setLoading(true);
        try {
            const dummyProducts = [
                { id_producto: 999, nombre_producto: 'Producto Test', precio: 1500, activo: true },
                { id_producto: 1000, nombre_producto: 'Otro Test', precio: 2500, activo: true }
            ];
            await saveProductosBulk(dummyProducts);
            await checkStatus();
        } catch (error) {
            alert('Error inserting data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetDb = async () => {
        setLoading(true);
        try {
            await initDatabase();
            await checkStatus();
        } catch (error) {
            alert('Error resetting DB: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>SQLite Test</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Database Status</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Connection:</Text>
                    <Text style={[styles.value, status.db === 'Connected' ? styles.success : styles.error]}>
                        {status.db}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Tables:</Text>
                    <Text style={styles.value}>{status.tables}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Stats:</Text>
                    <Text style={styles.value}>{status.data}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={checkStatus}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Refresh Status</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={insertTestData}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Insert Dummy Data</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.dangerButton]}
                    onPress={resetDb}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Re-init Schema</Text>
                </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#444',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    label: {
        fontSize: 16,
        color: '#666',
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    success: {
        color: '#4CAF50',
    },
    error: {
        color: '#F44336',
    },
    actions: {
        gap: 15,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#2196F3',
    },
    secondaryButton: {
        backgroundColor: '#FF9800',
    },
    dangerButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default SqliteTestScreen;

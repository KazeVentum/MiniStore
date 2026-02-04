import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getClientes } from '../services/database';

const ClientesScreen = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadClientes = async () => {
        try {
            const data = await getClientes();
            setClientes(data.rows);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClientes();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.nombre_cliente}</Text>
                <Text style={styles.detail}>📞 {item.telefono || 'Sin teléfono'}</Text>
                <Text style={styles.detail}>📍 {item.direccion || 'Sin dirección'}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={clientes}
                renderItem={renderItem}
                keyExtractor={item => item.id_cliente.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No hay clientes locales.</Text>
                        <Text style={styles.emptySubText}>Sincroniza desde el Dashboard.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        padding: 15,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    detail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    empty: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#999',
    },
    emptySubText: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 8,
    }
});

export default ClientesScreen;

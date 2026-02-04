import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getPedidos } from '../services/database';

const PedidosScreen = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPedidos = async () => {
        try {
            const data = await getPedidos();
            setPedidos(data.rows);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPedidos();
    }, []);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'entregado': return styles.statusEntregado;
            case 'pendiente': return styles.statusPendiente;
            case 'cancelado': return styles.statusCancelado;
            default: return styles.statusDefault;
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.orderId}>Pedido #{item.id_pedido}</Text>
                <View style={[styles.statusBadge, getStatusStyle(item.estado)]}>
                    <Text style={styles.statusText}>{item.estado?.toUpperCase()}</Text>
                </View>
            </View>

            <Text style={styles.clientName}>👤 {item.nombre_cliente || 'Cliente Desconocido'}</Text>

            <View style={styles.footer}>
                <Text style={styles.date}>📅 {new Date(item.fecha_pedido).toLocaleDateString()}</Text>
                <Text style={styles.total}>${item.total?.toLocaleString()}</Text>
            </View>

            {item.sincronizado === 1 && (
                <View style={styles.syncIndicator}>
                    <Text style={styles.syncText}>✓ Sincronizado</Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF9800" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={pedidos}
                renderItem={renderItem}
                keyExtractor={item => item.id_pedido.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No hay pedidos locales.</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    statusPendiente: { backgroundColor: '#FF9800' },
    statusEntregado: { backgroundColor: '#4CAF50' },
    statusCancelado: { backgroundColor: '#F44336' },
    statusDefault: { backgroundColor: '#9E9E9E' },
    clientName: {
        fontSize: 15,
        color: '#444',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    date: {
        fontSize: 13,
        color: '#888',
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    syncIndicator: {
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    syncText: {
        fontSize: 10,
        color: '#4CAF50',
        fontStyle: 'italic',
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

export default PedidosScreen;

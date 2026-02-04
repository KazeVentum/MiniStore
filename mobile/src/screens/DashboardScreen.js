import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { getDashboardStats } from '../services/database';
import { performFullSync } from '../services/sync';
import { addSyncListener } from '../services/network';

const DashboardScreen = ({ navigation }) => {
    const [stats, setStats] = useState({
        totalVentas: 0,
        pedidosTotales: 0,
        pedidosPendientesSync: 0,
        totalClientes: 0,
        totalProductos: 0,
        ventasHoy: 0,
        pedidosHoy: 0,
        pedidosPendientesEstado: 0,
        topProductos: []
    });
    const [isConnected, setIsConnected] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    // Monitor connection
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(!!state.isConnected && !!state.isInternetReachable);
        });
        return () => unsubscribe();
    }, []);

    // Refresh data when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    useEffect(() => {
        const unsubscribe = addSyncListener(() => {
            console.log('Background sync detected, refreshing Dashboard stats...');
            loadStats();
        });
        return unsubscribe;
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (isConnected) {
                console.log('Initiating sync during pull-to-refresh...');
                await performFullSync();
            }
            await loadStats();
        } catch (error) {
            console.error('Refresh/Sync failed:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Text style={styles.iconText}>{icon}</Text>
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statTitle}>{title}</Text>
                <Text
                    style={[styles.statValue, { color: color }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {value}
                </Text>
                {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
            </View>
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 110 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcome}>¡Hola! ✨</Text>
                    <Text style={styles.appName}>Lina</Text>
                </View>
                <View style={[styles.netBadge, { backgroundColor: isConnected ? '#4CAF50' : '#FF5252' }]}>
                    <Text style={styles.netText}>{isConnected ? '● Online' : '● Offline'}</Text>
                </View>
            </View>

            {stats.pedidosPendientesSync > 0 && (
                <View style={[styles.syncAlert, { backgroundColor: '#e3f2fd', borderColor: '#bbdefb' }]}>
                    <Text style={[styles.syncAlertText, { color: '#1976d2' }]}>
                        📥 Tienes {stats.pedidosPendientesSync} pedido(s) pendientes de subir.
                    </Text>
                </View>
            )}

            {stats.pedidosPendientesEstado > 0 && (
                <View style={styles.syncAlert}>
                    <Text style={styles.syncAlertText}>
                        ⏳ Tienes {stats.pedidosPendientesEstado} pedido(s) pendientes por procesar.
                    </Text>
                </View>
            )}

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Resumen de Hoy</Text>
                <View style={styles.grid}>
                    <View style={styles.halfWidth}>
                        <StatCard
                            title="Ventas Hoy"
                            value={`$${stats.ventasHoy.toLocaleString()}`}
                            icon="💰"
                            color="#4CAF50"
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <StatCard
                            title="Pedidos Hoy"
                            value={stats.pedidosHoy}
                            icon="📦"
                            color="#FF9800"
                        />
                    </View>
                </View>
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.grid}>
                    <View style={styles.fullWidth}>
                        <StatCard
                            title="Ventas Totales"
                            value={`$${stats.totalVentas.toLocaleString()}`}
                            icon="📈"
                            color="#2196F3"
                            subtitle={`${stats.pedidosTotales} pedidos registrados`}
                        />
                    </View>

                    <View style={styles.halfWidth}>
                        <StatCard
                            title="Productos"
                            value={stats.totalProductos}
                            icon="💍"
                            color="#9C27B0"
                        />
                    </View>

                    <View style={styles.halfWidth}>
                        <StatCard
                            title="Clientes"
                            value={stats.totalClientes}
                            icon="👤"
                            color="#F44336"
                        />
                    </View>
                </View>
            </View>

            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderLine}>
                    <Text style={styles.sectionTitle}>Top 5 Productos</Text>
                    <Text style={styles.sectionSubtitle}>Más vendidos</Text>
                </View>
                <View style={styles.topProductsCard}>
                    {stats.topProductos.length > 0 ? (
                        stats.topProductos.map((item, index) => (
                            <View key={index} style={styles.topProductRow}>
                                <Text style={styles.topProductRank}>#{index + 1}</Text>
                                <Text style={styles.topProductName} numberOfLines={1}>{item.nombre_producto}</Text>
                                <View style={styles.topProductQtyBadge}>
                                    <Text style={styles.topProductQtyText}>{item.total_vendido} uds</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyTopProducts}>Aún no hay ventas registradas</Text>
                    )}
                </View>
            </View>

            <View style={styles.actions}>
                <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => navigation.navigate('NuevoPedido')}
                >
                    <Text style={styles.primaryActionText}>+ Crear Nuevo Pedido</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 25,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    welcome: {
        fontSize: 14,
        color: '#636e72',
        fontWeight: '500',
    },
    appName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#2d3436',
    },
    netBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    netText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    syncAlert: {
        margin: 20,
        padding: 12,
        backgroundColor: '#fff3cd',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ffeaa7',
    },
    syncAlertText: {
        color: '#856404',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    grid: {
        padding: 15,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    fullWidth: {
        width: '100%',
        padding: 5,
    },
    halfWidth: {
        width: '50%',
        padding: 5,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    iconText: {
        fontSize: 24,
    },
    statContent: {
        flex: 1,
    },
    statTitle: {
        fontSize: 12,
        color: '#636e72',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        marginVertical: 2,
    },
    statSubtitle: {
        fontSize: 10,
        color: '#b2bec3',
    },
    actions: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 15,
    },
    sectionContainer: {
        marginTop: 20,
        paddingHorizontal: 15,
    },
    sectionHeaderLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 15,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#b2bec3',
        fontWeight: '500',
    },
    topProductsCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    topProductRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    topProductRank: {
        fontSize: 14,
        fontWeight: '900',
        color: '#b2bec3',
        width: 30,
    },
    topProductName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3436',
        marginRight: 10,
    },
    topProductQtyBadge: {
        backgroundColor: '#f1f3f5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    topProductQtyText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#636e72',
    },
    emptyTopProducts: {
        textAlign: 'center',
        color: '#b2bec3',
        fontStyle: 'italic',
        paddingVertical: 10,
    },
    primaryAction: {
        backgroundColor: '#2d3436',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    primaryActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default DashboardScreen;

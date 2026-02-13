import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDashboardStats } from '../services/database';
import { performFullSync } from '../services/sync';
import { addSyncListener } from '../services/network';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_WEIGHTS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

const DashboardScreen = ({ navigation }) => {
    const { isTablet, getGridColumns, scaleFont } = useResponsive();
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

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(!!state.isConnected && !!state.isInternetReachable);
        });
        return () => unsubscribe();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    useEffect(() => {
        const unsubscribe = addSyncListener(() => {
            loadStats();
        });
        return unsubscribe;
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (isConnected) {
                await performFullSync();
            }
            await loadStats();
        } catch (error) {
            console.error('Refresh/Sync failed:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const StatCard = ({ title, value, icon, color, subtitle, fullWidth }) => {
        const cols = getGridColumns(1, 2, 2);
        return (
            <View style={[
                styles.statCardWrapper,
                { width: fullWidth ? '100%' : `${100 / getGridColumns(2, 3, 4)}%` }
            ]}>
                <View style={styles.statCard}>
                    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                        <MaterialCommunityIcons name={icon} size={24} color={color} />
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statTitle}>{title}</Text>
                        <Text
                            style={[styles.statValue, { color: COLORS.textPrimary }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {value}
                        </Text>
                        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 110 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcome}>¡Hola! ✨</Text>
                    <Text style={styles.appName}>Lina</Text>
                </View>
                <View style={[styles.netBadge, { backgroundColor: isConnected ? COLORS.success + '20' : COLORS.error + '20' }]}>
                    <View style={[styles.dot, { backgroundColor: isConnected ? COLORS.success : COLORS.error }]} />
                    <Text style={[styles.netText, { color: isConnected ? COLORS.success : COLORS.error }]}>
                        {isConnected ? 'Online' : 'Offline'}
                    </Text>
                </View>
            </View>

            {stats.pedidosPendientesSync > 0 && (
                <View style={styles.syncAlert}>
                    <MaterialCommunityIcons name="cloud-upload" size={18} color={COLORS.info} />
                    <Text style={styles.syncAlertText}>
                        Tienes {stats.pedidosPendientesSync} pedido(s) pendientes de subir.
                    </Text>
                </View>
            )}

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeaderTitle}>Resumen de Hoy</Text>
                <View style={styles.grid}>
                    <StatCard
                        title="Ventas Hoy"
                        value={`$${stats.ventasHoy.toLocaleString()}`}
                        icon="cash-multiple"
                        color={COLORS.primary}
                    />
                    <StatCard
                        title="Pedidos Hoy"
                        value={stats.pedidosHoy}
                        icon="package-variant-closed"
                        color={COLORS.secondary}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.resumenBtn, SHADOWS.soft]}
                    onPress={() => navigation.navigate('ResumenVentas')}
                >
                    <View style={styles.resumenBtnContent}>
                        <MaterialCommunityIcons name="chart-box-outline" size={24} color="#FFF" />
                        <Text style={styles.resumenBtnText}>Análisis de Ventas</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeaderTitle}>General</Text>
                <View style={styles.grid}>
                    <StatCard
                        title="Ventas Totales"
                        value={`$${stats.totalVentas.toLocaleString()}`}
                        icon="trending-up"
                        color={COLORS.info}
                        subtitle={`${stats.pedidosTotales} pedidos`}
                        fullWidth={!isTablet}
                    />
                    <StatCard
                        title="Productos"
                        value={stats.totalProductos}
                        icon="necklace"
                        color={COLORS.accent}
                    />
                    <StatCard
                        title="Clientes"
                        value={stats.totalClientes}
                        icon="account-group"
                        color={COLORS.secondary}
                    />
                </View>
            </View>

            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderLine}>
                    <Text style={styles.sectionHeaderTitle}>Top 5 Productos</Text>
                    <Text style={styles.sectionSubtitle}>Tendencia</Text>
                </View>
                <View style={styles.topProductsCard}>
                    {stats.topProductos.length > 0 ? (
                        stats.topProductos.map((item, index) => (
                            <View key={index} style={styles.topProductRow}>
                                <Text style={styles.topProductRank}>{index + 1}</Text>
                                <Text style={styles.topProductName} numberOfLines={1}>{item.nombre_producto}</Text>
                                <View style={styles.topProductQtyBadge}>
                                    <Text style={styles.topProductQtyText}>{item.total_vendido} uds</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="package-variant" size={40} color={COLORS.textTertiary} />
                            <Text style={styles.emptyTopProducts}>Aún no hay ventas registradas</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    welcome: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHTS.medium,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    appName: {
        fontSize: 32,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        marginTop: 4,
    },
    netBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.round,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    netText: {
        fontSize: 12,
        fontWeight: FONT_WEIGHTS.bold,
    },
    syncAlert: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.info,
        ...SHADOWS.soft,
    },
    syncAlertText: {
        color: COLORS.textPrimary,
        fontSize: 13,
        fontWeight: FONT_WEIGHTS.medium,
        marginLeft: 10,
        flex: 1,
    },
    sectionContainer: {
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.md,
    },
    sectionHeaderTitle: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    resumenBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.lg,
        padding: 16,
        marginTop: SPACING.md,
        marginHorizontal: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resumenBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resumenBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.black,
        marginLeft: 12,
    },
    statCardWrapper: {
        padding: SPACING.xs,
    },
    statCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        height: 100,
        ...SHADOWS.soft,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    statContent: {
        flex: 1,
    },
    statTitle: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHTS.semiBold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 20,
        fontWeight: FONT_WEIGHTS.black,
        marginVertical: 2,
    },
    statSubtitle: {
        fontSize: 10,
        color: COLORS.textTertiary,
    },
    sectionHeaderLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: FONT_WEIGHTS.bold,
    },
    topProductsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        marginHorizontal: SPACING.sm,
        ...SHADOWS.soft,
    },
    topProductRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceSecondary,
    },
    topProductRank: {
        fontSize: 12,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textTertiary,
        width: 30,
        textAlign: 'center',
    },
    topProductName: {
        flex: 1,
        fontSize: 15,
        fontWeight: FONT_WEIGHTS.medium,
        color: COLORS.textPrimary,
        marginRight: 10,
    },
    topProductQtyBadge: {
        backgroundColor: COLORS.surfaceSecondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
    },
    topProductQtyText: {
        fontSize: 12,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.secondary,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    emptyTopProducts: {
        textAlign: 'center',
        color: COLORS.textTertiary,
        fontStyle: 'italic',
        marginTop: 10,
    },
    fab: {
        position: 'absolute',
        right: 25,
        bottom: 115, // Adjusted for new tab bar height
        backgroundColor: COLORS.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.heavy,
        zIndex: 10,
    }
});

export default DashboardScreen;

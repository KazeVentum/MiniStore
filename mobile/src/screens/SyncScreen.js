import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import { useSupabase } from '../services/supabase';
import { saveProductosBulk, saveClientesBulk, savePedidosBulk, saveCanalesBulk, getProductos, getClientes, getPedidos, getCanales } from '../services/database';
import { performFullSync } from '../services/sync';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_WEIGHTS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

const SyncScreen = () => {
    const { isTablet, scaleFont } = useResponsive();
    const { supabase } = useSupabase();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        lastSync: 'Nunca',
        localProducts: 0,
        localClients: 0,
        localPedidos: 0,
        localCanales: 0
    });

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

    useEffect(() => {
        refreshStats();
    }, []);

    const syncData = async () => {
        setLoading(true);
        try {
            await performFullSync();
            await refreshStats();
            setStats(prev => ({
                ...prev,
                lastSync: new Date().toLocaleString()
            }));
            Alert.alert('Éxito', 'Sincronización completada correctamente');
        } catch (error) {
            console.error('Sync failed:', error);
            Alert.alert('Error', 'No se pudo sincronizar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const StatItem = ({ label, value, icon, color }) => (
        <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: color + '10' }]}>
                <MaterialCommunityIcons name={icon} size={20} color={color} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Sincronización</Text>
                    <Text style={styles.headerSubtitle}>Gestión de datos en la nube</Text>
                </View>

                <View style={styles.section}>
                    <View style={[styles.syncCard, SHADOWS.soft]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="database-check-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.cardTitle}>Inventario Local</Text>
                        </View>

                        <View style={styles.statsGrid}>
                            <StatItem
                                label="Productos"
                                value={stats.localProducts}
                                icon="package-variant"
                                color={COLORS.primary}
                            />
                            <StatItem
                                label="Clientes"
                                value={stats.localClients}
                                icon="account-group-outline"
                                color={COLORS.secondary}
                            />
                            <StatItem
                                label="Pedidos"
                                value={stats.localPedidos}
                                icon="receipt-outline"
                                color={COLORS.success}
                            />
                            <StatItem
                                label="Canales"
                                value={stats.localCanales}
                                icon="storefront-outline"
                                color={COLORS.warning}
                            />
                        </View>

                        <View style={styles.timeBox}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.textTertiary} />
                            <Text style={styles.timeText}>Última vez: {stats.lastSync}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.syncBtn, loading && styles.btnDisabled, SHADOWS.heavy]}
                        onPress={syncData}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="sync" size={24} color="#fff" style={styles.btnIcon} />
                                <Text style={styles.syncBtnText}>Sincronizar Todo</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.infoCard}>
                        <MaterialCommunityIcons name="information" size={20} color={COLORS.textSecondary} />
                        <Text style={styles.infoText}>
                            Esta acción actualiza tu base de datos local con los productos y clientes de Supabase. Ideal para trabajar sin conexión.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.xl,
        paddingTop: 30,
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        ...SHADOWS.soft,
    },
    title: {
        fontSize: 28,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
        fontWeight: FONT_WEIGHTS.medium,
    },
    section: {
        padding: SPACING.lg,
    },
    syncCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        marginLeft: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    statItem: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceSecondary,
        padding: 12,
        borderRadius: BORDER_RADIUS.lg,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.textTertiary,
        fontWeight: FONT_WEIGHTS.bold,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
    },
    timeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 25,
        justifyContent: 'center',
        backgroundColor: COLORS.surfaceSecondary,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
    },
    timeText: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginLeft: 6,
        fontWeight: FONT_WEIGHTS.medium,
    },
    syncBtn: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: BORDER_RADIUS.xl,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    btnIcon: {
        marginRight: 10,
    },
    syncBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.black,
    },
    btnDisabled: {
        opacity: 0.7,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surfaceSecondary,
        padding: 16,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 12,
        lineHeight: 18,
        fontWeight: FONT_WEIGHTS.medium,
    },
});

export default SyncScreen;

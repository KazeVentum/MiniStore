import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    FlatList,
    Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONT_WEIGHTS } from '../theme';
import { getVentasMensuales } from '../services/database';
import { formatCurrency } from '../utils/helpers';

const ResumenVentasScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ resumen: [], pedidos: [] });
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchData = async () => {
        setLoading(true);
        try {
            const mes = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const anio = currentDate.getFullYear().toString();
            const result = await getVentasMensuales(mes, anio);
            setData(result || { resumen: [], pedidos: [] });
        } catch (error) {
            console.error("Error cargando ventas mensuales:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const totalVentas = (data.resumen || []).reduce((sum, item) => sum + parseFloat(item.total_monto || 0), 0);
    const promedioVenta = data.pedidos.length > 0 ? totalVentas / data.pedidos.length : 0;

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Análisis de <Text style={{ color: COLORS.primary }}>Ventas</Text></Text>
                    <Text style={styles.headerSubtitle}>Mes de {monthNames[currentDate.getMonth()]}</Text>
                </View>
            </View>

            <View style={styles.monthSelector}>
                <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.textTertiary} />
                </TouchableOpacity>
                <View style={styles.monthLabelContainer}>
                    <Text style={styles.monthYearLabel}>{monthNames[currentDate.getMonth()].toUpperCase()} {currentDate.getFullYear()}</Text>
                </View>
                <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthBtn}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textTertiary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={[styles.mainCard, SHADOWS.heavy]}>
                <View style={styles.mainCardHeader}>
                    <View style={styles.iconBox}>
                        <MaterialCommunityIcons name="trending-up" size={24} color={COLORS.primary} />
                    </View>
                    <Text style={styles.mainCardLabel}>INGRESOS TOTALES</Text>
                </View>
                <Text style={styles.mainTotalText}>{formatCurrency(totalVentas)}</Text>

                <View style={styles.statsDivider} />

                <View style={styles.subStatsRow}>
                    <View style={styles.subStatItem}>
                        <Text style={styles.subStatLabel}>PEDIDOS</Text>
                        <Text style={styles.subStatValue}>{data.pedidos.length}</Text>
                    </View>
                    <View style={styles.subStatDivider} />
                    <View style={styles.subStatItem}>
                        <Text style={styles.subStatLabel}>PROMEDIO</Text>
                        <Text style={styles.subStatValue}>{formatCurrency(promedioVenta)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.methodsGrid}>
                {data.resumen.map((metodo, idx) => (
                    <View key={idx} style={styles.methodCard}>
                        <View style={styles.methodHeader}>
                            <MaterialCommunityIcons
                                name={metodo.metodo_pago === 'Efectivo' ? 'cash' : 'credit-card-outline'}
                                size={20}
                                color={COLORS.textPrimary}
                            />
                            <Text style={styles.methodOps}>{metodo.cantidad_pedidos} Ops</Text>
                        </View>
                        <Text style={styles.methodLabel}>{metodo.metodo_pago}</Text>
                        <Text style={styles.methodAmount}>{formatCurrency(metodo.total_monto)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.nombre_cliente.charAt(0)}</Text>
                </View>
                <View style={styles.orderInfo}>
                    <Text style={styles.customerName}>{item.nombre_cliente}</Text>
                    <Text style={styles.orderDate}>
                        {new Date(item.fecha_pedido).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
            </View>
            <Text style={styles.productSummary} numberOfLines={1}>
                {item.productos_resumen || 'Sin detalles'}
            </Text>
            <View style={styles.badgeContainer}>
                <View style={[styles.methodBadge, { backgroundColor: COLORS.surfaceSecondary }]}>
                    <Text style={styles.methodBadgeText}>{item.metodo_pago}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            {renderHeader()}

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loaderText}>GENERANDO REPORTE...</Text>
                </View>
            ) : (
                <FlatList
                    data={data.pedidos}
                    keyExtractor={(item) => item.id_pedido.toString()}
                    renderItem={renderOrderItem}
                    ListHeaderComponent={
                        <>
                            {renderStats()}
                            <Text style={styles.listTitle}>Bitácora de Operaciones</Text>
                        </>
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="chart-donut" size={60} color={COLORS.surfaceSecondary} />
                            <Text style={styles.emptyText}>Sin registros este mes</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        marginBottom: 20,
    },
    backBtn: {
        marginRight: 15,
        marginLeft: -10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.textTertiary,
        fontWeight: FONT_WEIGHTS.bold,
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceSecondary,
        padding: 4,
        borderRadius: BORDER_RADIUS.lg,
    },
    monthBtn: {
        padding: 10,
    },
    monthLabelContainer: {
        flex: 1,
        alignItems: 'center',
    },
    monthYearLabel: {
        fontSize: 14,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        letterSpacing: 1,
    },
    statsContainer: {
        padding: SPACING.lg,
    },
    mainCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    mainCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconBox: {
        backgroundColor: 'rgba(255, 64, 129, 0.1)',
        padding: 8,
        borderRadius: BORDER_RADIUS.md,
        marginRight: 12,
    },
    mainCardLabel: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textTertiary,
        letterSpacing: 2,
    },
    mainTotalText: {
        fontSize: 36,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        letterSpacing: -1,
    },
    statsDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 20,
    },
    subStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subStatItem: {
        flex: 1,
    },
    subStatLabel: {
        fontSize: 9,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textTertiary,
        marginBottom: 4,
        letterSpacing: 1,
    },
    subStatValue: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textSecondary,
    },
    subStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
        marginHorizontal: 20,
    },
    methodsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    methodCard: {
        width: '48%',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    methodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    methodOps: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textTertiary,
    },
    methodLabel: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    methodAmount: {
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        marginHorizontal: SPACING.lg,
        marginBottom: 15,
    },
    listContent: {
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.lg,
        padding: 16,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: COLORS.primary,
        fontWeight: FONT_WEIGHTS.black,
        fontSize: 14,
    },
    orderInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 15,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
    },
    orderDate: {
        fontSize: 10,
        color: COLORS.textTertiary,
        fontWeight: FONT_WEIGHTS.bold,
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
    },
    productSummary: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginBottom: 10,
    },
    badgeContainer: {
        flexDirection: 'row',
    },
    methodBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    methodBadgeText: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 15,
        fontSize: 12,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textTertiary,
        letterSpacing: 2,
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textTertiary,
    }
});

export default ResumenVentasScreen;

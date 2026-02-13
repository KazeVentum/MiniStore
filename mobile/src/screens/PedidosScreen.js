import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Modal,
    RefreshControl,
    Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getPedidos, getPedidoById, updatePedidoEstado } from '../services/database';
import { performFullSync } from '../services/sync';
import { processAutoSync, addSyncListener } from '../services/network';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_WEIGHTS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';
import { formatDate, formatCurrency } from '../utils/helpers';

const PedidosScreen = ({ navigation }) => {
    const { isTablet, getGridColumns, scaleFont } = useResponsive();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedStatus, setSelectedStatus] = useState('todos');

    // UI states
    const [monthModalVisible, setMonthModalVisible] = useState(false);
    const [yearModalVisible, setYearModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await performFullSync();
            await loadPedidos();
        } catch (error) {
            console.error('Refresh/Sync failed in Pedidos:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleViewDetails = async (id) => {
        setDetailLoading(true);
        try {
            const order = await getPedidoById(id);
            setSelectedOrder(order);
            setDetailModalVisible(true);
        } catch (error) {
            console.error("Error fetching order details", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedOrder) return;
        setDetailLoading(true);
        try {
            await updatePedidoEstado(selectedOrder.id_pedido, newStatus);
            await processAutoSync();
            setDetailModalVisible(false);
            await loadPedidos();
        } catch (error) {
            console.error("Error updating status:", error);
            Alert.alert("Error", "No se pudo actualizar el estado");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleEditOrder = () => {
        if (!selectedOrder) return;
        setDetailModalVisible(false);
        navigation.navigate('NuevoPedido', { id_pedido: selectedOrder.id_pedido });
    };

    const loadPedidos = useCallback(async () => {
        try {
            const data = await getPedidos();
            setPedidos(data.rows);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadPedidos();
        }, [loadPedidos])
    );

    React.useEffect(() => {
        const unsubscribe = addSyncListener(() => {
            loadPedidos();
        });
        return unsubscribe;
    }, [loadPedidos]);

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    const estados = [
        { id: 'todos', name: 'Todos los estados', icon: 'all-inclusive' },
        { id: 'borrador', name: 'Borradores', icon: 'file-edit-outline' },
        { id: 'pendiente', name: 'Pendientes', icon: 'clock-outline' },
        { id: 'completado', name: 'Completados', icon: 'check-circle-outline' },
        { id: 'cancelado', name: 'Cancelados', icon: 'close-circle-outline' },
    ];

    const filteredPedidos = pedidos.filter(p => {
        const date = new Date(p.fecha_pedido);
        const matchDate = (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
        const matchStatus = selectedStatus === 'todos' || p.estado?.toLowerCase() === selectedStatus;
        return matchDate && matchStatus;
    });

    const monthStats = {
        count: filteredPedidos.length,
        total: filteredPedidos.reduce((sum, p) => sum + (p.total || 0), 0),
        historical: pedidos.length
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };

    const getStatusTheme = (status) => {
        switch (status?.toLowerCase()) {
            case 'completado': return { color: COLORS.success, icon: 'check-circle' };
            case 'pendiente': return { color: COLORS.warning, icon: 'clock' };
            case 'cancelado': return { color: COLORS.error, icon: 'close-circle' };
            case 'borrador': return { color: COLORS.textSecondary, icon: 'file-edit' };
            default: return { color: COLORS.info, icon: 'help-circle' };
        }
    };

    const renderItem = ({ item }) => {
        const statusTheme = getStatusTheme(item.estado);
        const cardWidth = isTablet ? `${100 / getGridColumns(1, 2, 3)}%` : '100%';

        return (
            <View style={{ width: cardWidth, paddingHorizontal: 5 }}>
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.7}
                    onPress={() => handleViewDetails(item.id_pedido)}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.orderIdContainer}>
                            <Text style={styles.orderId}>#{item.id_pedido}</Text>
                            {item.sincronizado === 1 ? (
                                <Text style={styles.syncIndicator}>☁️</Text>
                            ) : (
                                <Text style={styles.syncIndicator}>📥</Text>
                            )}
                        </View>
                        <View style={[styles.statusTag, { backgroundColor: statusTheme.color + '15' }]}>
                            <MaterialCommunityIcons name={statusTheme.icon} size={14} color={statusTheme.color} />
                            <Text style={[styles.statusText, { color: statusTheme.color }]}>
                                {item.estado?.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <Text style={styles.clientName} numberOfLines={1}>{item.nombre_cliente || 'Cliente Desconocido'}</Text>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="calendar-range" size={14} color={COLORS.textTertiary} />
                            <Text style={styles.dateText}>
                                {item.fecha_pedido ? formatDate(item.fecha_pedido) : 'Sin fecha'}
                            </Text>
                            <View style={styles.separator} />
                            <MaterialCommunityIcons name="credit-card-outline" size={14} color={COLORS.textTertiary} />
                            <Text style={styles.paymentText}>{item.metodo_pago || 'Efectivo'}</Text>
                        </View>
                    </View>

                    <View style={styles.cardFooter}>
                        <Text style={styles.amountText}>{formatCurrency(item.total)}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textTertiary} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 1. Header & Stats Component */}
            <View style={styles.topSection}>
                <View style={styles.statsRow}>
                    <View style={styles.statMiniCard}>
                        <Text style={styles.statMiniLabel}>PEDIDOS</Text>
                        <Text style={[styles.statMiniValue, { color: COLORS.info }]}>{monthStats.count}</Text>
                    </View>
                    <View style={styles.statMiniDivider} />
                    <View style={[styles.statMiniCard, { flex: 2 }]}>
                        <Text style={styles.statMiniLabel}>FACTURACIÓN MES</Text>
                        <Text style={[styles.statMiniValue, { color: COLORS.primary }]}>{formatCurrency(monthStats.total)}</Text>
                    </View>
                </View>

                {/* 2. Filters Bar */}
                <View style={styles.filtersBar}>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setMonthModalVisible(true)}>
                        <Text style={styles.filterButtonText}>{meses[selectedMonth - 1]}</Text>
                        <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setYearModalVisible(true)}>
                        <Text style={styles.filterButtonText}>{selectedYear}</Text>
                        <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterButton, { flex: 1.5 }]} onPress={() => setStatusModalVisible(true)}>
                        <Text style={styles.filterButtonText} numberOfLines={1}>
                            {estados.find(e => e.id === selectedStatus)?.name}
                        </Text>
                        <MaterialCommunityIcons name="filter-variant" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 3. List */}
            <FlatList
                data={filteredPedidos}
                renderItem={renderItem}
                keyExtractor={item => item.id_pedido.toString()}
                numColumns={getGridColumns(1, 2, 3)}
                key={isTablet ? 'tablet-list' : 'phone-list'} // Force re-render on grid change
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="package-variant" size={60} color={COLORS.textTertiary} />
                        <Text style={styles.emptyText}>Sin pedidos en este periodo</Text>
                        <Text style={styles.emptySubText}>Cambia los filtros o crea un nuevo pedido.</Text>
                    </View>
                }
            />

            {/* Selection Modals (simplified for brevity, should use same style) */}
            {/* [Modals would be here, but I'll focus on the main layout first] */}

            <Modal visible={monthModalVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setMonthModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Mes</Text>
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            {meses.map((mes, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.modalOption, selectedMonth === (idx + 1) && styles.selectedOption]}
                                    onPress={() => {
                                        setSelectedMonth(idx + 1);
                                        setMonthModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalOptionText, selectedMonth === (idx + 1) && styles.selectedOptionText]}>{mes}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Year Modal */}
            <Modal visible={yearModalVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setYearModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Año</Text>
                        {anios.map(anio => (
                            <TouchableOpacity
                                key={anio}
                                style={[styles.modalOption, selectedYear === anio && styles.selectedOption]}
                                onPress={() => {
                                    setSelectedYear(anio);
                                    setYearModalVisible(false);
                                }}
                            >
                                <Text style={[styles.modalOptionText, selectedYear === anio && styles.selectedOptionText]}>{anio}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Status Modal */}
            <Modal visible={statusModalVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setStatusModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Estado</Text>
                        {estados.map(status => (
                            <TouchableOpacity
                                key={status.id}
                                style={[styles.modalOption, selectedStatus === status.id && styles.selectedOption, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                                onPress={() => {
                                    setSelectedStatus(status.id);
                                    setStatusModalVisible(false);
                                }}
                            >
                                <MaterialCommunityIcons name={status.icon} size={18} color={selectedStatus === status.id ? COLORS.primary : COLORS.textSecondary} style={{ marginRight: 10 }} />
                                <Text style={[styles.modalOptionText, selectedStatus === status.id && styles.selectedOptionText]}>{status.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>


            {/* Order Details Modal - Premium Design */}
            <Modal visible={detailModalVisible} transparent animationType="slide">
                <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
                    <View style={styles.orderDetailCard}>
                        <View style={styles.detailHandle} />
                        <View style={styles.detailHeader}>
                            <View>
                                <Text style={styles.detailOrderNumber}>Pedido #{selectedOrder?.id_pedido}</Text>
                                <View style={[styles.statusTag, { backgroundColor: getStatusTheme(selectedOrder?.estado).color + '15', marginTop: 4 }]}>
                                    <Text style={[styles.statusText, { color: getStatusTheme(selectedOrder?.estado).color }]}>
                                        {selectedOrder?.estado?.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.detailCloseBtn}>
                                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {selectedOrder && (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                                <View style={styles.detailSection}>
                                    <View style={styles.clientInfo}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>
                                                {selectedOrder.nombre_cliente?.substring(0, 1).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.detailClientName}>{selectedOrder.nombre_cliente}</Text>
                                            <Text style={styles.detailMeta}>{selectedOrder.nombre_canal?.toUpperCase() || 'DIRECTO'} • {selectedOrder.metodo_pago}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.itemsSection}>
                                    <Text style={styles.detailSectionTitle}>PRODUCTOS</Text>
                                    {selectedOrder.productos?.map((item, idx) => (
                                        <View key={idx} style={styles.detailProductRow}>
                                            <View style={styles.productBadge}>
                                                <Text style={styles.productBadgeText}>{item.cantidad}</Text>
                                            </View>
                                            <Text style={styles.detailProductName} numberOfLines={2}>{item.nombre_producto}</Text>
                                            <Text style={styles.detailProductPrice}>{formatCurrency(item.precio_unitario * item.cantidad)}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.summaryBox}>
                                    <View style={styles.summaryLine}>
                                        <Text style={styles.summaryLabel}>Subtotal</Text>
                                        <Text style={styles.summaryValue}>{formatCurrency(selectedOrder.subtotal)}</Text>
                                    </View>
                                    <View style={styles.summaryLine}>
                                        <Text style={styles.summaryLabel}>Envío</Text>
                                        <Text style={styles.summaryValue}>{formatCurrency(selectedOrder.costo_envio)}</Text>
                                    </View>
                                    <View style={[styles.summaryLine, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.surfaceSecondary }]}>
                                        <Text style={styles.totalLabel}>TOTAL</Text>
                                        <Text style={styles.totalValue}>{formatCurrency(selectedOrder.total)}</Text>
                                    </View>
                                </View>

                                {selectedOrder.notas ? (
                                    <View style={styles.notesBox}>
                                        <MaterialCommunityIcons name="note-text-outline" size={18} color={COLORS.textTertiary} />
                                        <Text style={styles.notesText}>{selectedOrder.notas}</Text>
                                    </View>
                                ) : null}

                                <View style={styles.detailActions}>
                                    {selectedOrder.estado === 'pendiente' && (
                                        <View style={styles.mainActions}>
                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                                                onPress={() => handleStatusUpdate('completado')}
                                            >
                                                <MaterialCommunityIcons name="check-all" size={20} color="#fff" />
                                                <Text style={styles.actionButtonText}>APROBAR</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                                                onPress={() => handleStatusUpdate('cancelado')}
                                            >
                                                <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
                                                <Text style={styles.actionButtonText}>CANCELAR</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={handleEditOrder}
                                    >
                                        <MaterialCommunityIcons name="pencil-outline" size={20} color={COLORS.secondary} />
                                        <Text style={styles.editButtonText}>EDITAR PEDIDO</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {detailLoading && (
                <View style={styles.globalLoader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            )}

            <TouchableOpacity
                style={[styles.fab, SHADOWS.heavy]}
                onPress={() => navigation.navigate('NuevoPedido')}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topSection: {
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        ...SHADOWS.soft,
        paddingBottom: SPACING.md,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        paddingBottom: SPACING.md,
        alignItems: 'center',
    },
    statMiniCard: {
        flex: 1,
        alignItems: 'flex-start',
    },
    statMiniDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.surfaceSecondary,
        marginHorizontal: SPACING.lg,
    },
    statMiniLabel: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textTertiary,
        letterSpacing: 0.5,
    },
    statMiniValue: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        marginTop: 2,
        color: COLORS.textPrimary,
    },
    filtersBar: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        gap: 8,
        marginTop: SPACING.xs,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surfaceSecondary,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.md,
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
    },
    listContent: {
        padding: SPACING.md,
        paddingBottom: 110,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.soft,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 14,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
    },
    syncIndicator: {
        fontSize: 12,
        marginLeft: 6,
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.round,
    },
    statusText: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.black,
        marginLeft: 4,
    },
    cardBody: {
        marginBottom: SPACING.md,
    },
    clientName: {
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    separator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.textTertiary,
        marginHorizontal: 8,
    },
    paymentText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.surfaceSecondary,
    },
    amountText: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: COLORS.textTertiary,
        textAlign: 'center',
        marginTop: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginHorizontal: SPACING.xl,
        maxHeight: '60%',
        ...SHADOWS.heavy,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceSecondary,
    },
    selectedOption: {
        backgroundColor: COLORS.primary + '10',
        borderRadius: BORDER_RADIUS.md,
    },
    modalOptionText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontWeight: FONT_WEIGHTS.medium,
    },
    selectedOptionText: {
        color: COLORS.primary,
        fontWeight: FONT_WEIGHTS.bold,
    },
    orderDetailCard: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl * 1.5,
        borderTopRightRadius: BORDER_RADIUS.xl * 1.5,
        padding: SPACING.lg,
        maxHeight: '92%',
        ...SHADOWS.heavy,
    },
    detailHandle: {
        width: 40,
        height: 5,
        backgroundColor: COLORS.surfaceSecondary,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.xl,
    },
    detailOrderNumber: {
        fontSize: 24,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
    },
    detailCloseBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailSection: {
        marginBottom: SPACING.xl,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: FONT_WEIGHTS.bold,
    },
    detailClientName: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
    },
    detailMeta: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    detailSectionTitle: {
        fontSize: 12,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textTertiary,
        letterSpacing: 1,
        marginBottom: SPACING.md,
    },
    itemsSection: {
        marginBottom: SPACING.xl,
    },
    detailProductRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceSecondary,
    },
    productBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productBadgeText: {
        fontSize: 12,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
    },
    detailProductName: {
        flex: 1,
        fontSize: 14,
        fontWeight: FONT_WEIGHTS.medium,
        color: COLORS.textPrimary,
    },
    detailProductPrice: {
        fontSize: 14,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
        marginLeft: 10,
    },
    summaryBox: {
        backgroundColor: COLORS.surfaceSecondary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    summaryLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.primary,
    },
    notesBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary + '05',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.xl,
        alignItems: 'flex-start',
    },
    notesText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginLeft: 10,
        lineHeight: 18,
    },
    detailActions: {
        gap: 12,
    },
    mainActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        height: 54,
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...SHADOWS.soft,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: FONT_WEIGHTS.black,
        letterSpacing: 0.5,
    },
    editButton: {
        height: 54,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    editButtonText: {
        color: COLORS.secondary,
        fontSize: 13,
        fontWeight: FONT_WEIGHTS.black,
        letterSpacing: 0.5,
    },
    globalLoader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        right: 25,
        bottom: 115,
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

export default PedidosScreen;

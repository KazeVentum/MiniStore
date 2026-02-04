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
    RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPedidos, getPedidoById, updatePedidoEstado } from '../services/database';
import { performFullSync } from '../services/sync';
import { processAutoSync, addSyncListener } from '../services/network';

const PedidosScreen = ({ navigation }) => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            console.log('Initiating sync during pull-to-refresh (Pedidos)...');
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
            console.log('Local status updated, starting cloud sync...');

            // Attempt to sync immediately and wait for it for a smoother experience
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

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedStatus, setSelectedStatus] = useState('todos');

    // UI states
    const [monthModalVisible, setMonthModalVisible] = useState(false);
    const [yearModalVisible, setYearModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);

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
            console.log('Background sync detected, refreshing Pedidos list...');
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
        { id: 'todos', name: 'Todos los estados' },
        { id: 'borrador', name: 'Borradores' },
        { id: 'pendiente', name: 'Pendientes' },
        { id: 'completado', name: 'Completados' },
        { id: 'cancelado', name: 'Cancelados' },
    ];

    // Filter logic
    const filteredPedidos = pedidos.filter(p => {
        const date = new Date(p.fecha_pedido);
        const matchDate = (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
        const matchStatus = selectedStatus === 'todos' || p.estado?.toLowerCase() === selectedStatus;
        return matchDate && matchStatus;
    });

    // Stats calculation
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

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completado': return '#40c057';
            case 'pendiente': return '#fab005';
            case 'cancelado': return '#fa5252';
            case 'borrador': return '#868e96';
            default: return '#adb5bd';
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handleViewDetails(item.id_pedido)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.orderIdContainer}>
                    <Text style={styles.orderId}>Pedido <Text style={styles.orderNumber}>#{item.id_pedido}</Text></Text>
                    <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.estado) + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.estado) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(item.estado) }]}>
                            {item.estado?.toUpperCase()}
                        </Text>
                    </View>
                </View>
                {item.sincronizado === 1 ? (
                    <Text style={styles.syncTag}>☁️ Sincronizado</Text>
                ) : (
                    <Text style={[styles.syncTag, { color: '#fa5252' }]}>📥 Local</Text>
                )}
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.clientLabel}>👤</Text>
                    <Text style={styles.clientName} numberOfLines={1}>{item.nombre_cliente || 'Cliente Desconocido'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.dateLabel}>📅</Text>
                    <Text style={styles.dateText}>
                        {(() => {
                            if (!item.fecha_pedido) return 'Sin fecha';
                            // Replace dash with slash for better local parsing on some engines if it's YYYY-MM-DD
                            const dateStr = item.fecha_pedido.includes('T')
                                ? item.fecha_pedido.replace('Z', '') // Remove Z to treat as local if it's our own local ISO
                                : item.fecha_pedido.replace(/-/g, '/');
                            return new Date(dateStr).toLocaleDateString();
                        })()} • {item.metodo_pago || 'Efectivo'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.amountLabel}>MONTO TOTAL</Text>
                <Text style={styles.amountText}>{formatCurrency(item.total)}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#e83e8c" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 1. Stats Row */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>PEDIDOS MES</Text>
                    <Text style={[styles.statValue, { color: '#4dabf7' }]}>{monthStats.count}</Text>
                </View>
                <View style={[styles.statCard, styles.statCardCenter]}>
                    <Text style={styles.statLabel}>MONTO MES</Text>
                    <Text style={[styles.statValue, { color: '#e83e8c' }]}>{formatCurrency(monthStats.total)}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>PEDIDOS TOT.</Text>
                    <Text style={[styles.statValue, { color: '#868e96' }]}>{monthStats.historical}</Text>
                </View>
            </View>

            {/* 2. Filters Bar */}
            <View style={styles.filtersBar}>
                <TouchableOpacity style={styles.filterButton} onPress={() => setMonthModalVisible(true)}>
                    <Text style={styles.filterButtonText}>{meses[selectedMonth - 1]}</Text>
                    <Text style={styles.filterArrow}>▼</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton} onPress={() => setYearModalVisible(true)}>
                    <Text style={styles.filterButtonText}>{selectedYear}</Text>
                    <Text style={styles.filterArrow}>▼</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterButton, { flex: 1.5 }]} onPress={() => setStatusModalVisible(true)}>
                    <Text style={styles.filterButtonText} numberOfLines={1}>
                        {estados.find(e => e.id === selectedStatus)?.name}
                    </Text>
                    <Text style={styles.filterArrow}>▼</Text>
                </TouchableOpacity>
            </View>

            {/* 3. List */}
            <FlatList
                data={filteredPedidos}
                renderItem={renderItem}
                keyExtractor={item => item.id_pedido.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🛍️</Text>
                        <Text style={styles.emptyText}>Sin pedidos en este periodo</Text>
                        <Text style={styles.emptySubText}>Cambia los filtros o crea un nuevo pedido.</Text>
                    </View>
                }
            />

            {/* Selection Modals */}
            {/* Month Modal */}
            <Modal visible={monthModalVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setMonthModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Mes</Text>
                        <ScrollView>
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
                        <Text style={styles.modalTitle}>Seleccionar Año</Text>
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
                        <Text style={styles.modalTitle}>Filtrar por Estado</Text>
                        {estados.map(status => (
                            <TouchableOpacity
                                key={status.id}
                                style={[styles.modalOption, selectedStatus === status.id && styles.selectedOption]}
                                onPress={() => {
                                    setSelectedStatus(status.id);
                                    setStatusModalVisible(false);
                                }}
                            >
                                <Text style={[styles.modalOptionText, selectedStatus === status.id && styles.selectedOptionText]}>{status.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Order Details Modal */}
            <Modal visible={detailModalVisible} transparent animationType="slide">
                <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
                    <View style={[styles.modalContent, { maxHeight: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Detalle del Pedido #{selectedOrder?.id_pedido}</Text>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedOrder && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.detailSection}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>CLIENTE</Text>
                                        <Text style={styles.detailValue}>{selectedOrder.nombre_cliente}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>CANAL</Text>
                                        <Text style={styles.detailValue}>{selectedOrder.nombre_canal?.toUpperCase() || 'DIRECTO'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>PAGO</Text>
                                        <Text style={[styles.detailValue, { color: '#e83e8c', fontWeight: '900' }]}>
                                            {selectedOrder.metodo_pago?.toUpperCase() || 'EFECTIVO'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.itemsSection}>
                                    <Text style={styles.sectionTitle}>PRODUCTOS</Text>
                                    {selectedOrder.productos?.map((item, idx) => (
                                        <View key={idx} style={styles.productItem}>
                                            <View style={styles.productMain}>
                                                <Text style={styles.productName}>{item.nombre_producto}</Text>
                                                <Text style={styles.productQty}>x{item.cantidad}</Text>
                                            </View>
                                            <Text style={styles.productSubtotal}>{formatCurrency(item.precio_unitario * item.cantidad)}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.summarySection}>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>SUBTOTAL</Text>
                                        <Text style={styles.summaryValue}>{formatCurrency(selectedOrder.subtotal)}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>ENVÍO</Text>
                                        <Text style={styles.summaryValue}>{formatCurrency(selectedOrder.costo_envio)}</Text>
                                    </View>
                                    <View style={[styles.summaryRow, styles.totalRow]}>
                                        <Text style={styles.totalLabel}>TOTAL</Text>
                                        <Text style={styles.totalValue}>{formatCurrency(selectedOrder.total)}</Text>
                                    </View>
                                </View>

                                {selectedOrder.notas ? (
                                    <View style={styles.notesSection}>
                                        <Text style={styles.sectionTitle}>NOTAS</Text>
                                        <Text style={styles.notesText}>"{selectedOrder.notas}"</Text>
                                    </View>
                                ) : null}

                                {selectedOrder.estado === 'pendiente' && (
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#40c057' }]}
                                            onPress={() => handleStatusUpdate('completado')}
                                        >
                                            <Text style={styles.actionBtnText}>Aprobar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#fa5252' }]}
                                            onPress={() => handleStatusUpdate('cancelado')}
                                        >
                                            <Text style={styles.actionBtnText}>Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <View style={styles.secondaryActions}>
                                    <TouchableOpacity
                                        style={styles.editBtn}
                                        onPress={handleEditOrder}
                                    >
                                        <Text style={styles.editBtnText}>✏️ Editar Pedido</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.closeModalBtn}
                                        onPress={() => setDetailModalVisible(false)}
                                    >
                                        <Text style={styles.closeModalBtnText}>Cerrar</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Global Loader for details */}
            {detailLoading && (
                <View style={styles.globalLoader}>
                    <ActivityIndicator size="large" color="#e83e8c" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statCardCenter: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#f1f3f5',
    },
    statLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#adb5bd',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '900',
    },
    filtersBar: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        gap: 8,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f1f3f5',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#495057',
    },
    filterArrow: {
        fontSize: 10,
        color: '#adb5bd',
        marginLeft: 5,
    },
    listContent: {
        padding: 15,
        paddingBottom: 110,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderIdContainer: {
        flex: 1,
    },
    orderId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#868e96',
        marginBottom: 4,
    },
    orderNumber: {
        color: '#2d3436',
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    syncTag: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#40c057',
        backgroundColor: '#f1f3f5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    cardBody: {
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    clientLabel: {
        fontSize: 14,
        marginRight: 8,
    },
    clientName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#212529',
        flex: 1,
    },
    dateLabel: {
        fontSize: 14,
        marginRight: 8,
    },
    dateText: {
        fontSize: 12,
        color: '#868e96',
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f5',
    },
    amountLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#adb5bd',
        letterSpacing: 1,
    },
    amountText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#e83e8c',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 15,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#495057',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#adb5bd',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#2d3436',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    selectedOption: {
        backgroundColor: '#fff0f6',
        borderRadius: 12,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#495057',
        textAlign: 'center',
        fontWeight: '500',
    },
    selectedOptionText: {
        color: '#e83e8c',
        fontWeight: 'bold',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#adb5bd',
        fontWeight: 'bold',
    },
    detailSection: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#adb5bd',
        letterSpacing: 1,
    },
    detailValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#2d3436',
        letterSpacing: 1,
        marginBottom: 12,
    },
    itemsSection: {
        marginBottom: 20,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    productMain: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 2,
    },
    productQty: {
        fontSize: 12,
        color: '#adb5bd',
        fontWeight: 'bold',
    },
    productSubtotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    summarySection: {
        backgroundColor: '#fff0f6',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#c2255c',
    },
    summaryValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#c2255c',
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(232, 62, 140, 0.1)',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '900',
        color: '#e83e8c',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#e83e8c',
    },
    notesSection: {
        marginBottom: 20,
    },
    notesText: {
        fontSize: 13,
        fontStyle: 'italic',
        color: '#868e96',
        lineHeight: 20,
    },
    printButton: {
        backgroundColor: '#2d3436',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    printButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15,
    },
    actionBtn: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
    },
    secondaryActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    editBtn: {
        flex: 1.5,
        backgroundColor: '#f1f3f5',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    editBtnText: {
        color: '#495057',
        fontWeight: 'bold',
    },
    closeModalBtn: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
    },
    closeModalBtnText: {
        color: '#adb5bd',
        fontWeight: 'bold',
    },
    globalLoader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default PedidosScreen;

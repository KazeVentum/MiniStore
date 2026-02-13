import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    Keyboard
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_WEIGHTS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';
import {
    getProductos,
    getClientes,
    getCanales,
    createPedido,
    updatePedidoFull,
    getPedidoById
} from '../services/database';
import { processAutoSync } from '../services/network';

const NuevoPedidoScreen = ({ navigation, route }) => {
    const { isTablet, scaleFont } = useResponsive();
    const editId = route.params?.id_pedido;
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const scrollRef = useRef(null);

    // Form State
    const [pedido, setPedido] = useState({
        id_cliente: null,
        nombre_cliente: 'Seleccionar Cliente',
        id_canal: null,
        nombre_canal: 'Seleccionar Canal',
        metodo_pago: 'Efectivo',
        costo_envio: 0,
        requiere_envio: false,
        direccion_envio: '',
        notes: '',
        productos: []
    });

    // Masters
    const [allProductos, setAllProductos] = useState([]);
    const [allClientes, setAllClientes] = useState([]);
    const [allCanales, setAllCanales] = useState([]);

    // Modals
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [clientModalVisible, setClientModalVisible] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [channelModalVisible, setChannelModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const paymentMethods = [
        { id: 'Efectivo', name: 'Efectivo', icon: 'cash' },
        { id: 'Nequi', name: 'Nequi', icon: 'cellphone-nfc' },
        { id: 'Daviplata', name: 'Daviplata', icon: 'wallet' },
        { id: 'Transferencia', name: 'Transferencia', icon: 'bank' },
    ];

    useEffect(() => {
        loadData();
    }, [editId]);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const prodData = await getProductos();
            const clientData = await getClientes();
            const canalData = await getCanales();

            setAllProductos(prodData.rows);
            setAllClientes(clientData.rows);
            setAllCanales(canalData.rows);

            if (editId) {
                const existing = await getPedidoById(editId);
                if (existing) {
                    setPedido({
                        id_cliente: existing.id_cliente,
                        nombre_cliente: existing.nombre_cliente,
                        id_canal: existing.id_canal,
                        nombre_canal: existing.nombre_canal,
                        metodo_pago: existing.metodo_pago,
                        costo_envio: existing.costo_envio || 0,
                        requiere_envio: !!existing.requiere_envio,
                        direccion_envio: existing.direccion_envio || '',
                        notas: existing.notas || '',
                        productos: existing.productos.map((p, idx) => ({
                            id_producto: p.id_producto,
                            nombre: p.nombre_producto,
                            precio: p.precio_unitario,
                            cantidad: p.cantidad,
                            unique_key: p.id_detalle || `loaded-${idx}`
                        })),
                        estado: existing.estado
                    });
                }
            } else if (canalData.rows.length > 0) {
                const def = canalData.rows[0];
                setPedido(prev => ({
                    ...prev,
                    id_canal: def.id_canal,
                    nombre_canal: def.nombre_canal
                }));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addProductToOrder = (prod) => {
        const existing = pedido.productos.find(p => p.id_producto === prod.id_producto);
        if (existing) {
            updateQuantity(prod.id_producto, 1);
        } else {
            setPedido({
                ...pedido,
                productos: [...pedido.productos, {
                    id_producto: prod.id_producto,
                    nombre: prod.nombre_producto,
                    precio: prod.precio,
                    cantidad: 1,
                    unique_key: Date.now().toString()
                }]
            });
        }
        setProductModalVisible(false);
    };

    const updateQuantity = (id_producto, delta) => {
        const newProds = pedido.productos.map(p => {
            if (p.id_producto === id_producto) {
                const newQty = Math.max(0, p.cantidad + delta);
                return { ...p, cantidad: newQty };
            }
            return p;
        }).filter(p => p.cantidad > 0);
        setPedido({ ...pedido, productos: newProds });
    };

    const calculateSubtotal = () => {
        return pedido.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    };

    const handleSave = async () => {
        if (!pedido.id_cliente) return Alert.alert('Error', 'Debes seleccionar un cliente');
        if (pedido.productos.length === 0) return Alert.alert('Error', 'Debes agregar al menos un producto');

        setIsSyncing(true);
        try {
            const subtotalValue = calculateSubtotal();
            const totalValue = subtotalValue + parseFloat(pedido.costo_envio || 0);

            const dataToSave = {
                ...pedido,
                subtotal: subtotalValue,
                total: totalValue
            };

            if (editId) {
                await updatePedidoFull(editId, dataToSave);
            } else {
                await createPedido(dataToSave);
            }

            try {
                await processAutoSync();
            } catch (syncErr) {
                console.warn('Auto-sync failed, order remains local:', syncErr);
            }

            Alert.alert('Éxito', editId ? 'Pedido actualizado' : 'Pedido registrado');
            navigation.goBack();
        } catch (error) {
            console.error('Save failed:', error);
            Alert.alert('Error', 'No se pudo guardar el pedido');
        } finally {
            setIsSyncing(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };

    if (loading) {
        return (
            <View style={[styles.safeContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const filteredProducts = allProductos.filter(p => p.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredClients = allClientes.filter(c => c.nombre_cliente.toLowerCase().includes(searchQuery.toLowerCase()));
    const subtotal = calculateSubtotal();
    const total = subtotal + parseFloat(pedido.costo_envio || 0);

    return (
        <SafeAreaView style={styles.safeContainer}>
            {isSyncing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.syncText}>Sincronizando pedido...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    ref={scrollRef}
                    style={styles.scroll}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: keyboardVisible ? 400 : 250 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Sección 1: Cliente & Canal */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>General</Text>

                        <Text style={styles.label}>Cliente</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => { setSearchQuery(''); setClientModalVisible(true); }}
                        >
                            <View style={styles.selectorLeft}>
                                <MaterialCommunityIcons name="account-circle-outline" size={24} color={COLORS.primary} />
                                <Text style={[styles.selectorText, pedido.id_cliente ? {} : { color: COLORS.textTertiary }]}>
                                    {pedido.nombre_cliente}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textTertiary} />
                        </TouchableOpacity>

                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.label}>Canal de Venta</Text>
                            <TouchableOpacity
                                style={styles.selector}
                                onPress={() => setChannelModalVisible(true)}
                            >
                                <View style={styles.selectorLeft}>
                                    <MaterialCommunityIcons name="store-outline" size={24} color={COLORS.primary} />
                                    <Text style={styles.selectorText}>{pedido.nombre_canal}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sección 2: Productos */}
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <Text style={styles.cardTitle}>Productos</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => { setSearchQuery(''); setProductModalVisible(true); }}
                            >
                                <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
                                <Text style={styles.addButtonText}>AGREGAR</Text>
                            </TouchableOpacity>
                        </View>

                        {pedido.productos.map((item) => (
                            <View key={item.unique_key} style={styles.productRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.prodName}>{item.nombre}</Text>
                                    <Text style={styles.prodPrice}>{formatCurrency(item.precio)}</Text>
                                </View>
                                <View style={styles.qtyControls}>
                                    <TouchableOpacity onPress={() => updateQuantity(item.id_producto, -1)} style={styles.qtyBtn}>
                                        <MaterialCommunityIcons name="minus" size={16} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{item.cantidad}</Text>
                                    <TouchableOpacity onPress={() => updateQuantity(item.id_producto, 1)} style={styles.qtyBtn}>
                                        <MaterialCommunityIcons name="plus" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        {pedido.productos.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="cart-variant" size={48} color={COLORS.surfaceSecondary} />
                                <Text style={styles.smallEmptyText}>Sin productos agregados</Text>
                            </View>
                        )}
                    </View>

                    {/* Sección 3: Pago y Envío */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Pago y Detalles</Text>

                        <Text style={styles.label}>Método de Pago</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setPaymentModalVisible(true)}
                        >
                            <View style={styles.selectorLeft}>
                                <MaterialCommunityIcons
                                    name={paymentMethods.find(m => m.id === pedido.metodo_pago)?.icon || 'cash'}
                                    size={24}
                                    color={COLORS.textPrimary}
                                />
                                <Text style={styles.selectorText}>
                                    {paymentMethods.find(m => m.id === pedido.metodo_pago)?.name || 'Efectivo'}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textTertiary} />
                        </TouchableOpacity>

                        <View style={styles.shippingSection}>
                            <View style={styles.shippingHeader}>
                                <Text style={[styles.label, { marginTop: 16 }]}>Costo de Envío</Text>
                                <View style={styles.shippingInputWrap}>
                                    <Text style={styles.currencySymbol}>$</Text>
                                    <TextInput
                                        style={styles.shippingInput}
                                        keyboardType="numeric"
                                        value={pedido.costo_envio.toString()}
                                        onChangeText={(t) => {
                                            const clean = t.replace(/[^0-9]/g, '');
                                            setPedido({ ...pedido, costo_envio: clean || '0' });
                                        }}
                                        selectTextOnFocus
                                        onFocus={() => {
                                            setTimeout(() => {
                                                scrollRef.current?.scrollToEnd({ animated: true });
                                            }, 100);
                                        }}
                                        onTouchStart={() => {
                                            setTimeout(() => {
                                                scrollRef.current?.scrollToEnd({ animated: true });
                                            }, 300);
                                        }}
                                    />
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.label, { marginTop: 16 }]}>Notas</Text>
                        <TextInput
                            style={styles.notesInput}
                            multiline
                            placeholder="Instrucciones adicionales..."
                            placeholderTextColor={COLORS.textTertiary}
                            value={pedido.notas}
                            onChangeText={(t) => setPedido({ ...pedido, notas: t })}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollRef.current?.scrollToEnd({ animated: true });
                                }, 100);
                            }}
                            onTouchStart={() => {
                                setTimeout(() => {
                                    scrollRef.current?.scrollToEnd({ animated: true });
                                }, 300);
                            }}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer with totals */}
            {!keyboardVisible && (
                <View style={[styles.footer, SHADOWS.heavy]}>
                    <View style={styles.summaryRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.mainButton, { opacity: (isSyncing || pedido.productos.length === 0) ? 0.6 : 1 }]}
                        onPress={handleSave}
                        disabled={isSyncing || pedido.productos.length === 0}
                    >
                        {isSyncing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="check-decagram" size={24} color="#fff" style={{ marginRight: 10 }} />
                                <Text style={styles.mainButtonText}>
                                    {editId ? 'Guardar Cambios' : 'Registrar Pedido'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal Components (Themed) */}
            <Modal visible={productModalVisible} animationType="slide">
                <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setProductModalVisible(false)} style={styles.backBtn}>
                            <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.modalSearch}
                            placeholder="Buscar producto..."
                            placeholderTextColor={COLORS.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={item => item.id_producto.toString()}
                        contentContainerStyle={{ padding: SPACING.lg }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.searchCard} onPress={() => addProductToOrder(item)}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.nombre_producto}</Text>
                                    <Text style={styles.itemPrice}>{formatCurrency(item.precio)}</Text>
                                </View>
                                <MaterialCommunityIcons name="plus-circle" size={24} color={COLORS.primary} />
                            </TouchableOpacity>
                        )}
                    />
                </SafeAreaView>
            </Modal>

            <Modal visible={clientModalVisible} animationType="slide">
                <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setClientModalVisible(false)} style={styles.backBtn}>
                            <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.modalSearch}
                            placeholder="Buscar cliente..."
                            placeholderTextColor={COLORS.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>
                    <FlatList
                        data={filteredClients}
                        keyExtractor={item => item.id_cliente.toString()}
                        contentContainerStyle={{ padding: SPACING.lg }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.searchCard}
                                onPress={() => {
                                    setPedido({ ...pedido, id_cliente: item.id_cliente, nombre_cliente: item.nombre_cliente });
                                    setClientModalVisible(false);
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.nombre_cliente}</Text>
                                    <Text style={styles.itemSubText}>{item.telefono || 'Sin teléfono'}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        )}
                    />
                </SafeAreaView>
            </Modal>

            {/* Payment Method Bottom Sheet */}
            <Modal visible={paymentModalVisible} transparent animationType="slide">
                <View style={styles.bottomSheetOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setPaymentModalVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Método de Pago</Text>
                        {paymentMethods.map(m => (
                            <TouchableOpacity
                                key={m.id}
                                style={[styles.optionItem, pedido.metodo_pago === m.id && styles.optionSelected]}
                                onPress={() => {
                                    setPedido({ ...pedido, metodo_pago: m.id });
                                    setPaymentModalVisible(false);
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={m.icon}
                                    size={24}
                                    color={pedido.metodo_pago === m.id ? COLORS.primary : COLORS.textSecondary}
                                />
                                <Text style={[styles.optionText, pedido.metodo_pago === m.id && styles.optionTextSelected]}>
                                    {m.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            <Modal visible={channelModalVisible} transparent animationType="slide">
                <View style={styles.bottomSheetOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setChannelModalVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Canal de Venta</Text>
                        {allCanales.map(c => (
                            <TouchableOpacity
                                key={c.id_canal}
                                style={[styles.optionItem, pedido.id_canal === c.id_canal && styles.optionSelected]}
                                onPress={() => {
                                    setPedido({ ...pedido, id_canal: c.id_canal, nombre_canal: c.nombre_canal });
                                    setChannelModalVisible(false);
                                }}
                            >
                                <MaterialCommunityIcons name="store-outline" size={24} color={pedido.id_canal === c.id_canal ? COLORS.primary : COLORS.textSecondary} />
                                <Text style={[styles.optionText, pedido.id_canal === c.id_canal && styles.optionTextSelected]}>{c.nombre_canal}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
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
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textTertiary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surfaceSecondary,
        paddingVertical: 14,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    selectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectorText: {
        fontSize: 15,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
        marginLeft: 12,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: FONT_WEIGHTS.black,
        marginLeft: 6,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    prodName: {
        fontSize: 15,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
    },
    prodPrice: {
        fontSize: 14,
        color: COLORS.primary,
        marginTop: 2,
    },
    qtyControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceSecondary,
        padding: 4,
        borderRadius: BORDER_RADIUS.md,
    },
    qtyBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.sm,
    },
    qtyText: {
        width: 30,
        textAlign: 'center',
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    smallEmptyText: {
        fontSize: 14,
        color: COLORS.textTertiary,
        marginTop: 8,
    },
    shippingSection: {
        marginTop: 16,
    },
    shippingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    shippingInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceSecondary,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.md,
        width: 140,
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.primary,
        marginRight: 4,
    },
    shippingInput: {
        flex: 1,
        height: 48,
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        textAlign: 'right',
    },
    notesInput: {
        backgroundColor: COLORS.surfaceSecondary,
        borderRadius: BORDER_RADIUS.lg,
        padding: 16,
        height: 100,
        textAlignVertical: 'top',
        fontSize: 15,
        color: COLORS.textPrimary,
    },
    footer: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    summaryLabel: {
        fontSize: 11,
        color: COLORS.textTertiary,
        fontWeight: FONT_WEIGHTS.black,
        textTransform: 'uppercase',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
    },
    summaryDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
        marginHorizontal: 15,
    },
    totalLabel: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: FONT_WEIGHTS.black,
        textTransform: 'uppercase',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.primary,
    },
    mainButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: BORDER_RADIUS.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.black,
        letterSpacing: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 17, 30, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    syncText: {
        marginTop: 12,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHTS.bold,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        padding: 8,
    },
    modalSearch: {
        flex: 1,
        height: 44,
        backgroundColor: COLORS.surfaceSecondary,
        borderRadius: BORDER_RADIUS.round,
        paddingHorizontal: 16,
        marginLeft: 12,
        color: COLORS.textPrimary,
    },
    searchCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    itemName: {
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
    },
    itemPrice: {
        fontSize: 15,
        color: COLORS.primary,
        marginTop: 4,
    },
    itemSubText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        marginBottom: 20,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    optionSelected: {
        backgroundColor: COLORS.surfaceSecondary,
        borderRadius: BORDER_RADIUS.md,
    },
    optionText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        marginLeft: 12,
    },
    optionTextSelected: {
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.primary,
    },
});

export default NuevoPedidoScreen;

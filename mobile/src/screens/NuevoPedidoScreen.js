import React, { useState, useEffect } from 'react';
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
    ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getProductos, getClientes, getCanales, createPedido, updatePedidoFull, getPedidoById } from '../services/database';
import { processAutoSync } from '../services/network';

const NuevoPedidoScreen = ({ navigation, route }) => {
    const editId = route.params?.id_pedido;
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

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
        notas: '',
        productos: [] // {id_producto, nombre, precio, cantidad}
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
        const existingIdx = pedido.productos.findIndex(p => p.id_producto === prod.id_producto);
        if (existingIdx >= 0) {
            const newProds = [...pedido.productos];
            newProds[existingIdx].cantidad += 1;
            setPedido({ ...pedido, productos: newProds });
        } else {
            setPedido({
                ...pedido,
                productos: [...pedido.productos, {
                    id_producto: prod.id_producto,
                    nombre: prod.nombre_producto,
                    precio: prod.precio,
                    cantidad: 1,
                    unique_key: `new-${Date.now()}-${prod.id_producto}`
                }]
            });
        }
        setProductModalVisible(false);
    };

    const updateQuantity = (id_producto, delta) => {
        const newProds = pedido.productos.map(p => {
            if (p.id_producto === id_producto) {
                return { ...p, cantidad: Math.max(0, p.cantidad + delta) };
            }
            return p;
        }).filter(p => p.cantidad > 0);
        setPedido({ ...pedido, productos: newProds });
    };

    const calculateSubtotal = () => {
        return pedido.productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    };

    const handleSave = async () => {
        if (!pedido.id_cliente) return Alert.alert('Error', 'Selecciona un cliente');
        if (pedido.productos.length === 0) return Alert.alert('Error', 'Agrega al menos un producto');

        setIsSyncing(true);
        try {
            const subtotal = calculateSubtotal();
            const total = subtotal + parseFloat(pedido.costo_envio || 0);

            if (editId) {
                await updatePedidoFull(editId, { ...pedido, subtotal, total });
            } else {
                await createPedido({ ...pedido, subtotal, total, estado: 'pendiente' });
            }

            // Sync with cloud
            await processAutoSync();

            Alert.alert('Éxito', editId ? 'Pedido actualizado' : 'Pedido registrado', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                }
            ]);
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar: ' + error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    const filteredProducts = allProductos.filter(p =>
        p.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredClients = allClientes.filter(c =>
        c.nombre_cliente.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const subtotal = calculateSubtotal();
    const total = subtotal + parseFloat(pedido.costo_envio || 0);

    return (
        <SafeAreaView style={styles.safeContainer}>
            {isSyncing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#6c5ce7" />
                    <Text style={{ marginTop: 15, fontWeight: '700', color: '#1a1a1a' }}>Sincronizando con la nube...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
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
                                <MaterialCommunityIcons name="account-circle-outline" size={24} color="#6c5ce7" />
                                <Text style={[styles.selectorText, pedido.id_cliente ? {} : { color: '#b2bec3' }]}>
                                    {pedido.nombre_cliente}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#b2bec3" />
                        </TouchableOpacity>

                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.label}>Canal de Venta</Text>
                            <TouchableOpacity
                                style={styles.selector}
                                onPress={() => setChannelModalVisible(true)}
                            >
                                <View style={styles.selectorLeft}>
                                    <MaterialCommunityIcons name="storefront-outline" size={24} color="#636e72" />
                                    <Text style={styles.selectorText}>{pedido.nombre_canal}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-down" size={20} color="#b2bec3" />
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
                                <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                                <Text style={styles.addButtonText}>Agregar</Text>
                            </TouchableOpacity>
                        </View>

                        {pedido.productos.map((item, index) => (
                            <View key={item.unique_key || `${item.id_producto}-${index}`} style={styles.productItem}>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{item.nombre}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.productPrice}>${item.precio.toLocaleString()}</Text>
                                        <Text style={{ color: '#b2bec3', fontSize: 12, marginHorizontal: 4 }}>•</Text>
                                        <Text style={{ fontSize: 13, color: '#6c5ce7', fontWeight: '700' }}>
                                            ${(item.precio * item.cantidad).toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.qtyControls}>
                                    <TouchableOpacity
                                        onPress={() => updateQuantity(item.id_producto, -1)}
                                        style={[styles.qtyIconBtn, { backgroundColor: '#fdf0f1' }]}
                                    >
                                        <MaterialCommunityIcons name="minus" size={18} color="#ff3b30" />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyValue}>{item.cantidad}</Text>
                                    <TouchableOpacity
                                        onPress={() => updateQuantity(item.id_producto, 1)}
                                        style={[styles.qtyIconBtn, { backgroundColor: '#f0f9f1' }]}
                                    >
                                        <MaterialCommunityIcons name="plus" size={18} color="#34c759" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        {pedido.productos.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="cart-variant" size={48} color="#f1f3f5" />
                                <Text style={styles.emptyText}>Sin productos agregados</Text>
                                <Text style={{ color: '#b2bec3', fontSize: 12, marginTop: 4 }}>Toca "Agregar" para comenzar</Text>
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
                                    color="#636e72"
                                />
                                <Text style={styles.selectorText}>
                                    {paymentMethods.find(m => m.id === pedido.metodo_pago)?.name || 'Efectivo'}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-down" size={20} color="#b2bec3" />
                        </TouchableOpacity>

                        <View style={styles.shippingSection}>
                            <View style={styles.shippingHeader}>
                                <Text style={styles.label}>Costo de Envío</Text>
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
                                    />
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.label, { marginTop: 16 }]}>Notas</Text>
                        <TextInput
                            style={styles.notesInput}
                            multiline
                            placeholder="Instrucciones adicionales..."
                            placeholderTextColor="#b2bec3"
                            value={pedido.notas}
                            onChangeText={(t) => setPedido({ ...pedido, notas: t })}
                        />
                    </View>
                </ScrollView>

                {/* Sticky Footer */}
                <View style={[styles.footer, styles.shadow]}>
                    <View style={styles.summaryRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>${subtotal.toLocaleString()}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.totalLabel}>Total a Cobrar</Text>
                            <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.mainButton, { opacity: isSyncing ? 0.6 : 1 }]}
                        onPress={handleSave}
                        disabled={isSyncing}
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

                {/* Modals */}
                <Modal visible={productModalVisible} animationType="fade">
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setProductModalVisible(false)} style={styles.backBtn}>
                                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.modalSearch}
                                placeholder="Escribe el nombre del producto..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                        </View>
                        <FlatList
                            data={filteredProducts}
                            keyExtractor={item => item.id_producto.toString()}
                            contentContainerStyle={{ padding: 16 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.searchCard} onPress={() => addProductToOrder(item)}>
                                    <View>
                                        <Text style={styles.itemName}>{item.nombre_producto}</Text>
                                        <Text style={styles.itemPrice}>${item.precio.toLocaleString()}</Text>
                                        <Text style={styles.itemSub}>Stock Disponible: --</Text>
                                    </View>
                                    <View style={{ backgroundColor: '#f0f9f1', padding: 8, borderRadius: 12 }}>
                                        <MaterialCommunityIcons name="plus" size={24} color="#34c759" />
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </SafeAreaView>
                </Modal>

                <Modal visible={clientModalVisible} animationType="fade">
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setClientModalVisible(false)} style={styles.backBtn}>
                                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.modalSearch}
                                placeholder="Escribe el nombre del cliente..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                        </View>
                        <FlatList
                            data={filteredClients}
                            keyExtractor={item => item.id_cliente.toString()}
                            contentContainerStyle={{ padding: 16 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.searchCard}
                                    onPress={() => {
                                        setPedido({ ...pedido, id_cliente: item.id_cliente, nombre_cliente: item.nombre_cliente });
                                        setClientModalVisible(false);
                                    }}
                                >
                                    <View>
                                        <Text style={styles.itemName}>{item.nombre_cliente}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                            <MaterialCommunityIcons name="phone-outline" size={14} color="#8e8e93" />
                                            <Text style={[styles.itemSub, { marginTop: 0, marginLeft: 4 }]}>
                                                {item.telefono || 'Sin teléfono'}
                                            </Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#e9e9eb" />
                                </TouchableOpacity>
                            )}
                        />
                    </SafeAreaView>
                </Modal>

                {/* Bottom Sheet - Payment */}
                <Modal visible={paymentModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setPaymentModalVisible(false)} />
                        <View style={styles.sheet}>
                            <View style={styles.sheetHandle} />
                            <Text style={styles.sheetTitle}>Método de Pago</Text>
                            {paymentMethods.map(m => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={[styles.option, pedido.metodo_pago === m.id && styles.optionSelected]}
                                    onPress={() => {
                                        setPedido({ ...pedido, metodo_pago: m.id });
                                        setPaymentModalVisible(false);
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={m.icon}
                                        size={24}
                                        color={pedido.metodo_pago === m.id ? '#6c5ce7' : '#636e72'}
                                    />
                                    <Text style={[styles.optionText, pedido.metodo_pago === m.id && styles.optionTextSelected]}>
                                        {m.name}
                                    </Text>
                                    {pedido.metodo_pago === m.id && <MaterialCommunityIcons name="check-bold" size={20} color="#6c5ce7" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>

                {/* Bottom Sheet - Channel */}
                <Modal visible={channelModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setChannelModalVisible(false)} />
                        <View style={styles.sheet}>
                            <View style={styles.sheetHandle} />
                            <Text style={styles.sheetTitle}>Canal de Venta</Text>
                            {allCanales.map(c => (
                                <TouchableOpacity
                                    key={c.id_canal}
                                    style={[styles.option, pedido.id_canal === c.id_canal && styles.optionSelected]}
                                    onPress={() => {
                                        setPedido({ ...pedido, id_canal: c.id_canal, nombre_canal: c.nombre_canal });
                                        setChannelModalVisible(false);
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="bullhorn-outline"
                                        size={24}
                                        color={pedido.id_canal === c.id_canal ? '#6c5ce7' : '#636e72'}
                                    />
                                    <Text style={[styles.optionText, pedido.id_canal === c.id_canal && styles.optionTextSelected]}>
                                        {c.nombre_canal}
                                    </Text>
                                    {pedido.id_canal === c.id_canal && <MaterialCommunityIcons name="check-bold" size={20} color="#6c5ce7" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#fdfdfd' },
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 150 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f3f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2
    },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 },
    label: { fontSize: 11, fontWeight: '800', color: '#8e8e93', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f3f5'
    },
    selectorLeft: { flexDirection: 'row', alignItems: 'center' },
    selectorText: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginLeft: 12 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6c5ce7',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        shadowColor: '#6c5ce7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    addButtonText: { color: '#fff', fontWeight: '800', fontSize: 13, marginLeft: 6 },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5'
    },
    productInfo: { flex: 1 },
    productName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
    productPrice: { fontSize: 13, color: '#636e72', fontWeight: '600', marginTop: 3 },
    qtyControls: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
    qtyIconBtn: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    qtyValue: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginHorizontal: 16, minWidth: 24, textAlign: 'center' },
    emptyContainer: { alignItems: 'center', padding: 24 },
    emptyText: { color: '#b2bec3', marginTop: 12, fontSize: 14, fontWeight: '600' },
    shippingSection: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f3f5' },
    shippingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    shippingInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#f1f3f5' },
    currencySymbol: { color: '#6c5ce7', fontWeight: '800', fontSize: 15 },
    shippingInput: { paddingVertical: 10, paddingHorizontal: 4, width: 90, fontSize: 16, fontWeight: '800', color: '#1a1a1a', textAlign: 'right' },
    notesInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        color: '#1a1a1a',
        marginTop: 16,
        height: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#f1f3f5'
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingTop: 16,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f5'
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 24
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    summaryLabel: { fontSize: 11, fontWeight: '800', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryValue: { fontSize: 16, fontWeight: '700', color: '#636e72' },
    divider: { height: 24, width: 1, backgroundColor: '#f1f3f5', marginHorizontal: 16 },
    totalLabel: { fontSize: 12, fontWeight: '800', color: '#6c5ce7', textTransform: 'uppercase' },
    totalValue: { fontSize: 26, fontWeight: '900', color: '#1a1a1a' },
    mainButton: {
        backgroundColor: '#1a1a1a',
        flexDirection: 'row',
        height: 62,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8
    },
    mainButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
    backBtn: { padding: 8, marginRight: 8 },
    modalSearch: { flex: 1, backgroundColor: '#f8f9fa', padding: 12, borderRadius: 16, fontSize: 16, color: '#1a1a1a' },
    searchCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f3f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1
    },
    itemName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
    itemPrice: { color: '#00b894', fontWeight: '800', marginTop: 4, fontSize: 15 },
    itemSub: { color: '#8e8e93', fontSize: 13, marginTop: 4, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 48 },
    sheetHandle: { width: 40, height: 5, backgroundColor: '#e9e9eb', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
    sheetTitle: { fontSize: 19, fontWeight: '800', color: '#1a1a1a', marginBottom: 24, textAlign: 'center' },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 18,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: 'transparent'
    },
    optionSelected: { backgroundColor: '#f3f0ff', borderColor: '#6c5ce7' },
    optionText: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginLeft: 16 },
    optionTextSelected: { color: '#6c5ce7' },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999
    }
});

export default NuevoPedidoScreen;


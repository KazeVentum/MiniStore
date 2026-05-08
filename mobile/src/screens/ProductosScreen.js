import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, RefreshControl, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { getProductos, createProducto, updateProducto, getCategorias, deleteProducto } from '../services/database';
import { processAutoSync } from '../services/network';
import { performFullSync } from '../services/sync';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_WEIGHTS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

const ProductosScreen = () => {
    const { isTablet, getGridColumns, scaleFont } = useResponsive();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProducto, setEditingProducto] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form inputs
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [idCategoria, setIdCategoria] = useState(null);
    const [allCategorias, setAllCategorias] = useState([]);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);

    const loadProductos = async () => {
        try {
            const data = await getProductos();
            setProductos(data.rows);

            const cats = await getCategorias();
            setAllCategorias(cats.rows);
        } catch (error) {
            console.error('Error loading products/categories:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadProductos();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await performFullSync();
            await loadProductos();
        } catch (error) {
            console.error('Sync failed in Productos:', error);
            setRefreshing(false);
        }
    };

    const handleOpenModal = (producto = null) => {
        if (producto) {
            setEditingProducto(producto);
            setNombre(producto.nombre_producto);
            setPrecio(producto.precio.toString());
            setDescripcion(producto.descripcion || '');
            setIdCategoria(producto.id_categoria);
        } else {
            setEditingProducto(null);
            setNombre('');
            setPrecio('');
            setDescripcion('');
            setIdCategoria(allCategorias.length > 0 ? allCategorias[0].id_categoria : null);
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!nombre.trim()) return Alert.alert('Error', 'El nombre es obligatorio');
        if (!precio || isNaN(parseFloat(precio))) return Alert.alert('Error', 'Ingresa un precio válido');

        try {
            const productData = {
                nombre_producto: nombre,
                precio: parseFloat(precio),
                descripcion,
                id_categoria: idCategoria
            };

            if (editingProducto) {
                await updateProducto({ ...productData, id_producto: editingProducto.id_producto });
            } else {
                await createProducto(productData);
            }

            setModalVisible(false);
            processAutoSync();
            await loadProductos();
        } catch (error) {
            console.error('Error saving product:', error);
            Alert.alert('Error', 'No se pudo guardar el producto');
        }
    };

    const handleDelete = async () => {
        if (!editingProducto) return;

        Alert.alert(
            'Eliminar Producto',
            '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProducto(editingProducto.id_producto);
                            setModalVisible(false);
                            processAutoSync();
                            await loadProductos();
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            Alert.alert('Error', 'No se pudo eliminar el producto');
                        }
                    }
                }
            ]
        );
    };


    const filteredProductos = productos.filter(p =>
        p.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };

    const renderItem = ({ item }) => {
        const cardWidth = isTablet ? `${100 / getGridColumns(1, 2, 3)}%` : '100%';

        return (
            <View style={{ width: cardWidth, paddingHorizontal: 5 }}>
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.7}
                    onPress={() => handleOpenModal(item)}
                >
                    <View style={styles.info}>
                        <View style={styles.headerRow}>
                            <Text style={styles.name} numberOfLines={1}>{item.nombre_producto}</Text>
                            {item.id_producto > 100000 && (
                                <View style={styles.localTag}>
                                    <Text style={styles.localTagText}>L</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.description} numberOfLines={1}>
                            {item.descripcion || 'Sin descripción'}
                        </Text>
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{formatCurrency(item.precio)}</Text>
                    </View>

                    <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.surfaceSecondary} style={{ marginLeft: 4 }} />
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
            <View style={[styles.searchBar, SHADOWS.soft]}>
                <View style={styles.searchInner}>
                    <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar producto..."
                        placeholderTextColor={COLORS.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredProductos}
                renderItem={renderItem}
                keyExtractor={item => item.id_producto.toString()}
                contentContainerStyle={[styles.list, { paddingBottom: 110 }]}
                numColumns={isTablet ? getGridColumns(1, 2, 3) : 1}
                key={isTablet ? 'tablet-list' : 'mobile-list'}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="package-variant" size={60} color={COLORS.surfaceSecondary} />
                        <Text style={styles.emptyText}>No hay productos</Text>
                        <Text style={styles.emptySubText}>Tira para sincronizar o crea uno nuevo.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, SHADOWS.heavy]}
                onPress={() => handleOpenModal()}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={30} color="#fff" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, SHADOWS.heavy]}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalTitle}>
                                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                            </Text>
                            {editingProducto && (
                                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                                    <MaterialCommunityIcons name="trash-can-outline" size={24} color={COLORS.error} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.inputWrap}>
                            <Text style={styles.inputLabel}>Nombre del Producto</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Escribe el nombre..."
                                placeholderTextColor={COLORS.textTertiary}
                                value={nombre}
                                onChangeText={setNombre}
                            />
                        </View>

                        <View style={styles.inputWrap}>
                            <Text style={styles.inputLabel}>Precio</Text>
                            <View style={styles.priceInputContainer}>
                                <Text style={styles.currencyPrefix}>$</Text>
                                <TextInput
                                    style={[styles.input, { flex: 1, backgroundColor: 'transparent' }]}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textTertiary}
                                    value={precio}
                                    onChangeText={setPrecio}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.inputWrap}>
                            <Text style={styles.inputLabel}>Descripción</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Detalles del producto..."
                                placeholderTextColor={COLORS.textTertiary}
                                value={descripcion}
                                onChangeText={setDescripcion}
                                multiline
                            />
                        </View>

                        <View style={styles.inputWrap}>
                            <Text style={styles.inputLabel}>Categoría</Text>
                            <TouchableOpacity
                                style={styles.selector}
                                onPress={() => setCategoryModalVisible(true)}
                            >
                                <Text style={[styles.selectorText, !idCategoria && { color: COLORS.textTertiary }]}>
                                    {allCategorias.find(c => c.id_categoria === idCategoria)?.nombre_categoria || 'Seleccionar Categoría'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.saveBtn]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveBtnText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Category Selector Sheet */}
            <Modal visible={categoryModalVisible} transparent animationType="slide">
                <View style={styles.bottomSheetOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setCategoryModalVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Categorías</Text>
                        <FlatList
                            data={allCategorias}
                            keyExtractor={item => item.id_categoria.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.optionItem, idCategoria === item.id_categoria && styles.optionSelected]}
                                    onPress={() => {
                                        setIdCategoria(item.id_categoria);
                                        setCategoryModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.optionText, idCategoria === item.id_categoria && styles.optionTextSelected]}>
                                        {item.nombre_categoria}
                                    </Text>
                                    {idCategoria === item.id_categoria && (
                                        <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    searchBar: {
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        zIndex: 10,
    },
    searchInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceSecondary,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.lg,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHTS.medium,
    },
    list: {
        padding: SPACING.md,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    info: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 16,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
        flex: 1,
    },
    localTag: {
        backgroundColor: COLORS.primary + '15',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    localTagText: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.primary,
    },
    description: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontWeight: FONT_WEIGHTS.medium,
    },
    priceContainer: {
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
        marginLeft: 10,
    },
    price: {
        fontSize: 15,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.primary,
    },
    empty: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textSecondary,
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: COLORS.textTertiary,
        marginTop: 8,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 25,
        bottom: 120,
        backgroundColor: COLORS.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl * 1.5,
        borderTopRightRadius: BORDER_RADIUS.xl * 1.5,
        padding: SPACING.xl,
        paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: COLORS.surfaceSecondary,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
    },
    deleteBtn: {
        padding: 5,
    },
    inputWrap: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textTertiary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: COLORS.surfaceSecondary,
        borderRadius: BORDER_RADIUS.lg,
        padding: 14,
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHTS.medium,
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceSecondary,
        borderRadius: BORDER_RADIUS.lg,
        paddingLeft: 14,
    },
    currencyPrefix: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: FONT_WEIGHTS.black,
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceSecondary,
        padding: 14,
        borderRadius: BORDER_RADIUS.lg,
    },
    selectorText: {
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHTS.medium,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalBtn: {
        flex: 1,
        height: 55,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: {
        marginRight: 10,
        backgroundColor: COLORS.surfaceSecondary,
    },
    saveBtn: {
        marginLeft: 10,
        backgroundColor: COLORS.primary,
    },
    cancelBtnText: {
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHTS.bold,
        fontSize: 15,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: FONT_WEIGHTS.black,
        fontSize: 15,
    },
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl * 1.5,
        borderTopRightRadius: BORDER_RADIUS.xl * 1.5,
        padding: SPACING.xl,
        paddingBottom: Platform.OS === 'ios' ? 50 : 30,
        maxHeight: '70%',
    },
    sheetTitle: {
        fontSize: 19,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: 4,
    },
    optionSelected: {
        backgroundColor: COLORS.primary + '10',
    },
    optionText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHTS.medium,
    },
    optionTextSelected: {
        color: COLORS.primary,
        fontWeight: FONT_WEIGHTS.bold,
    },
});

export default ProductosScreen;

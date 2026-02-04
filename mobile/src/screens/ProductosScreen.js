import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { getProductos, createProducto, updateProducto, getCategorias } from '../services/database';
import { processAutoSync } from '../services/network';
import { performFullSync } from '../services/sync';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProductosScreen = () => {
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

    const filteredProductos = productos.filter(p =>
        p.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleOpenModal(item)}>
            <View style={styles.info}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{item.nombre_producto}</Text>
                    {item.id_producto > 100000 && <Text style={styles.tempTag}>Local</Text>}
                </View>
                <Text style={styles.description} numberOfLines={2}>{item.descripcion || 'Sin descripción'}</Text>
            </View>
            <View style={styles.rightSide}>
                <View style={styles.priceTag}>
                    <Text style={styles.price}>${item.precio?.toLocaleString()}</Text>
                </View>
                <Text style={styles.editIcon}>✏️</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredProductos}
                renderItem={renderItem}
                keyExtractor={item => item.id_producto.toString()}
                contentContainerStyle={[styles.list, { paddingBottom: 110 }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No hay productos que coincidan.</Text>
                        <Text style={styles.emptySubText}>Tira para sincronizar o crea uno nuevo.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => handleOpenModal()}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre del Producto"
                            value={nombre}
                            onChangeText={setNombre}
                        />

                        <View style={styles.priceInputContainer}>
                            <Text style={styles.currencyPrefix}>$</Text>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="Precio"
                                value={precio}
                                onChangeText={setPrecio}
                                keyboardType="numeric"
                            />
                        </View>

                        <TextInput
                            style={[styles.input, { height: 80, marginTop: 15 }]}
                            placeholder="Descripción"
                            value={descripcion}
                            onChangeText={setDescripcion}
                            multiline
                        />

                        <Text style={styles.label}>Categoría</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setCategoryModalVisible(true)}
                        >
                            <Text style={styles.selectorText}>
                                {allCategorias.find(c => c.id_categoria === idCategoria)?.nombre_categoria || 'Seleccionar Categoría'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

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
                </View>
            </Modal>

            {/* Category Selector Modal */}
            <Modal visible={categoryModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setCategoryModalVisible(false)} />
                    <View style={styles.sheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Seleccionar Categoría</Text>
                        <FlatList
                            data={allCategorias}
                            keyExtractor={item => item.id_categoria.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.option, idCategoria === item.id_categoria && styles.optionSelected]}
                                    onPress={() => {
                                        setIdCategoria(item.id_categoria);
                                        setCategoryModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.optionText, idCategoria === item.id_categoria && styles.optionTextSelected]}>
                                        {item.nombre_categoria}
                                    </Text>
                                    {idCategoria === item.id_categoria && <MaterialCommunityIcons name="check" size={20} color="#2196F3" />}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    priceTag: {
        backgroundColor: '#e7f5ff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#228be6',
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
    },
    searchBar: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        backgroundColor: '#f1f3f5',
        padding: 12,
        borderRadius: 10,
        fontSize: 15,
    },
    rightSide: {
        alignItems: 'flex-end',
    },
    editIcon: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    tempTag: {
        fontSize: 10,
        backgroundColor: '#E3F2FD',
        color: '#2196F3',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
        marginLeft: 10,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 120,
        backgroundColor: '#2196F3',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee',
        fontSize: 16,
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        paddingLeft: 15,
    },
    currencyPrefix: {
        fontSize: 16,
        color: '#666',
        marginRight: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalBtn: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelBtn: {
        marginRight: 10,
        backgroundColor: '#f1f1f1',
    },
    saveBtn: {
        marginLeft: 10,
        backgroundColor: '#2196F3',
    },
    cancelBtnText: {
        color: '#666',
        fontWeight: 'bold',
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
        marginTop: 10
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        maxHeight: '70%',
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 15,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
    },
    optionSelected: {
        backgroundColor: '#f0f7ff',
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    optionText: {
        fontSize: 16,
        color: '#444',
    },
    optionTextSelected: {
        color: '#2196F3',
        fontWeight: 'bold',
    }
});

export default ProductosScreen;

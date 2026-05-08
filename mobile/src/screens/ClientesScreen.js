import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, RefreshControl, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/database';
import { processAutoSync } from '../services/network';
import { performFullSync } from '../services/sync';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_WEIGHTS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

const ClientesScreen = () => {
    const { isTablet, getGridColumns, scaleFont } = useResponsive();
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form inputs
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [notas, setNotas] = useState('');

    const loadClientes = async () => {
        try {
            const data = await getClientes();
            setClientes(data.rows);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadClientes();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await performFullSync();
            await loadClientes();
        } catch (error) {
            console.error('Sync failed in Clientes:', error);
            setRefreshing(false);
        }
    };

    const handleOpenModal = (cliente = null) => {
        if (cliente) {
            setEditingCliente(cliente);
            setNombre(cliente.nombre_cliente);
            setTelefono(cliente.telefono || '');
            setDireccion(cliente.direccion || '');
            setNotas(cliente.notas || '');
        } else {
            setEditingCliente(null);
            setNombre('');
            setTelefono('');
            setDireccion('');
            setNotas('');
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!nombre.trim()) return Alert.alert('Error', 'El nombre es obligatorio');

        try {
            const clientData = {
                nombre_cliente: nombre,
                telefono,
                direccion,
                notas
            };

            if (editingCliente) {
                await updateCliente({ ...clientData, id_cliente: editingCliente.id_cliente });
            } else {
                await createCliente(clientData);
            }

            setModalVisible(false);
            processAutoSync();
            await loadClientes();
        } catch (error) {
            console.error('Error saving client:', error);
            Alert.alert('Error', 'No se pudo guardar el cliente');
        }
    };

    const handleDelete = async () => {
        if (!editingCliente) return;

        Alert.alert(
            'Eliminar Cliente',
            '¿Estás seguro de que deseas eliminar este cliente? No podrás verlo en la lista, pero sus pedidos históricos se mantendrán.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCliente(editingCliente.id_cliente);
                            setModalVisible(false);
                            processAutoSync();
                            await loadClientes();
                        } catch (error) {
                            console.error('Error deleting client:', error);
                            Alert.alert('Error', 'No se pudo eliminar el cliente');
                        }
                    }
                }
            ]
        );
    };


    const getAvatarColor = (name) => {
        const colors = ['#FF4081', '#7C4DFF', '#00BCD4', '#4CAF50', '#FFC107', '#FF5722'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const renderItem = ({ item }) => {
        const cardWidth = isTablet ? `${100 / getGridColumns(1, 2, 3)}%` : '100%';
        const avatarColor = getAvatarColor(item.nombre_cliente);
        const initials = item.nombre_cliente.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        return (
            <View style={{ width: cardWidth, paddingHorizontal: 5 }}>
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.7}
                    onPress={() => handleOpenModal(item)}
                >
                    <View style={[styles.clientAvatar, { backgroundColor: avatarColor + '20' }]}>
                        <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.headerRow}>
                            <Text style={styles.name}>{item.nombre_cliente}</Text>
                            {item.id_cliente > 100000 && (
                                <View style={styles.localTag}>
                                    <Text style={styles.localTagText}>L</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="phone-outline" size={14} color={COLORS.textTertiary} />
                            <Text style={styles.detailText}>{item.telefono || 'Sin teléfono'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.textTertiary} />
                            <Text style={styles.detailText} numberOfLines={1}>{item.direccion || 'Sin dirección'}</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.surfaceSecondary} />
                </TouchableOpacity>
            </View>
        );
    };

    const filteredClientes = clientes.filter(c =>
        c.nombre_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.telefono && c.telefono.includes(searchQuery))
    );

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
                    <MaterialCommunityIcons name="account-search" size={20} color={COLORS.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar cliente..."
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
                data={filteredClientes}
                renderItem={renderItem}
                keyExtractor={item => item.id_cliente.toString()}
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
                        <MaterialCommunityIcons name="account-search-outline" size={60} color={COLORS.surfaceSecondary} />
                        <Text style={styles.emptyText}>No hay clientes</Text>
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
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalTitle}>
                                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </Text>
                            {editingCliente && (
                                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                                    <MaterialCommunityIcons name="trash-can-outline" size={24} color={COLORS.error} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.inputWrap}>
                            <Text style={styles.inputLabel}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre completo"
                                placeholderTextColor={COLORS.textTertiary}
                                value={nombre}
                                onChangeText={setNombre}
                            />
                        </View>

                        <View style={styles.inputWrap}>
                            <Text style={styles.inputLabel}>Teléfono</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="WhatsApp / Celular"
                                placeholderTextColor={COLORS.textTertiary}
                                value={telefono}
                                onChangeText={setTelefono}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputWrap}>
                            <Text style={styles.inputLabel}>Dirección</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Dirección de envío"
                                placeholderTextColor={COLORS.textTertiary}
                                value={direccion}
                                onChangeText={setDireccion}
                            />
                        </View>

                        <View style={styles.inputWrap}>
                            <Text style={styles.inputLabel}>Notas</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Observaciones..."
                                placeholderTextColor={COLORS.textTertiary}
                                value={notas}
                                onChangeText={setNotas}
                                multiline
                            />
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
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    clientAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
        borderWidth: 2,
        borderColor: '#ffffff10',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: FONT_WEIGHTS.black,
    },
    info: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
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
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    detailText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginLeft: 6,
        fontWeight: FONT_WEIGHTS.medium,
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
        marginTop: 10,
    },
    modalTitle: {
        fontSize: 22,
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
});

export default ClientesScreen;

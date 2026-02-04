import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { getClientes, createCliente, updateCliente } from '../services/database';
import { processAutoSync } from '../services/network';
import { performFullSync } from '../services/sync';

const ClientesScreen = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);

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

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleOpenModal(item)}>
            <View style={styles.info}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{item.nombre_cliente}</Text>
                    {item.id_cliente > 100000 && <Text style={styles.tempTag}>Local</Text>}
                </View>
                <Text style={styles.detail}>📞 {item.telefono || 'Sin teléfono'}</Text>
                <Text style={styles.detail}>📍 {item.direccion || 'Sin dirección'}</Text>
            </View>
            <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={clientes}
                renderItem={renderItem}
                keyExtractor={item => item.id_cliente.toString()}
                contentContainerStyle={[styles.list, { paddingBottom: 110 }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No hay clientes locales.</Text>
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
                            {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre Completo"
                            value={nombre}
                            onChangeText={setNombre}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Teléfono"
                            value={telefono}
                            onChangeText={setTelefono}
                            keyboardType="phone-pad"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Dirección"
                            value={direccion}
                            onChangeText={setDireccion}
                        />

                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="Notas / Observaciones"
                            value={notas}
                            onChangeText={setNotas}
                            multiline
                        />

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
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    detail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
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
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 120,
        backgroundColor: '#4CAF50',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
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
        backgroundColor: '#4CAF50',
    },
    cancelBtnText: {
        color: '#666',
        fontWeight: 'bold',
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tempTag: {
        fontSize: 10,
        backgroundColor: '#E8F5E9',
        color: '#4CAF50',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    editIcon: {
        fontSize: 16,
        color: '#bbb',
    }
});

export default ClientesScreen;

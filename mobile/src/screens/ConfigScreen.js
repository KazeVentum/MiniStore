import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { processAutoSync } from '../services/network';
import { getBackendUrl, saveBackendUrl } from '../services/config';

const ConfigScreen = ({ navigation }) => {
    const [syncing, setSyncing] = useState(false);
    const [backendUrl, setBackendUrl] = useState('');
    const [isSavingUrl, setIsSavingUrl] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        const url = await getBackendUrl();
        setBackendUrl(url);
    };

    const handleSaveUrl = async () => {
        setIsSavingUrl(true);
        try {
            await saveBackendUrl(backendUrl);
            Alert.alert('Éxito', 'URL del servidor actualizada correctamente.');
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la URL.');
        } finally {
            setIsSavingUrl(false);
        }
    };

    const handleSyncPedidos = async () => {
        setSyncing(true);
        try {
            await processAutoSync();
            Alert.alert('Sincronización', 'Se ha intentado subir los pedidos pendientes. Revisa el Dashboard para ver el estado.');
        } catch (error) {
            Alert.alert('Error', 'No se pudo iniciar la sincronización.');
        } finally {
            setSyncing(false);
        }
    };

    const options = [
        {
            title: 'Sincronización Manual',
            subtitle: 'Forzar descarga de datos desde Supabase',
            icon: '🔄',
            onPress: () => navigation.navigate('Sync'),
            color: '#4dabf7'
        },
        {
            title: 'Subir Pedidos Pendientes',
            subtitle: 'Enviar ventas locales a la nube ahora',
            icon: '☁️',
            onPress: handleSyncPedidos,
            color: '#40c057',
            isLoading: syncing
        },
        {
            title: 'Test Supabase',
            subtitle: 'Verificar conexión con la nube',
            icon: '🧪',
            onPress: () => navigation.navigate('SupabaseTest'),
            color: '#2196F3'
        },
        {
            title: 'Test SQLite Local',
            subtitle: 'Verificar base de datos interna',
            icon: '💾',
            onPress: () => navigation.navigate('SqliteTest'),
            color: '#673AB7'
        }
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 110 }}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Configuración</Text>
                <Text style={styles.subtitle}>Herramientas del Sistema</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Servidor Local (Backend)</Text>
                <View style={styles.urlCard}>
                    <Text style={styles.label}>URL del API:</Text>
                    <TextInput
                        style={styles.input}
                        value={backendUrl}
                        onChangeText={setBackendUrl}
                        placeholder="http://192.168.1.XX:3000/api"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={handleSaveUrl}
                        disabled={isSavingUrl}
                    >
                        {isSavingUrl ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>Guardar URL</Text>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.helpText}>
                        Asegúrate de que tu celular y PC estén en el mismo Wi-Fi.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Acciones</Text>
                {options.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={item.onPress}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                            <Text style={styles.icon}>{item.icon}</Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                        </View>
                        {item.isLoading ? (
                            <ActivityIndicator size="small" color={item.color} />
                        ) : (
                            <Text style={styles.arrow}>›</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={styles.version}>MiniStore Mobile v1.2.1</Text>
                <Text style={styles.legal}>Desarrollado con ❤️ para Bisutería App</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    subtitle: {
        fontSize: 14,
        color: '#636e72',
        marginTop: 5,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#636e72',
        marginBottom: 10,
        marginLeft: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    urlCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    label: {
        fontSize: 12,
        color: '#636e72',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f1f3f5',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#2d3436',
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginBottom: 12,
    },
    saveButton: {
        backgroundColor: '#228be6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    helpText: {
        fontSize: 11,
        color: '#adb5bd',
        marginTop: 10,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 2,
    },
    arrow: {
        fontSize: 20,
        color: '#b2bec3',
        fontWeight: 'bold',
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    version: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#b2bec3',
    },
    legal: {
        fontSize: 10,
        color: '#dfe6e9',
        marginTop: 5,
    }
});

export default ConfigScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    subtitle: {
        fontSize: 14,
        color: '#636e72',
        marginTop: 5,
    },
    section: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 2,
    },
    arrow: {
        fontSize: 20,
        color: '#b2bec3',
        fontWeight: 'bold',
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    version: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#b2bec3',
    },
    legal: {
        fontSize: 10,
        color: '#dfe6e9',
        marginTop: 5,
    }
});

export default ConfigScreen;

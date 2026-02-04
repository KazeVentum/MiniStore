import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { processAutoSync } from '../services/network';

const ConfigScreen = ({ navigation }) => {
    const [syncing, setSyncing] = useState(false);

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
                <Text style={styles.version}>MiniStore Mobile v1.2.0</Text>
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

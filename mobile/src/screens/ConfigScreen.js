import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Platform, SafeAreaView } from 'react-native';
import { processAutoSync } from '../services/network';
import { getBackendUrl, saveBackendUrl } from '../services/config';
import { localApi } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_WEIGHTS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

const ConfigScreen = ({ navigation }) => {
    const { isTablet, scaleFont } = useResponsive();
    const [syncing, setSyncing] = useState(false);
    const [backendUrl, setBackendUrl] = useState('');
    const [isSavingUrl, setIsSavingUrl] = useState(false);
    const [isTestingUrl, setIsTestingUrl] = useState(false);

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

    const handleTestConnection = async () => {
        setIsTestingUrl(true);
        const isOk = await localApi.testConnection();
        setIsTestingUrl(false);

        if (isOk) {
            Alert.alert('Conexión Exitosa', 'El servidor local está respondiendo correctamente. ✅');
        } else {
            Alert.alert('Error de Conexión', 'No se pudo contactar al servidor. Asegúrate de que la IP sea correcta y que tu PC esté en la misma red Wi-Fi. ❌');
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
            subtitle: 'Descarga masiva desde Supabase',
            icon: 'database-sync-outline',
            onPress: () => navigation.navigate('Sync'),
            color: COLORS.primary
        },
        {
            title: 'Subir Pendientes',
            subtitle: 'Enviar ventas locales a la nube',
            icon: 'cloud-upload-outline',
            onPress: handleSyncPedidos,
            color: COLORS.success,
            isLoading: syncing
        },
        {
            title: 'Test Cloud',
            subtitle: 'Verificar conexión Supabase',
            icon: 'cloud-check-outline',
            onPress: () => navigation.navigate('SupabaseTest'),
            color: COLORS.secondary
        },
        {
            title: 'Test Interno',
            subtitle: 'Verificar SQLite local',
            icon: 'database-outline',
            onPress: () => navigation.navigate('SqliteTest'),
            color: COLORS.textSecondary
        }
    ];

    return (
        <SafeAreaView style={styles.safeContainer}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Configuración</Text>
                    <Text style={styles.headerSubtitle}>Herramientas del Sistema</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Servidor Local</Text>
                    <View style={[styles.urlCard, SHADOWS.soft]}>
                        <View style={styles.inputHeader}>
                            <MaterialCommunityIcons name="server-network" size={18} color={COLORS.primary} />
                            <Text style={styles.inputLabel}>Endpoint API</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={backendUrl}
                            onChangeText={setBackendUrl}
                            placeholder="http://192.168.1.XX:3000/api"
                            placeholderTextColor={COLORS.textTertiary}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.btn, styles.saveBtn, isSavingUrl && styles.btnDisabled]}
                                onPress={handleSaveUrl}
                                disabled={isSavingUrl}
                            >
                                {isSavingUrl ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Guardar</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.btn, styles.testBtn, isTestingUrl && styles.btnDisabled]}
                                onPress={handleTestConnection}
                                disabled={isTestingUrl}
                            >
                                {isTestingUrl ? (
                                    <ActivityIndicator color={COLORS.primary} size="small" />
                                ) : (
                                    <Text style={styles.testBtnText}>Probar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.tipBox}>
                            <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.textTertiary} />
                            <Text style={styles.helpText}>
                                Asegúrate de estar en la misma red Wi-Fi para usar el servidor local.
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                    <View style={styles.optionsGrid}>
                        {options.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.optionCard, SHADOWS.soft]}
                                onPress={item.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                                    <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
                                </View>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionTitle}>{item.title}</Text>
                                    <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                                </View>
                                {item.isLoading ? (
                                    <ActivityIndicator size="small" color={item.color} />
                                ) : (
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.surfaceSecondary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.logoBadge}>
                        <MaterialCommunityIcons name="lightning-bolt" size={20} color={COLORS.primary} />
                        <Text style={styles.version}>MINISTORE v1.2.5</Text>
                    </View>
                    <Text style={styles.legal}>Lina Edition • 2026</Text>
                </View>
            </ScrollView>
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
    header: {
        padding: SPACING.xl,
        paddingTop: 30,
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        ...SHADOWS.soft,
    },
    title: {
        fontSize: 28,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
        fontWeight: FONT_WEIGHTS.medium,
    },
    section: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textTertiary,
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    urlCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
    input: {
        backgroundColor: COLORS.surfaceSecondary,
        borderRadius: BORDER_RADIUS.lg,
        padding: 14,
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHTS.medium,
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
    },
    btn: {
        flex: 1,
        height: 48,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
    },
    testBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: FONT_WEIGHTS.black,
        fontSize: 14,
    },
    testBtnText: {
        color: COLORS.primary,
        fontWeight: FONT_WEIGHTS.black,
        fontSize: 14,
    },
    tipBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.surfaceSecondary,
    },
    helpText: {
        fontSize: 11,
        color: COLORS.textTertiary,
        marginLeft: 8,
        flex: 1,
        fontWeight: FONT_WEIGHTS.medium,
    },
    optionsGrid: {
        gap: 10,
    },
    optionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.textPrimary,
    },
    optionSubtitle: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginTop: 2,
        fontWeight: FONT_WEIGHTS.medium,
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    logoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceSecondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 10,
    },
    version: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.black,
        color: COLORS.textSecondary,
        marginLeft: 6,
        letterSpacing: 1,
    },
    legal: {
        fontSize: 11,
        color: COLORS.textTertiary,
        fontWeight: FONT_WEIGHTS.medium,
    }
});

export default ConfigScreen;

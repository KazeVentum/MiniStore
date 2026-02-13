import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import SupabaseTestScreen from '../screens/SupabaseTestScreen';
import SqliteTestScreen from '../screens/SqliteTestScreen';
import SyncScreen from '../screens/SyncScreen';
import ConfigScreen from '../screens/ConfigScreen';
import RealProductosScreen from '../screens/ProductosScreen';
import RealClientesScreen from '../screens/ClientesScreen';
import RealPedidosScreen from '../screens/PedidosScreen';
import RealNuevoPedidoScreen from '../screens/NuevoPedidoScreen';
import ResumenVentasScreen from '../screens/ResumenVentasScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = ({ navigation }) => {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: true,
      tabBarHideOnKeyboard: true,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textTertiary,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 5,
      },
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        height: 90,
        paddingBottom: 25,
        paddingTop: 8,
      },
      headerStyle: {
        backgroundColor: COLORS.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      },
      headerTitleStyle: {
        color: COLORS.textPrimary,
        fontWeight: '900',
      },
    }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Pedidos"
        component={RealPedidosScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="package-variant-closed" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Productos"
        component={RealProductosScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="necklace" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={RealClientesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Ajustes"
        component={ConfigScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTitleStyle: {
          color: COLORS.textPrimary,
          fontWeight: '900',
        },
        headerTintColor: COLORS.primary,
      }}>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="NuevoPedido" component={RealNuevoPedidoScreen} options={{ title: 'Crear Pedido' }} />
        <Stack.Screen name="Sync" component={SyncScreen} options={{ title: 'Sincronización' }} />
        <Stack.Screen name="SupabaseTest" component={SupabaseTestScreen} options={{ title: 'Test Supabase' }} />
        <Stack.Screen name="SqliteTest" component={SqliteTestScreen} options={{ title: 'Test SQLite' }} />
        <Stack.Screen name="ResumenVentas" component={ResumenVentasScreen} options={{ title: 'Resumen de Ventas' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

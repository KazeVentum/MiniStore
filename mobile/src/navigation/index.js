import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const MainTabs = () => {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: true,
      tabBarHideOnKeyboard: true,
      tabBarActiveTintColor: '#2d3436',
      tabBarInactiveTintColor: '#b2bec3',
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '900',
        marginBottom: 10,
      },
      tabBarStyle: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        height: 75,
        borderRadius: 25,
        backgroundColor: '#ffffff',
        borderTopWidth: 0,
        paddingTop: 10,

        // Shadows for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,

        // Shadows for Android
        elevation: 10,
      },
    }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="Pedidos"
        component={RealPedidosScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>📦</Text> }}
      />
      <Tab.Screen
        name="Productos"
        component={RealProductosScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>💍</Text> }}
      />
      <Tab.Screen
        name="Clientes"
        component={RealClientesScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>👤</Text> }}
      />
      <Tab.Screen
        name="Ajustes"
        component={ConfigScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>⚙️</Text> }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="NuevoPedido" component={RealNuevoPedidoScreen} options={{ title: 'Crear Pedido' }} />
        <Stack.Screen name="Sync" component={SyncScreen} options={{ title: 'Sincronización' }} />
        <Stack.Screen name="SupabaseTest" component={SupabaseTestScreen} options={{ title: 'Test Supabase' }} />
        <Stack.Screen name="SqliteTest" component={SqliteTestScreen} options={{ title: 'Test SQLite' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

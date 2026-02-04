import React from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// 1. Imports from real screen files
import SupabaseTestScreen from '../screens/SupabaseTestScreen';
import SqliteTestScreen from '../screens/SqliteTestScreen';
import SyncScreen from '../screens/SyncScreen';
import RealProductosScreen from '../screens/ProductosScreen';
import RealClientesScreen from '../screens/ClientesScreen';
import RealPedidosScreen from '../screens/PedidosScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 2. Local auxiliary screens (NOT duplicated)
const DashboardScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>MiniStore Mobile</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 30 }}>Dashboard</Text>

      <View style={{ gap: 15, width: '100%' }}>
        <View style={{ backgroundColor: '#4CAF50', padding: 15, borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>🟢 Estado: Online</Text>
        </View>

        <TouchableOpacity
          style={{ backgroundColor: '#4dabf7', padding: 18, borderRadius: 12 }}
          onPress={() => navigation.navigate('Sync')}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>🔄 Sincronizar Datos</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#2196F3', padding: 15, borderRadius: 12 }}
            onPress={() => navigation.navigate('SupabaseTest')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>🧪 Supabase</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#673AB7', padding: 15, borderRadius: 12 }}
            onPress={() => navigation.navigate('SqliteTest')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>💾 SQLite</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={{ marginTop: 40, color: '#999', fontSize: 12 }}>Versión 1.2.0-dev</Text>
    </ScrollView>
  );
};

const NuevoPedidoScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Nuevo Pedido Screen</Text></View>
);

// 3. Main Tab Navigation
const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: true }}>
    <Tab.Screen name="Resumen" component={DashboardScreen} />
    <Tab.Screen name="Productos" component={RealProductosScreen} />
    <Tab.Screen name="Clientes" component={RealClientesScreen} />
    <Tab.Screen name="Pedidos" component={RealPedidosScreen} />
  </Tab.Navigator>
);

// 4. Root Stack Navigation
const Navigation = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="NuevoPedido" component={NuevoPedidoScreen} />
      <Stack.Screen name="SupabaseTest" component={SupabaseTestScreen} options={{ title: 'Test Supabase' }} />
      <Stack.Screen name="SqliteTest" component={SqliteTestScreen} options={{ title: 'Test SQLite Local' }} />
      <Stack.Screen name="Sync" component={SyncScreen} options={{ title: 'Sincronización' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default Navigation;

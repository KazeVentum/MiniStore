# MiniStore Mobile Development Roadmap

**Proyecto:** MiniStore Mobile App (Expo React Native)  
**Objetivo:** App Android para creación de pedidos offline con sincronización a Supabase  
**Backend:** Local (localhost:3000) con fallback directo a Supabase  
**Fecha Inicio:** 2026-02-03  
**Estado:** 🟡 En Progreso (Avanzado)

---

## 📋 Arquitectura Decidida

### **Estrategia de Conexión:**
- **Backend local:** Siempre primer intento (cuando estás en casa) - *En implementación lógica de failover*
- **Fallback Supabase:** Acceso directo a BD cuando backend no disponible (Configurado y funcionando)
- **Sin configuración de router:** Máxima simplicidad
- **Modo híbrido:** Mejor experiencia sin complicaciones de red

### **Datos Offline:**
- ✅ Lista completa de productos (cache local)
- ✅ Lista completa de clientes (cache local)  
- ✅ Creación de pedidos offline
- ✅ Sincronización automática al detectar conexión

### **Notificaciones:**
- ❌ Solo para fechas límite de pedidos
- ❌ Funcionamiento offline
- ❌ Recordatorios programados localmente

---

## 🚀 Fase 0: Preparación del Repositorio

### **Tarea 0.1: Estructura del Proyecto**
- [x] Crear directorio `/mobile/` en el repo
- [x] Inicializar proyecto Expo React Native
- [x] Configurar `package.json` con dependencias necesarias
- [x] Crear estructura de carpetas base
- [x] Configurar `app.json` para Android

### **Tarea 0.2: Configuración Básica**
- [x] Setup de variables de entorno
- [x] Configurar ESLint y Prettier
- [x] Crear archivos de configuración inicial
- [x] Actualizar `AGENTS.md` con info móvil
- [x] Crear `mobile-roadmap.md` (este archivo)

### **Tarea 0.3: Sistema de Documentación**
- [x] Crear `mobile-agent-history.md` para historial de agentes
- [x] Documentar estructura de decisiones arquitectónicas
- [x] Crear guía de contexto para nuevos agentes

---

## 🗄️ Fase 1: Base de Datos Local y Configuración

### **Tarea 1.1: Configuración Supabase Mobile**
- [x] Instalar `@supabase/supabase-js` para React Native
- [x] Configurar cliente Supabase con credenciales del `.env`
- [x] Test de conexión a Supabase
- [x] Configurar sistema de acceso a datos (SupabaseProvider)

### **Tarea 1.2: SQLite Local Database**
- [x] Instalar `expo-sqlite` (ya configurado)
- [x] Diseñar esquema SQLite equivalente a PostgreSQL
- [x] Crear scripts de migración de datos (inicialización de tablas)
- [x] Implementar funciones CRUD básicas
- [x] Test de operaciones locales (vía SqliteTestScreen)

### **Tarea 1.3: Mapeo de Tipos de Datos**
- [x] Implementar `transformToSupabase()` (SQLite → PostgreSQL) - *Integrado en sync logic*
- [x] Implementar `transformToSQLite()` (PostgreSQL → SQLite)
- [x] Crear sistema de validación de datos (basic types)
- [x] Implementar manejo de errores de conversión

---

## 🔄 Fase 2: Sistema de Sincronización

### **Tarea 2.1: Detección de Conexión**
- [x] Instalar `@react-native-community/netinfo`
- [x] Implementar hook `useConnectionStatus()` o similar (NetInfo listener)
- [x] Crear sistema de eventos de conexión/desconexión
- [ ] Implementar reintentos exponenciales
- [x] Test con escenarios de red

### **Tarea 2.2: Cola de Sincronización**
- [x] Diseñar estructura de cola pendiente (Flag `sincronizado = 0`)
- [x] Implementar `processAutoSync()` para subida de datos
- [x] Sistema de prioridades (clientes/productos antes que pedidos)
- [x] Manejo de errores y reintentos (background process)

### **Tarea 2.3: Estrategia Híbrida de Backend**
- [ ] Implementar `tryLocalBackend()` (localhost:3000)
- [x] Implementar `supabaseDirectSync()` (fallback/directo)
- [ ] Sistema de failover automático entre local y Supabase
- [x] Logging de source de sincronización

### **Tarea 2.4: Manejo de Conflictos**
- [x] Implementar estrategia "last modified wins" (simple rewrite)
- [x] Sistema de detección de IDs temporales (>100.000)
- [x] Resolución automática al obtener IDs reales de Supabase

---

## 📱 Fase 3: Interfaz de Usuario Móvil

### **Tarea 3.1: Navegación y Estructura**
- [x] Instalar y configurar `@react-navigation/native`
- [x] Crear Stack Navigator principal
- [x] Implementar Tab Navigation (Estilo moderno flotante)
- [x] Diseñar sistema de header consistente

### **Tarea 3.2: Pantalla Principal (Dashboard)**
- [x] Componente `DashboardScreen`
- [x] Indicador de estado de conexión (Online/Offline badge)
- [x] Resumen de pedidos pendientes de sincronizar
- [x] Estadísticas rápidas (Ventas hoy, Top productos)
- [x] Acceso rápido a crear pedido

### **Tarea 3.3: Gestión de Productos**
- [x] Pantalla `ProductosScreen` con lista completa
- [x] Búsqueda y filtrado de productos
- [x] Sistema de categorías
- [x] Edición y creación de productos locales

### **Tarea 3.4: Gestión de Clientes**
- [x] Pantalla `ClientesScreen` con lista completa
- [x] Búsqueda de clientes por nombre/teléfono
- [x] Formulario de creación rápida de cliente
- [x] Edición de clientes locales

### **Tarea 3.5: Creación de Pedidos**
- [x] Formulario completo `NuevoPedidoScreen`
- [x] Selección de cliente (búsqueda modal)
- [x] Agregar productos al pedido con selector de cantidad
- [x] Cálculo automático de totales
- [x] Configuración de fecha límite y envío
- [x] Validación antes de guardar

### **Tarea 3.6: Lista de Pedidos**
- [x] Pantalla `PedidosScreen` con todos los pedidos
- [x] Indicadores visuales de sincronización (nube)
- [x] Ver detalles de pedido
- [x] Pull-to-refresh para sincronización manual (Full Sync)

---

## 🔔 Fase 4: Sistema de Notificaciones

### **Tarea 4.1: Configuración de Notificaciones**
- [ ] Instalar `expo-notifications`
- [ ] Solicitar permisos de notificación
- [ ] Configurar canales de notificación
- [ ] Setup de notificaciones programadas

### **Tarea 4.2: Lógica de Recordatorios**
- [ ] Implementar `checkOrderDeadlines()`
- [ ] Sistema de checkeo diario/automático
- [ ] Notificaciones 24h antes de vencimiento

### **Tarea 4.3: Manejo de Estados**
- [ ] Marcar pedidos como notificados
- [ ] Cancelar notificaciones de pedidos completados
- [ ] Reschedule cuando cambia fecha límite

---

## 🎨 Fase 5: UI/UX y Estilos

### **Tarea 5.1: Sistema de Diseño**
- [x] Implementar estilos consistentes con colores y tipografías
- [x] Componentes UI reutilizables (Cards, Badges, Modales)
- [x] Sistema de iconos (Emoji-based por ahora, funcional)
- [x] Diseño responsive para diferentes pantallas

### **Tarea 5.2: Componentes Comunes**
- [x] Botones con variantes
- [x] Inputs con validación básica
- [x] Modales de selección (Clientes/Productos)
- [x] Indicadores de estado de red

### **Tarea 5.3: Estados y Loading**
- [/] Componentes de loading (Pull-to-refresh implementado)
- [x] Estados vacíos (empty states)
- [x] Indicadores de sincronización en tiempo real

---

## 🧪 Fase 6: Testing y Calidad

### **Tarea 6.1: Tests Unitarios**
- [ ] Setup de Jest para React Native
- [ ] Tests de utilidades de transformación de datos
- [ ] Tests de lógica de sincronización

---

## 📦 Fase 7: Build y Despliegue

### **Tarea 7.1: Configuración de Build**
- [ ] Setup de Expo EAS Build
- [ ] Configurar `eas.json` para Android
- [ ] Configurar iconos y splash screen (Faltan assets finales)

### **Tarea 7.2: Build de APK**
- [ ] Ejecutar build de desarrollo para testing
- [ ] Build final de producción (.apk)

---

## 📊 Métricas de Progreso

### **Total de Tareas:** 78
### **Completadas:** 45
### **En Progreso:** 5
### **Bloqueadas:** 0

### **Progreso por Fase:**
- ✅ 🏗️ Fase 0: 13/13 (100%) COMPLETADA
- ✅ 🗄️ Fase 1: 15/15 (100%) COMPLETADA
- 🔄 Fase 2: 4/8 (50%) EN PROGRESO
- 📱 Fase 3: 10/10 (100%) COMPLETADA (Core features)
- 🔔 Fase 4: 0/6 (0%) PENDIENTE
- 🎨 Fase 5: 3/5 (60%) EN PROGRESO
- 🧪 Fase 6: 0/5 (0%)
- 📦 Fase 7: 0/5 (0%)
- 🔧 Fase 8: 3/15 (20%)

---

**Última Actualización:** 2026-02-05 por AI Agent  
**Próximo Objetivo:** Iniciar Fase 4 (Notificaciones)

# MiniStore Mobile Development Roadmap

**Proyecto:** MiniStore Mobile App (Expo React Native)  
**Objetivo:** App Android para creación de pedidos offline con sincronización a Supabase  
**Backend:** Local (localhost:3000) con fallback directo a Supabase  
**Fecha Inicio:** 2026-02-03  
**Estado:** 🟡 En Progreso

---

## 📋 Arquitectura Decidida

### **Estrategia de Conexión:**
- **Backend local:** Siempre primer intento (cuando estás en casa)
- **Fallback Supabase:** Acceso directo a BD cuando backend no disponible
- **Sin configuración de router:** Máxima simplicidad
- **Modo híbrido:** Mejor experiencia sin complicaciones de red

### **Datos Offline:**
- ✅ Lista completa de productos (cache local)
- ✅ Lista completa de clientes (cache local)  
- ✅ Creación de pedidos offline
- ✅ Sincronización automática al detectar conexión

### **Notificaciones:**
- ✅ Solo para fechas límite de pedidos
- ✅ Funcionamiento offline
- ✅ Recordatorios programados localmente

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
- [ ] Configurar autenticación (si es necesaria)
- [ ] Setup de Realtime subscriptions

### **Tarea 1.2: SQLite Local Database**
- [x] Instalar `expo-sqlite` (ya configurado)
- [x] Diseñar esquema SQLite equivalente a PostgreSQL
- [x] Crear scripts de migración de datos (inicialización de tablas)
- [x] Implementar funciones CRUD básicas
- [x] Test de operaciones locales (vía SqliteTestScreen)

### **Tarea 1.3: Mapeo de Tipos de Datos**
- [x] Implementar `transformToSupabase()` (SQLite → PostgreSQL)
- [x] Implementar `transformToSQLite()` (PostgreSQL → SQLite)
- [x] Crear sistema de validación de datos (basic types)
- [/] Implementar manejo de errores de conversión
- [ ] Tests unitarios de transformación

---

## 🔄 Fase 2: Sistema de Sincronización

### **Tarea 2.1: Detección de Conexión**
- [ ] Instalar `@react-native-community/netinfo`
- [/] Implementar hook `useConnectionStatus()` (Placeholder UI en Dashboard)
- [ ] Crear sistema de eventos de conexión/desconexión
- [ ] Implementar reintentos exponenciales
- [ ] Test con escenarios de red

### **Tarea 2.2: Cola de Sincronización**
- [ ] Diseñar estructura de cola pendiente
- [ ] Implementar `addToSyncQueue()`
- [ ] Implementar `processSyncQueue()`
- [ ] Sistema de prioridades (pedidos > otros datos)
- [ ] Manejo de errores y reintentos

### **Tarea 2.3: Estrategia Híbrida de Backend**
- [ ] Implementar `tryLocalBackend()` (localhost:3000)
- [ ] Implementar `supabaseDirectSync()` (fallback)
- [ ] Sistema de failover automático
- [ ] Logging de source de sincronización
- [ ] Test de ambos caminos

### **Tarea 2.4: Manejo de Conflictos**
- [ ] Implementar estrategia "last modified wins"
- [ ] Sistema de detección de conflictos
- [ ] Resolución automática para diferentes tipos
- [ ] Logging de conflictos resueltos
- [ ] Tests de casos extremos

---

## 📱 Fase 3: Interfaz de Usuario Móvil

### **Tarea 3.1: Navegación y Estructura**
- [ ] Instalar y configurar `@react-navigation/native`
- [ ] Crear Stack Navigator principal
- [ ] Implementar Tab Navigation
- [ ] Configurar Deep Linking
- [ ] Diseñar sistema de header consistente

### **Tarea 3.2: Pantalla Principal (Dashboard)**
- [ ] Componente `DashboardScreen`
- [ ] Indicador de estado de conexión
- [ ] Resumen de pedidos pendientes
- [ ] Estado de sincronización
- [ ] Acceso rápido a crear pedido

### **Tárea 3.3: Gestión de Productos**
- [ ] Pantalla `ProductosScreen` con lista completa
- [ ] Búsqueda y filtrado de productos
- [ ] Detalles de producto con imagen
- [ ] Sistema de categorías
- [ ] Carga y cache de imágenes

### **Tarea 3.4: Gestión de Clientes**
- [ ] Pantalla `ClientesScreen` con lista completa
- [ ] Búsqueda de clientes por nombre/teléfono
- [ ] Detalles de cliente con historial
- [ ] Formulario de creación rápida de cliente
- [ ] Cache local de datos

### **Tarea 3.5: Creación de Pedidos**
- [ ] Formulario completo `NuevoPedidoScreen`
- [ ] Selección de cliente (búsqueda incluida)
- [ ] Agregar productos al pedido
- [ ] Cálculo automático de totales
- [ ] Configuración de fecha límite
- [ ] Validación antes de guardar

### **Tarea 3.6: Lista de Pedidos**
- [ ] Pantalla `PedidosScreen` con todos los pedidos
- [ ] Filtros por estado y fecha
- [ ] Indicadores visuales de sincronización
- [ ] Acciones rápidas (ver, editar, eliminar)
- [ ] Pull-to-refresh para sincronización manual

---

## 🔔 Fase 4: Sistema de Notificaciones

### **Tarea 4.1: Configuración de Notificaciones**
- [ ] Instalar `expo-notifications`
- [ ] Solicitar permisos de notificación
- [ ] Configurar canales de notificación
- [ ] Setup de notificaciones programadas
- [ ] Manejo de estados de notificación

### **Tarea 4.2: Lógica de Recordatorios**
- [ ] Implementar `checkOrderDeadlines()`
- [ ] Sistema de checkeo diario
- [ ] Notificaciones 24h antes de vencimiento
- [ ] Evitar notificaciones duplicadas
- [ ] Formato de mensajes personalizados

### **Tárea 4.3: Manejo de Estados**
- [ ] Marcar pedidos como notificados
- [ ] Cancelar notificaciones de pedidos completados
- [ ] Reschedule cuando cambia fecha límite
- [ ] Persistencia de estado de notificaciones
- [ ] Test de casos extremos

---

## 🎨 Fase 5: UI/UX y Estilos

### **Tarea 5.1: Sistema de Diseño**
- [ ] Crear `theme.js` con colores y tipografías
- [ ] Implementar `styles.js` consistente
- [ ] Componentes UI reutilizables
- [ ] Sistema de iconos (react-native-vector-icons)
- [ ] Diseño responsive para diferentes pantallas

### **Tarea 5.2: Componentes Comunes**
- [ ] `Button` component con variantes
- [ ] `Input` component con validación
- [ ] `Card` component para listas
- [ ] `Modal` component para formularios
- [ ] `Badge` component para estados

### **Tárea 5.3: Estados y Loading**
- [ ] Componentes de loading y skeleton
- [ ] Estados vacíos (empty states)
- [ ] Indicadores de error
- [ ] Estados de conexión/sincronización
- [ ] Animaciones y transiciones

---

## 🧪 Fase 6: Testing y Calidad

### **Tarea 6.1: Tests Unitarios**
- [ ] Setup de Jest para React Native
- [ ] Tests de utilidades de transformación de datos
- [ ] Tests de lógica de sincronización
- [ ] Tests de hooks personalizados
- [ ] Tests de componentes UI básicos

### **Tarea 6.2: Tests de Integración**
- [ ] Tests de flujo completo de sincronización
- [ ] Tests de creación de pedido offline → online
- [ ] Tests de notificaciones programadas
- [ ] Tests de escenarios de pérdida de conexión
- [ ] Tests de manejo de errores

### **Tarea 6.3: Testing Manual**
- [ ] Test en dispositivo físico Android
- [ ] Testing de conexión/desconexión real
- [ ] Testing de notificaciones en background
- [ ] Testing de uso intensivo de memoria
- [ ] Testing de battery consumption

---

## 📦 Fase 7: Build y Despliegue

### **Tarea 7.1: Configuración de Build**
- [ ] Setup de Expo EAS Build
- [ ] Configurar `eas.json` para Android
- [ ] Configurar iconos y splash screen
- [ ] Setup de app signing para Android
- [ ] Configurar permisos en AndroidManifest

### **Tarea 7.2: Build de APK**
- [ ] Ejecutar build de desarrollo para testing
- [ ] Corregir errores de build
- [ ] Optimizar tamaño de APK
- [ ] Build final de producción
- [ ] Verificar firma y permisos

### **Tárea 7.3: Distribución**
- [ ] Instalar APK en dispositivo de prueba
- [ ] Testing final de todas las funcionalidades
- [ ] Documentación de instalación y uso
- [ ] Crear backup del APK final
- [ ] Documentación para mantenimiento futuro

---

## 🔧 Fase 8: Documentación y Manutención

### **Tarea 8.1: Documentación Técnica**
- [x] Actualizar `AGENTS.md` con sección móvil completa
- [ ] Documentar API endpoints utilizados
- [ ] Crear guía de troubleshooting común
- [ ] Documentar proceso de build y despliegue
- [x] Crear README específico para el proyecto móvil

### **Tarea 8.2: Guía de Usuario**
- [ ] Manual de instalación del APK
- [ ] Guía de uso principal
- [ ] Explicación de sincronización offline
- [ ] Configuración de notificaciones
- [ ] Solución de problemas comunes

### **Tárea 8.3: Manutención**
- [ ] Documentar proceso de actualización
- [ ] Setup de monitoreo de errores
- [ ] Proceso de actualización de dependencias
- [ ] Estrategia de versionamiento
- [ ] Plan de backup y recuperación

---

## 📊 Métricas de Progreso

### **Total de Tareas:** 78
### **Completadas:** 15
### **En Progreso:** 1
### **Bloqueadas:** 0

### **Progreso por Fase:**
- ✅ 🏗️ Fase 0: 13/13 (100%) COMPLETADA
- 🗄️ Fase 1: 2/15 (13%) EN PROGRESO
- 🔄 Fase 2: 0/4 (0%)
- 📱 Fase 3: 0/6 (0%)
- 🔔 Fase 4: 0/3 (0%)
- 🎨 Fase 5: 0/3 (0%)
- 🧪 Fase 6: 0/3 (0%)
- 📦 Fase 7: 0/3 (0%)
- 🔧 Fase 8: 1/15 (7%)

---

## 📝 Notas Importantes

### **Decisiones Arquitectónicas:**
1. **Backend híbrido:** Local first, Supabase fallback
2. **Sin configuración de router:** Máxima simplicidad
3. **Datos offline:** Productos y clientes completos + pedidos creados
4. **Notificaciones:** Solo vencimientos, funcionan offline
5. **Conflicto resolution:** Last modified wins

### **Restricciones:**
- Solo Android (APK)
- Un solo usuario (novia)
- Backend local sin configuración de red compleja
- Desarrollo por un solo programador

### **Prioridades:**
1. Funcionalidad > Estética
2. Simplicidad > Complejidad  
3. Estabilidad > Performance
4. UX básica > UX avanzada

---

## 🤖 Instrucciones para Agentes AI

### **Para continuar el desarrollo:**
1. **Leer `mobile-agent-history.md`** para saber qué se hizo anteriormente
2. **Revisar este roadmap** para saber qué sigue
3. **Actualizar `mobile-agent-history.md`** con cada tarea completada
4. **Marcar tareas como completadas** en este roadmap
5. **Documentar decisiones y problemas** encontrados

### **Formato de Actualización:**
```markdown
## [Fecha] - [Nombre del Agente]

### Tareas Completadas:
- [x] Tarea específica completada

### Problemas Encontrados:
- Problema: descripción
- Solución: descripción

### Decisiones Tomadas:
- Decisión: explicación

### Siguientes Pasos:
- Próxima tarea a realizar
```

---

**Última Actualización:** 2026-02-03 por opencode  
**Próximo Agente:** Esperando continuar con Fase 0
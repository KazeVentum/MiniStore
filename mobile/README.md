# MiniStore Mobile

App móvil Expo React Native para gestión de pedidos offline con sincronización a Supabase.

## 🚀 Quick Start

### Requisitos Previos
- Node.js 18+ instalado
- Expo CLI: `npm install -g expo-cli`
- Android Studio (para Android SDK) o dispositivo Android físico
- Cuenta de Supabase configurada

### Instalación

1. **Navegar al directorio mobile:**
   ```bash
   cd mobile
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

4. **Editar `.env` con tus credenciales:**
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-anon-public-key-ey...
   LOCAL_BACKEND_URL=http://localhost:3000/api
   ```

### Ejecutar en Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# En dispositivo físico con Expo Go
# Escanear QR code desde la terminal

# O en Android
npm run android
```

## 📦 Generar APK

### Setup EAS Build

1. **Instalar EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login en Expo:**
   ```bash
   eas login
   ```

3. **Configurar proyecto:**
   ```bash
   eas build:configure
   ```

### Build APK para Android

```bash
# APK de desarrollo (más rápido)
eas build --platform android --profile development

# APK de producción
eas build --platform android --profile production
```

El APK generado se puede descargar e instalar directamente en dispositivos Android.

## 🏗️ Estructura del Proyecto

```
mobile/
├── src/
│   ├── components/      # Componentes UI reutilizables
│   ├── screens/         # Pantallas principales
│   ├── navigation/      # Configuración de navegación
│   ├── services/        # Servicios (Supabase, sync, etc.)
│   ├── hooks/           # Hooks personalizados
│   ├── store/           # State management (Zustand)
│   └── utils/           # Utilidades y helpers
├── assets/              # Imágenes, iconos
├── App.js               # Punto de entrada
├── app.json             # Configuración Expo
├── eas.json             # Configuración de build
└── package.json         # Dependencias
```

## 🔧 Scripts Disponibles

```bash
npm start          # Iniciar servidor de desarrollo
npm run android    # Ejecutar en Android (emulador o dispositivo)
npm run ios        # Ejecutar en iOS (solo Mac)
npm run web        # Ejecutar en navegador
npm run lint       # Ejecutar ESLint
```

## 📱 Características

- ✅ Creación de pedidos offline
- ✅ Sincronización automática con Supabase
- ✅ Fallback a backend local (localhost:3000)
- ✅ Notificaciones de vencimiento de pedidos
- ✅ Caché local de productos y clientes
- ✅ Indicadores visuales de estado de conexión

## 🛠️ Stack Tecnológico

- **Framework:** Expo SDK 50+
- **Platform:** React Native 0.73+
- **Database:** SQLite (local) + Supabase (cloud)
- **Navigation:** React Navigation 6
- **State:** Zustand
- **Data Fetching:** TanStack Query
- **Notifications:** Expo Notifications

## 📚 Documentación Adicional

- **Roadmap:** Ver `mobile-roadmap.md` para plan de desarrollo completo
- **Historial:** Ver `mobile-agent-history.md` para historial de desarrollo
- **Contexto General:** Ver `../AGENTS.md` para contexto del proyecto completo

## 🔗 Enlaces Útiles

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

## ⚠️ Notas Importantes

- Solo soporta Android en este momento
- Requiere conexión a backend local (localhost:3000) o Supabase
- Los datos offline se sincronizan automáticamente al detectar conexión
- Notificaciones funcionan offline

---

**Versión:** 1.0.0  
**Última Actualización:** 2026-02-03
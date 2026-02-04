# MiniStore ✨ (Lina)

¡Hola! Bienvenida a tu aplicación MiniStore. Esta es una plataforma integral para gestionar pedidos, productos y clientes, ahora 100% dockerizada.

## 🚀 Requisitos Previos

Asegúrate de tener:
1. **Docker Desktop** instalado y encendido.
2. Un archivo `.env` en la raíz con tus credenciales de Supabase:
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_APIKEY=tu-anon-public-key...
   ```

## 🛠️ Cómo iniciar el sistema completo

Para levantar el **Backend**, **Frontend** y el servidor de **Expo (Mobile)** al mismo tiempo:

1. Abre una terminal en la carpeta principal del proyecto.
2. Ejecuta el script de inicio (detecta tu IP automáticamente para el móvil):
   ```bash
   ./start.sh up --build

   Comando para mi: docker-compose up mobile
   ```

## 💎 Acceso a las Aplicaciones

| Componente | Dirección / Comando |
| :--- | :--- |
| **Frontend (Web)** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:3000](http://localhost:3000) |
| **App Móvil (Expo)** | `docker-compose logs -f mobile` (para ver el QR) |

### 📱 Instrucciones para la App Móvil
Cuando ejecutas `./start.sh up`, el servidor de Expo se inicia en **modo Túnel**. 
1. Busca el **Código QR** en la terminal.
2. Abre la app **Expo Go** en tu teléfono (Android o iOS).
3. Escanea el código QR o ingresa la URL que aparece en los logs.
4. ¡Listo! Todo lo que instales o cambies se procesa dentro del contenedor Docker, sin ensuciar tu PC.

## ⏹️ Detener el sistema
Para apagar todo:
```bash
./start.sh down
```

---

### Notas Importantes
- **Node.js**: No necesitas tener Node instalado en tu PC; Docker se encarga de todo.
- **Sincronización**: La app móvil sincroniza automáticamente con Supabase.
- **Limpieza**: Si necesitas reinstalar dependencias, usa `docker-compose build --no-cache`.

## 📚 Documentación Técnica

Para detalles profundos sobre la arquitectura, estructura de carpetas, convenciones de código y guías para agentes de IA, consulta:

👉 **[AGENTS.md](./AGENTS.md)**

Este documento es esencial para entender cómo está construido el sistema y cómo contribuir al desarrollo.

¡Disfruta tu MiniStore! 💖

---

### Registro de Cambios

#### [2.1.0] - 2026-02-04 (En Progreso)
-   **Mobile App (Fase 1):** Implementación de base de datos local SQLite para soporte offline-first.
-   **Mobile Sync:** Configuración de conexión híbrida (Backend Local + Fallback directo a Supabase).
-   **Infraestructura Móvil:** Estructura completa del proyecto React Native (Expo) con navegación y gestión de estado.

#### [2.0.0] - 2026-02-02
-   **Migración a Supabase:** Cambio total de MySQL local a base de datos en PostgreSQL nube (Supabase).
-   **Dockerización Pro:** Configuración de contenedores ligera (Frontend + Backend) sin base de datos local obligatoria.
-   **Scripts de Soporte:** Creación de scripts automáticos para exportar datos de versiones antiguas.

#### [1.9.1] - 2026-01-28
-   **UI Renovada:** Transformación del listado de pedidos a un diseño moderno de lista de tarjetas.
-   **Mejora Visual:** Implementación de "zebra striping" y efectos hover para mejor legibilidad.
-   **Accesibilidad:** Corrección de colores en badges para garantizar lectura óptima en modo claro y oscuro.
-   **Correcciones:** Eliminación de glitch de línea vertical y artefactos visuales en formularios.

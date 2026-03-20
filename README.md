# MiniStore

Plataforma integral para la gestión de pedidos, productos y clientes, completamente dockerizada.

## Requisitos Previos

Asegurate de tener:
1. **Docker Desktop** instalado y ejecutado.
2. Un archivo `.env` en la raiz con tus credenciales de Supabase:
   Para obtener estas credenciales:
   - Accede a tu proyecto en [Supabase](https://supabase.com/dashboard)
   - **SUPABASE_URL**: Settings → API → Project URL
   - **SUPABASE_APIKEY**: Settings → API → Anon Key (o Anon Key legacy)

## Como iniciar el sistema

Para levantar el **Backend**, **Frontend** y el servidor de **Expo (Mobile)** al mismo tiempo:

1. Abre una terminal en la carpeta principal del proyecto.
2. Ejecuta el script de inicio (detecta tu IP automaticamente para el movil):
   ```bash
   ./start.sh up --build
   ```

## Acceso a las Aplicaciones

| Componente | Direccion / Comando |
| :--- | :--- |
| **Frontend (Web)** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:3000](http://localhost:3000) |
| **App Movil (Expo)** | `docker-compose logs -f mobile` (para ver el QR) |

### Instrucciones para la App Movil
Cuando ejecutas `./start.sh up`, el servidor de Expo se inicia en **modo Tunel**. 
1. Busca el **Codigo QR** en la terminal.
2. Abre la app **Expo Go** en tu telefono (Android o iOS).
3. Escanea el codigo QR o ingresa la URL que aparece en los logs.
4. Listo. Todo lo que instales o cambies se procesa dentro del contenedor Docker, sin afectar tu sistema local.

## Detener el sistema
Para apagar todo:
```bash
./start.sh down
```

---

### Notas Importantes
- **Node.js**: No necesitas tener Node instalado en tu PC; Docker se encarga de todo.
- **Sincronizacion**: La app movil sincroniza automaticamente con Supabase.
- **Limpieza**: Si necesitas reinstalar dependencias, usa `docker-compose build --no-cache`.

## Documentacion Tecnica

Para detalles profundos sobre la arquitectura, estructura de carpetas, convenciones de codigo y guias para agentes de IA, consulta:

**[AGENTS.md](./AGENTS.md)**

Este documento es esencial para entender como esta construido el sistema y como contribuir al desarrollo.

---

### Registro de Cambios

#### [2.1.0] - 2026-02-04 (En Progreso)
-   **Mobile App (Fase 1):** Implementacion de base de datos local SQLite para soporte offline-first.
-   **Mobile Sync:** Configuracion de conexion hibrida (Backend Local + Fallback directo a Supabase).
-   **Infraestructura Movil:** Estructura completa del proyecto React Native (Expo) con navegacion y gestion de estado.

#### [2.0.0] - 2026-02-02
-   **Migracion a Supabase:** Cambio total de MySQL local a base de datos en PostgreSQL nube (Supabase).
-   **Dockerizacion Pro:** Configuracion de contenedores ligera (Frontend + Backend) sin base de datos local obligatoria.
-   **Scripts de Soporte:** Creacion de scripts automaticos para exportar datos de versiones antiguas.

#### [1.9.1] - 2026-01-28
-   **UI Renovada:** Transformacion del listado de pedidos a un diseno moderno de lista de tarjetas.
-   **Mejora Visual:** Implementacion de "zebra striping" y efectos hover para mejor legibilidad.
-   **Accesibilidad:** Correccion de colores en badges para garantizar lectura optima en modo claro y oscuro.
-   **Correcciones:** Eliminacion de glitch de linea vertical y artefactos visuales en formularios.

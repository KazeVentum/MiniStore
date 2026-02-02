# MiniStore ✨

¡Hola! Bienvenida a tu aplicación MiniStore. Aquí tienes una guía súper rápida para empezar.

## 🚀 Cómo empezar

1.  Asegúrate de tener **Docker Desktop** instalado y un archivo `.env` en la raíz con tus credenciales de Supabase:
    ```env
    SUPABASE_URL=https://tu-proyecto.supabase.co
    SUPABASE_APIKEY=tu-anon-public-key-ey...
    ```
2.  Abre una terminal en la carpeta del proyecto.
3.  Ejecuta:
    ```bash
    docker-compose up -d --build
    ```
4.  Espera a que los contenedores inicien.

## 💎 Cómo abrir la app (Día a día)

1.  **Frontend (Tu App):** http://localhost:5173
2.  **Backend API:** http://localhost:3000

Si necesitas detenerla:
```bash
docker-compose stop
```

---

### Notas
-   Docker es necesario que esté abierto para que la App funcione.
-   Si necesitas cerrar la app, simplemente en el apartado donde estaban los simbolos azules de play, da click en "Stop" y cierra Docker.

¡Disfruta tu MiniStore! 💖

---

### Registro de Cambios

#### [2.0.0] - 2026-02-02
-   **Migración a Supabase:** Cambio total de MySQL local a base de datos en PostgreSQL nube (Supabase).
-   **Dockerización Pro:** Configuración de contenedores ligera (Frontend + Backend) sin base de datos local obligatoria.
-   **Scripts de Soporte:** Creación de scripts automáticos para exportar datos de versiones antiguas.

#### [1.9.1] - 2026-01-28
-   **UI Renovada:** Transformación del listado de pedidos a un diseño moderno de lista de tarjetas.
-   **Mejora Visual:** Implementación de "zebra striping" y efectos hover para mejor legibilidad.
-   **Accesibilidad:** Corrección de colores en badges para garantizar lectura óptima en modo claro y oscuro.
-   **Correcciones:** Eliminación de glitch de línea vertical y artefactos visuales en formularios.

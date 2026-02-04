# MiniStore - AGENTS.md

Documento de contexto para asistentes de IA trabajando en el proyecto MiniStore.

---

## 1. Descripción del Proyecto

MiniStore es una aplicación fullstack para la gestión de una tienda de bisutería y artesanías. Permite gestionar productos, pedidos, clientes, y generar reportes de ventas.

**Versión actual:** 2.0.0

### Historial de Versiones

- **[2.0.0]** - 2026-02-02: Migración a Supabase (PostgreSQL cloud), Dockerización completa
- **[1.9.1]** - 2026-01-28: UI renovada con diseño moderno de lista de tarjetas

---

## 2. Arquitectura

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend   │────────▶│  Supabase   │
│  (React)    │  HTTP   │  (Express)  │   SQL   │ (PostgreSQL)│
│  Port:5173  │         │  Port:3000  │         │   Cloud     │
└─────────────┘         └─────────────┘         └─────────────┘
```

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express 5
- **Base de Datos:** Supabase (PostgreSQL en la nube)
- **Contenerización:** Docker + Docker Compose

---

## 3. Stack Tecnológico

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.0
- **Styling:** Tailwind CSS 3.3.5
- **Routing:** React Router DOM 6.20.0
- **State Management:** Zustand 4.4.0
- **Data Fetching:** TanStack Query (React Query) 5.0.0
- **HTTP Client:** Axios 1.6.0
- **Charts:** Recharts 2.9.0
- **Icons:** Lucide React 0.290.0
- **Linting:** ESLint 8.53.0

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5.2.0
- **Database:** Supabase (@supabase/supabase-js 2.93.3)
- **Middleware:** CORS 2.8.5
- **Environment:** dotenv 17.2.3
- **Dev Server:** Nodemon 3.1.11

### Mobile (Expo React Native)
- **Framework:** Expo SDK 50+
- **Platform:** React Native 0.73+
- **Database Local:** SQLite (expo-sqlite)
- **Backend Integration:** Supabase React Native Client
- **State Management:** Zustand (reutilizado de web)
- **Data Fetching:** TanStack Query React Native
- **Navigation:** React Navigation 6
- **Offline Sync:** Custom implementation
- **Notifications:** Expo Notifications
- **Network Detection:** React Native NetInfo
- **Build Tool:** Expo EAS Build

### Base de Datos
- **Engine:** PostgreSQL (via Supabase)
- **Tipo:** Cloud-hosted
- **ORM/Client:** Supabase JavaScript Client

### DevOps
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Reverse Proxy:** Nginx (frontend production)

---

## 4. Estructura de Carpetas

```
bisuteria-app/
├── backend/                    # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # Configuración Supabase
│   │   ├── controllers/        # Lógica de negocio
│   │   │   ├── clientesController.js
│   │   │   ├── commonController.js
│   │   │   ├── pedidosController.js
│   │   │   ├── productosController.js
│   │   │   └── reportesController.js
│   │   └── routes/             # Definición de rutas API
│   │       ├── clientes.js
│   │       ├── common.js
│   │       ├── pedidos.js
│   │       ├── productos.js
│   │       └── reportes.js
│   ├── server.js               # Punto de entrada
│   ├── package.json
│   └── Dockerfile
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   │   ├── Clientes.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NuevoPedido.jsx
│   │   │   ├── Pedidos.jsx
│   │   │   ├── Productos.jsx
│   │   │   ├── ResumenVentas.jsx
│   │   │   └── ui/             # Componentes UI reutilizables
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── input.jsx
│   │   │       ├── label.jsx
│   │   │       ├── modal.jsx
│   │   │       ├── select.jsx
│   │   │       └── theme-toggle.jsx
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/
│   │   │   └── utils.js        # Utilidades (cn, etc.)
│   │   ├── pages/              # Páginas/rutas
│   │   ├── services/
│   │   │   └── api.js          # Configuración Axios
│   │   ├── App.jsx             # Componente raíz
│   │   ├── index.css           # Estilos globales
│   │   └── main.jsx            # Punto de entrada
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── nginx.conf
│   ├── Dockerfile
│   └── Dockerfile.dev
├── database/                   # Scripts SQL
│   ├── 00_init_tables.sql
│   ├── 00_init_tables_supabase.sql
│   ├── 01_import_legacy_data.sql
│   └── migrations/
│       ├── cleanup_2025_data.sql
│       └── update_v1_borradores_y_edicion.sql
├── scripts/                    # Scripts de utilidad
│   ├── export_backup.bat
│   └── export_backup.sh
├── mobile/                     # 🆕 App móvil Expo React Native
│   ├── src/
│   │   ├── components/         # Componentes UI nativos
│   │   ├── screens/            # Pantallas principales
│   │   ├── navigation/         # Configuración navegación
│   │   ├── services/           # API y sincronización
│   │   ├── hooks/              # Hooks personalizados
│   │   ├── store/              # Zustand state management
│   │   └── utils/              # Utilidades
│   ├── assets/                 # Imágenes, iconos
│   ├── app.json                # Configuración Expo
│   ├── eas.json                # Build configuration
│   └── package.json
├── docker-compose.yml          # Configuración Docker
├── package.json                # Scripts root
├── .env                        # Variables de entorno (NO commitear)
├── .gitignore
├── README.md
├── mobile-roadmap.md           # Roadmap de desarrollo móvil
└── mobile-agent-history.md     # Historial de agentes móviles
```

---

## 5. Convenciones de Código

### Estilo General
- **Tipo de proyecto:** Fullstack JavaScript
- **Estilo de código:** Convenciones clásicas/conservadoras
- **Indentación:** 2 espacios
- **Punto y coma:** Requerido
- **Comillas:** Preferir comillas simples en strings

### Backend (CommonJS)
```javascript
// Funciones nombradas
const miFuncion = async (param1, param2) => {
  // lógica aquí
};

// Exports
module.exports = { miFuncion };

// Imports
const controller = require('./controller');
```

### Frontend (ES Modules)
```javascript
// Imports
import React from 'react';
import { useState, useEffect } from 'react';

// Componentes funcionales
const MiComponente = ({ prop1, prop2 }) => {
  return (
    <div className="clase-tailwind">
      {/* JSX */}
    </div>
  );
};

export default MiComponente;
```

### Nomenclatura
- **Variables/Funciones:** camelCase (`miVariable`, `obtenerDatos`)
- **Componentes React:** PascalCase (`MiComponente`)
- **Archivos:** kebab-case para componentes UI (`theme-toggle.jsx`), PascalCase para componentes principales (`Dashboard.jsx`)
- **Constantes:** UPPER_SNAKE_CASE para valores fijos
- **Base de datos:** snake_case para columnas y tablas (PostgreSQL convención)

### Componentes UI
- Usar `class-variance-authority` para variantes
- Utilizar `tailwind-merge` y `clsx` para clases condicionales
- Componentes en `frontend/src/components/ui/` deben ser reutilizables
- Usar función helper `cn()` de `lib/utils.js` para combinar clases

---

## 6. Variables de Entorno

### Archivo `.env` (Root)
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_APIKEY=tu-anon-public-key-ey...
```

**⚠️ IMPORTANTE:** Nunca commitear el archivo `.env` al repositorio. Está incluido en `.gitignore`.

### Uso en Backend
```javascript
require('dotenv').config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_APIKEY;
```

### Uso en Frontend (Docker)
```yaml
# docker-compose.yml
environment:
  VITE_API_URL: http://localhost:3000/api
```

---

## 7. Comandos Principales

### Iniciar la Aplicación (Docker - Recomendado)
```bash
# Primera vez o rebuild
docker-compose up -d --build

# Día a día (contenedores ya creados)
docker-compose up -d

# Detener
docker-compose stop

# Ver logs
docker-compose logs -f
```

### URLs de Acceso
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Endpoints:** http://localhost:3000/api/*

### Scripts NPM (Root)
```bash
# Instalar dependencias en ambos proyectos
npm run install-all

# Desarrollo sin Docker
npm run dev
# o
npm start
```

### Scripts Backend
```bash
cd backend
npm run dev      # Desarrollo con nodemon
npm start        # Producción
```

### Scripts Frontend
```bash
cd frontend
npm run dev      # Desarrollo con Vite
npm run build    # Build de producción
npm run lint     # ESLint
npm run preview  # Preview del build
```

---

## 8. API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Productos
```
GET    /api/productos          # Listar todos
GET    /api/productos/:id      # Obtener uno
POST   /api/productos          # Crear
PUT    /api/productos/:id      # Actualizar
DELETE /api/productos/:id      # Eliminar
```

### Pedidos
```
GET    /api/pedidos            # Listar todos
GET    /api/pedidos/:id        # Obtener uno
POST   /api/pedidos            # Crear
PUT    /api/pedidos/:id        # Actualizar
PATCH  /api/pedidos/:id/estado # Cambiar estado
```

### Clientes
```
GET    /api/clientes           # Listar todos
POST   /api/clientes           # Crear
PUT    /api/clientes/:id       # Actualizar
DELETE /api/clientes/:id       # Eliminar
```

### Reportes
```
GET    /api/reportes/ventas    # Reportes de ventas
GET    /api/reportes/gastos    # Reportes de gastos
# ... otros endpoints de reportes
```

### Common (Datos auxiliares)
```
GET    /api/common/categorias  # Categorías de productos
GET    /api/common/canales     # Canales de venta
GET    /api/common/estados     # Estados de pedidos
```

---

## 9. MCP Tools

### Documentación y Contexto

When you need to search docs, use `context7` tools. MCP of Supabase, ademas usa Context7 para poder tener las mejores practicas de esa documentación.

#### Uso de Context7
- **Propósito:** Buscar información actualizada de documentación de librerías y frameworks
- **Caso de uso:** Cuando necesites consultar documentación de Supabase, React, Express, etc.
- **Ventaja:** Obtener mejores prácticas y ejemplos de código actualizados

#### Recursos de Documentación Recomendados
- **Supabase:** Usar MCP de Supabase para consultar documentación oficial
- **Context7:** Herramienta preferida para búsqueda de documentación técnica
- **Stack:** React, Express, PostgreSQL, Docker, Tailwind CSS

---

## 10. Reglas de Desarrollo

### Seguridad
- **NUNCA** commitear archivos `.env` o credenciales
- Usar variables de entorno para todas las configuraciones sensibles
- Validar inputs en backend antes de enviar a base de datos
- SQL injection prevention: Usar queries parametrizadas (Supabase lo maneja automáticamente)

### Git
- `.gitignore` configurado para ignorar: `node_modules/`, `.env`, `dist/`, `build/`, logs
- Hacer commits descriptivos
- No incluir archivos de editor (`.vscode/`, `.idea/`, `*.swp`)

### Código
- Seguir principio DRY (Don't Repeat Yourself)
- Componentes pequeños y enfocados (Single Responsibility)
- Usar hooks personalizados para lógica reutilizable
- Preferir funciones puras y componentes funcionales
- Evitar mutaciones directas del estado (siempre usar setState)

### Base de Datos
- Nunca modificar migraciones aplicadas en producción
- Crear nuevas migraciones para cambios en esquema
- Hacer backup antes de cambios importantes
- Usar transacciones para operaciones críticas

### Testing
- No hay tests configurados actualmente
- Considerar añadir Jest/Vitest para testing unitario
- Considerar Cypress/Playwright para testing E2O

### Performance
- Usar React Query para caching de datos
- Lazy loading de componentes grandes
- Optimizar imágenes
- Minimizar re-renders innecesarios

### Docker
- Siempre usar `--build` después de cambios en dependencias
- Los volúmenes mantienen el código sincronizado entre host y contenedor
- `node_modules` está en volumen anónimo para evitar conflictos

---

## 11. Esquema de Base de Datos (Resumen)

### Tablas Principales

**CATEGORIAS** - Categorías de productos
- id_categoria, nombre_categoria, descripcion, activo

**PRODUCTOS** - Inventario de productos
- id_producto, nombre_producto, descripcion, precio, tamano, imagen_url, id_categoria, activo, fecha_creacion

**CLIENTES** - Clientes registrados
- id_cliente, nombre_cliente, telefono, direccion, notas, activo, fecha_registro

**CANALES_VENTA** - Canales de venta (Tienda, Instagram, WhatsApp)
- id_canal, nombre_canal, descripcion, activo

**PEDIDOS** - Órdenes de compra
- id_pedido, fecha_pedido, fecha_limite, id_cliente, id_canal, subtotal, costo_envio, total, estado, metodo_pago, requiere_envio, direccion_envio, notas

**DETALLE_PEDIDOS** - Items de cada pedido
- id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal

**GASTOS** - Registro de gastos operativos
- id_gasto, descripcion, categoria_gasto, monto, fecha_gasto, plataforma, notas

### Tipos ENUM
- `producto_tamano`: pequeño, mediano, grande, unico
- `pedido_estado`: pendiente, en_proceso, completado, entregado, cancelado

### Vistas Principales
- `vw_ventas_7_dias` - Ventas últimos 7 días
- `vw_ventas_15_dias` - Ventas últimos 15 días
- `vw_ventas_30_dias` - Ventas últimos 30 días
- `vw_productos_mas_vendidos` - Ranking de productos
- `vw_resumen_ganancias` - Balance mensual

---

## 12. Troubleshooting

### Problemas Comunes

**Error de conexión a Supabase**
- Verificar que `SUPABASE_URL` y `SUPABASE_APIKEY` estén correctos en `.env`
- Verificar conectividad de red

**Puertos ocupados**
- 5173 (Frontend): Cambiar en `docker-compose.yml` si está ocupado
- 3000 (Backend): Cambiar en `docker-compose.yml` si está ocupado

**Node_modules no sincronizados**
```bash
docker-compose down
docker-compose up -d --build
```

**Cambios no se reflejan**
- Verificar que los volúmenes estén montados correctamente
- Reconstruir contenedores: `docker-compose up -d --build`

---

## 13. Contacto y Recursos

- **Repositorio:** Git (local)
- **Documentación:** Este archivo (AGENTS.md)
- **Base de Datos:** Supabase Console (acceso via web)

---

*Última actualización: Febrero 2026*
*Versión del documento: 1.0*
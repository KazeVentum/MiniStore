# Guía de Requisitos — Ariel's Jewelry Store

---

## 2. Formularios y controles con variables de estado

**Qué cubre:** Inputs de texto, número, email, teléfono, select (dropdown), textarea, checkbox y botones, todos controlados por `useState`.

| Control | Archivo |
|---------|---------|
| Login / Registro (usuario, contraseña, confirmar) | `frontend/src/pages/LoginPage.jsx` |
| Crear y editar producto (nombre, precio, URL imagen, checkbox destacado) | `frontend/src/pages/ProductsPage.jsx` |
| Crear cliente (nombre, teléfono, email) | `frontend/src/pages/CustomersPage.jsx` |
| Crear pedido (select producto, cantidad, select cliente, textarea notas) | `frontend/src/pages/OrdersPage.jsx` |

---

## 3. Componentes y comunicación entre ellos

**Qué cubre:** Componentes reutilizables que reciben props del padre y comunican eventos hacia arriba mediante callbacks.

| Relación | Archivos |
|----------|---------|
| `App` pasa `onLogin` a `LoginPage`; `LoginPage` llama `onLogin(user)` al autenticarse | `frontend/src/App.jsx` → `frontend/src/pages/LoginPage.jsx` |
| `ProductsPage` pasa `onEdit`, `onDelete`, `onSave`, `onCancel`, `isEditing` al componente `SortableProduct` | `frontend/src/pages/ProductsPage.jsx` |
| `HomePage` usa el componente `FeatureCard` con props `icon`, `title`, `description`, `link` | `frontend/src/pages/HomePage.jsx` |

---

## 4. Eventos generados por un componente

**Qué cubre:** `onClick`, `onChange`, `onSubmit`, `onError` manejados en cada página.

| Evento | Dónde |
|--------|-------|
| `onSubmit` en formularios de crear producto, cliente y pedido | `ProductsPage.jsx`, `CustomersPage.jsx`, `OrdersPage.jsx` |
| `onClick` en botones editar, eliminar, cancelar, logout, toggle destacados | Todas las páginas + `App.jsx` |
| `onChange` en todos los campos de formulario | Todas las páginas |
| `onError` en `<img>` para mostrar ícono fallback si la imagen no carga | `frontend/src/pages/ProductsPage.jsx` — componente `ProductImage` |

---

## 5. Hook `useState`

**Qué cubre:** Estado local en cada componente — datos cargados, formularios, estados de carga, búsqueda y edición.

| Estado | Archivo |
|--------|---------|
| `user` — maneja la sesión activa | `frontend/src/App.jsx` |
| `products`, `loading`, `search`, `onlyFeatured`, `formData`, `editProduct`, `errors` | `frontend/src/pages/ProductsPage.jsx` |
| `customers`, `loading`, `search`, `formData`, `errors` | `frontend/src/pages/CustomersPage.jsx` |
| `orders`, `products`, `customers`, `loading`, `search`, `formData`, `errors` | `frontend/src/pages/OrdersPage.jsx` |
| `error` — controla si la imagen falló y muestra el fallback | `frontend/src/pages/ProductsPage.jsx` — componente `ProductImage` |
| `isLogin`, `showPassword`, `passwordValidations` | `frontend/src/pages/LoginPage.jsx` |

---

## 6. Hook `useEffect`

**Qué cubre:** Efectos secundarios al montar el componente — carga de datos desde la API al entrar a cada página.

| Efecto | Archivo |
|--------|---------|
| Carga productos al entrar a la página | `frontend/src/pages/ProductsPage.jsx` |
| Carga clientes al entrar a la página | `frontend/src/pages/CustomersPage.jsx` |
| Carga productos, pedidos y clientes en paralelo (`Promise.all`) al entrar | `frontend/src/pages/OrdersPage.jsx` |

---

## 7. Peticiones a un servidor web

**Qué cubre:** Llamadas HTTP con Axios a la API REST del backend (Express + Supabase). Cubre GET, POST, PUT y DELETE.

| Operación | Archivo |
|-----------|---------|
| Configuración base de Axios (URL del backend) | `frontend/src/services/api.js` |
| `GET /productos`, `POST /productos`, `PUT /productos/:id`, `DELETE /productos/:id` | `frontend/src/pages/ProductsPage.jsx` |
| `GET /clientes`, `POST /clientes`, `DELETE /clientes/:id` | `frontend/src/pages/CustomersPage.jsx` |
| `GET /pedidos`, `POST /pedidos`, `DELETE /pedidos/:id` | `frontend/src/pages/OrdersPage.jsx` |
| `POST /usuarios/login`, `POST /usuarios/register` | `frontend/src/utils/auth.js` |

---

## 8. Propiedad `key` en listas

**Qué cubre:** Uso de `key` única en cada elemento renderizado con `.map()` para que React identifique los nodos correctamente.

| Lista | Archivo |
|-------|---------|
| `key={product.id}` en lista de productos | `frontend/src/pages/ProductsPage.jsx` |
| `key={customer.id}` en lista de clientes | `frontend/src/pages/CustomersPage.jsx` |
| `key={order.id}` en lista de pedidos | `frontend/src/pages/OrdersPage.jsx` |
| `key={product.id}` en el `<select>` de productos al crear pedido | `frontend/src/pages/OrdersPage.jsx` |
| `key={customer.id}` en el `<select>` de clientes al crear pedido | `frontend/src/pages/OrdersPage.jsx` |
| `key={index}` en los indicadores de validación de contraseña | `frontend/src/pages/LoginPage.jsx` |

---

## 9. Imágenes

**Qué cubre:** Etiqueta `<img>` real con URL dinámica por producto. Si la URL falla o no existe, muestra un ícono como fallback.

| Qué | Archivo |
|-----|---------|
| Componente `ProductImage` — renderiza `<img src={...}>` con fallback en `onError` | `frontend/src/pages/ProductsPage.jsx` |
| Campo URL de imagen en el formulario de crear/editar producto | `frontend/src/pages/ProductsPage.jsx` |
| Columna `image_url` en la base de datos | `database/ariels_jewelry.sql` |
| Backend recibe y guarda `image_url` en Supabase | `backend/src/controllers/productosController.js` |

---

## 10. Filtros

**Qué cubre:** Búsqueda en tiempo real con `.filter()` sobre el estado local. Sin petición extra al servidor — el filtrado ocurre en el cliente.

| Filtro | Archivo |
|--------|---------|
| Buscar productos por nombre | `frontend/src/pages/ProductsPage.jsx` |
| Toggle para ver solo productos destacados | `frontend/src/pages/ProductsPage.jsx` |
| Buscar clientes por nombre o email | `frontend/src/pages/CustomersPage.jsx` |
| Buscar pedidos por nombre de producto | `frontend/src/pages/OrdersPage.jsx` |

---

## 11. Hosting

**Qué cubre:** Configuración para desplegar el frontend en Vercel, plataforma gratuita compatible con Vite.

| Qué | Archivo |
|-----|---------|
| `vercel.json` — rewrite de rutas para que el SPA funcione correctamente en producción | `frontend/vercel.json` |
| Script de build (`vite build`) | `frontend/package.json` |

**Pasos para desplegar:**
1. Instalar Vercel CLI: `npm i -g vercel`
2. Desde la carpeta `frontend/`: ejecutar `vercel`
3. Configurar la variable de entorno `VITE_API_URL` con la URL del backend

---

## 12. Drag and Drop

**Qué cubre:** Reordenamiento de productos arrastrando con el mouse usando la librería `@dnd-kit`.

| Qué | Archivo |
|-----|---------|
| `DndContext` y `SortableContext` envuelven la lista de productos | `frontend/src/pages/ProductsPage.jsx` |
| `useSortable` convierte cada producto en un ítem arrastrable | `frontend/src/pages/ProductsPage.jsx` — componente `SortableProduct` |
| `handleDragEnd` calcula el nuevo orden con `arrayMove` | `frontend/src/pages/ProductsPage.jsx` |
| El nuevo orden se persiste en `localStorage` para sobrevivir recargas | `frontend/src/pages/ProductsPage.jsx` |

---

## 13. LocalStorage

**Qué cubre:** Persistencia de datos en el navegador sin necesidad de servidor.

| Qué se guarda | Clave | Archivo |
|---------------|-------|---------|
| Sesión del usuario autenticado (`{ username }`) | `currentUser` | `frontend/src/utils/auth.js` |
| Orden personalizado de los productos tras drag & drop | `product_order` | `frontend/src/pages/ProductsPage.jsx` |

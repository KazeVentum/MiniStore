# MiniStore

Sistema de gestión de productos, pedidos y clientes con autenticación.

## Funcionalidades

### Autenticación
- Login/Register con validaciones
- Contraseña: 8-12 caracteres, mayúsculas, minúsculas, números, caracteres especiales
- Indicador de seguridad de contraseña en tiempo real
- Notificaciones toast para éxito/error
- Sesiones persistentes con localStorage

### Gestión
- **Productos**: Crear, editar, eliminar
- **Pedidos**: Crear, eliminar con cálculo automático de totales
- **Clientes**: Crear, eliminar con validación de email

## Tecnologías
- React 18 + Vite
- React Router DOM
- React Toastify (notificaciones)
- Tailwind CSS
- Lucide Icons

## Estructura
```
src/
├── App.jsx
├── index.css
├── main.jsx
├── utils/
│   └── auth.js              # Utilidades de autenticación
└── pages/
    ├── LoginPage.jsx        # Login/Register
    ├── HomePage.jsx
    ├── ProductsPage.jsx
    ├── OrdersPage.jsx
    └── CustomersPage.jsx
```

## Ejecutar
```bash
npm install
npm run dev
```

## Validaciones de Contraseña
- Mínimo 8 caracteres
- Máximo 12 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial (!@#$%^&*(),.?":{}|<>)

## Notificaciones
Todas las acciones muestran notificaciones toast:
- Verde: Éxito
- Rojo: Error
- Naranja: Información
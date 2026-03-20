# Onboarding - MiniStore Web

Este documento explica como funciona MiniStore. No necesitas saber programar para entenderlo, solo seguir la logica.

---

## Que es MiniStore?

Es una pagina web para manejar una tienda de bisuteria. Con ella puedes:

- Ver ventas y estadisticas (Dashboard)
- Agregar, editar o eliminar productos
- Crear pedidos para clientes
- Ver y cambiar estado de pedidos
- Manejar clientes
- Ver reportes de ventas

---

## Como Funciona la Pagina?

Piensa en 3 cajas conectadas:

```
1. Tu navegador (lo que ves)
        ↓
2. El servidor (procesa cosas)
        ↓
3. La base de datos (guarda todo)
```

Cuando haces algo en la pagina (como crear un pedido):
1. La pagina envia la informacion al servidor
2. El servidor la procesa y la guarda en la base de datos
3. La pagina se actualiza para mostrar el cambio

---

## Las Partes del Proyecto

El proyecto tiene varias carpetas:

```
frontend/src/
├── components/        # Piezas de la interfaz
├── services/          # Conexion con el servidor
├── lib/              # Funciones pequenas
└── App.jsx           # El cerebro de la pagina
```

---

## Que hace cada pagina?

### Dashboard
Es la pantalla principal. Muestra:
- Ventas del dia
- Pedidos pendientes
- Productos en el catalogo
- Grafica de ventas recientes

### Products
Lista todos los productos en tarjetas. Tiene:
- Buscador para filtrar
- Boton para agregar producto nuevo
- Opciones para editar o eliminar

### Orders
Lista todos los pedidos. Tiene:
- Filtros por mes y estado
- Estadisticas del mes
- Botones para cambiar estado (completar, cancelar)

### Nuevo Pedido
Es un formulario grande que:
- Selecciona un cliente
- Agrega productos
- Define metodo de pago
- Calcula totales automaticos
- Guarda el pedido

### Customers
Tarjetas con informacion de clientes:
- Nombre
- Telefono
- Direccion
- Notas

### Sales Summary
Reportes mensuales:
- Total de ventas del mes
- Desglose por metodo de pago
- Lista de operaciones del mes

---

## Conceptos Tecnicos (Explicados Simple)

### Que es un "Estado"?

Es como una variable especial. Cuando cambia, la pagina se actualiza sola.

Ejemplo: Cuando escribes en un buscador, el estado "searchTerm" cambia y la lista se filtra automaticamente.

### Que son los "Props"?

Son datos que pasas de un componente a otro.

Ejemplo:
```
ComponenteGrande (contiene todo)
    ↓ pasa "nombre" y "edad"
ComponentePequeno (muestra los datos)
```

### Que hace useEffect?

Es una instruccion que dice: "Cuando algo cambie, haz esto".

Ejemplo: "Cuando la pagina cargue, busca los productos del servidor".

---

## Donde Esta el Menu?

El menu lateral esta en `App.jsx`. Ahi se define:

- El logo
- Los links de navegacion
- El boton de modo oscuro

---

## Donde Esta el Estilo?

El estilo se hace con Tailwind CSS, que son clases ya definidas.

Ejemplos de clases:

```
bg-white        → fondo blanco
text-2xl        → texto grande
p-4             → espacio alrededor
rounded-xl      → bordes redondos
shadow-md       → sombra suave
```

Para modo oscuro se agrega `dark:` adelante:

```
bg-white dark:bg-gray-900
```

---

## Donde Va el Codigo Nuevo?

### Nueva pagina
1. Crear archivo en `components/`
2. Importar en `App.jsx`
3. Agregar ruta
4. Agregar link en el menu

### Nueva funcion de API
En `services/api.js` agregar una funcion que llame al servidor.

---

## Como Probar el Proyecto?

```bash
# Con Docker
docker compose up -d

# Solo el frontend
cd frontend
npm run dev
```

Luego abre: http://localhost:5173

---

## Si Algo No Funciona

1. Revisa la consola del navegador (F12)
2. Verifica que el backend este corriendo
3. Revisa que la base de datos tenga los datos correctos

---

## Resumen

- Todo comienza en `App.jsx`
- Cada pagina es un componente en `components/`
- Los datos vienen del servidor via `services/api.js`
- El estilo usa clases de Tailwind
- El modo oscuro usa `dark:` en las clases

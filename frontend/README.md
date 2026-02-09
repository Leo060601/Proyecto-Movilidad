
## Frontend - Proyecto Movilidad

### Estructura
- `src/App.js`: Componente principal.
- `src/components/`: Componentes reutilizables (MapPage).
- `src/Footer.js`: Pie de página.
- `src/Header.js`: Encabezado.
- `src/Sidebar.js`: Barra lateral de rutas.
- `src/img/`: Imágenes.
- `src/hooks/`, `src/pages/`, `src/utils/`: Carpetas para futuras extensiones.
- `public/`: Archivos estáticos.
- `package.json`: Dependencias y scripts.
- `README.md`: Documentación del frontend.

### Dependencias principales
- react
- react-leaflet
- axios

### Cómo iniciar el frontend

1. Instala dependencias:
	```bash
	npm install
	```
2. Inicia la aplicación:
	```bash
	npm start
	```
	El frontend estará disponible en http://localhost:3000

---
Las funciones actuales del proyecto están documentadas abajo. Si agregas nuevas funciones, recuerda documentarlas aquí.

## Funciones actuales del proyecto

### Frontend (src/)

**App.js**
- `App`: Componente principal. Muestra el mapa, detalles de la ruta, Sidebar, Header y Footer.
- `handleRouteSelect(route)`: Selecciona una ruta, actualiza el estado y muestra detalles.
- `handleRouteClick()`: Cambia el estado del tráfico y cuenta los clics sobre la ruta.
- `getUserLocation()`: Obtiene la ubicación actual del usuario usando geolocalización.

**Sidebar.js**
- `Sidebar`: Muestra la lista de rutas filtradas por ciudad (Celaya). Permite seleccionar una ruta y la comunica al componente principal.

**Footer.js**
- `Footer`: Muestra el pie de página con animación de burbujas y derechos de autor.

**Header.js**
- `Header`: Muestra el título del proyecto.

**components/MapPage.js**
- `MapPage`: Muestra un mapa con todas las rutas y marcadores de cada punto. Obtiene rutas desde el backend.

### Backend (backend/src/app.js)

- `app.get('/routes')`: Devuelve todas las rutas almacenadas en MongoDB.
- `app.post('/add-route')`: Permite agregar una nueva ruta a la base de datos.
- `app.get('/route/:id')`: Devuelve una ruta específica por su ID.
- `app.delete('/route/:id')`: Elimina una ruta por su ID.

**Modelo**
- `Route`: Modelo de Mongoose para rutas, con campos: name, gpsCoordinates, city, schedule, timeToComplete.

---
Esta lista se actualiza automáticamente. Si agregas nuevas funciones, recuerda documentarlas aquí.
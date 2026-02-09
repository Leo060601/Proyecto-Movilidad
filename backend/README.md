## Backend - Proyecto Movilidad

### Estructura

- `src/app.js`: Archivo principal del servidor Express.
- `src/controllers/`: Controladores (vacío, para futuras funciones).
- `src/middlewares/`: Middlewares (vacío, para futuras funciones).
- `src/models/`: Modelos de datos (vacío, para futuras funciones).
- `src/routes/`: Rutas (vacío, para futuras funciones).
- `package.json`: Dependencias y scripts.
- `README.md`: Documentación del backend.

### Dependencias principales
- express
- mongoose
- cors

### Cómo iniciar el backend

1. Instala dependencias:
	```bash
	npm install
	```
2. Inicia el servidor:
	```bash
	npm run dev
	```
	El backend estará disponible en http://localhost:5000

### Funcionalidades
- Obtener todas las rutas: `GET /routes`
- Agregar una ruta: `POST /add-route`
- Obtener una ruta por ID: `GET /route/:id`
- Eliminar una ruta por ID: `DELETE /route/:id`

---
Para agregar nuevas funcionalidades, crea archivos en controllers, models o routes y documenta aquí.
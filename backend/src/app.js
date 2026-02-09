import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Crear una instancia de Express
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a la base de datos MongoDB
mongoose.connect('mongodb://localhost:27017/proyecto-movilidad', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch((err) => console.log('Error de conexión a MongoDB: ', err));

// Esquema de rutas (por ejemplo)
const routeSchema = new mongoose.Schema({
  name: String,
  gpsCoordinates: [[Number]],  // Un array de coordenadas [lat, lon]
  city: String , // Agregar el campo de ciudad
  schedule: String,  // Horario
  timeToComplete: String  // Tiempo de recorrido
});

const Route = mongoose.model('Route', routeSchema);

// Rutas de la API
// Obtener todas las rutas
app.get('/routes', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    res.status(500).send('Error al obtener rutas');
  }
});
// Nueva ruta POST para agregar una ruta
app.post('/add-route', async (req, res) => {
  try {
    const { name, gpsCoordinates, city, schedule, timeToComplete  } = req.body;
    
    // Crear una nueva instancia de la ruta y guardarla en la base de datos
    const newRoute = new Route({
      name,
      gpsCoordinates,
      city,
      schedule,  // Añadir horario
      timeToComplete 
    });

    await newRoute.save(); // Guardar la nueva ruta en la base de datos
    res.status(201).json({ message: 'Ruta agregada exitosamente' }); // Respuesta de éxito
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar la ruta');
  }
});
// Obtener una ruta específica por ID
app.get('/route/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    res.json(route);
  } catch (err) {
    res.status(500).send('Error al obtener ruta específica');
  }
});

// Configura la ruta DELETE
app.delete('/route/:id', async (req, res) => {
  try {
    const routeId = req.params.id;
    
    // Eliminar la ruta por su ID
    const deletedRoute = await Route.findByIdAndDelete(routeId);
    
    if (!deletedRoute) {
      return res.status(404).send({ message: 'Ruta no encontrada' });
    }
    
    res.status(200).send({ message: 'Ruta eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error al eliminar la ruta' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

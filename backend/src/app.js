import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import crypto from 'crypto';

// =====================
// IMPORTAR MODELOS
// =====================
import Route from './models/Route.js';
import RouteEvent from './models/RouteEvent.js';
import RealTimeMetric from './models/RealTimeMetric.js';

// =====================
// CONFIGURACIÓN
// =====================
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// =====================
// CONEXIÓN MONGODB
// =====================
mongoose.connect('mongodb://localhost:27017/proyecto-movilidad', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✓ Conexión exitosa a MongoDB'))
  .catch((err) => {
    console.error('✗ Error de conexión a MongoDB: ', err);
    process.exit(1);
  });

// =====================
// UTILIDADES
// =====================

function generateUserHash(req) {
  const ip = req.ip || 'unknown';
  const ua = req.get('user-agent') || 'unknown';
  return crypto.createHash('sha256').update(ip + ua).digest('hex');
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// =====================
// MIDDLEWARE
// =====================
app.use((req, res, next) => {
  req.userHash = generateUserHash(req);
  req.sessionId = req.headers['x-session-id'] || crypto.randomBytes(16).toString('hex');
  next();
});

// =====================
// RUTAS: CRUD
// =====================

app.get('/routes', async (req, res) => {
  try {
    const routes = await Route.find().select('-metadata');
    res.json(routes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
});

app.get('/route/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ error: 'Ruta no encontrada' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ruta' });
  }
});

app.post('/add-route', async (req, res) => {
  try {
    const { name, gpsCoordinates, city, schedule, timeToComplete, routeCode, distanceKm, startTime, endTime } = req.body;

    if (!name || !gpsCoordinates || !city) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    let distance = distanceKm;
    if (!distance && gpsCoordinates.length >= 2) {
      const start = gpsCoordinates[0];
      const end = gpsCoordinates[gpsCoordinates.length - 1];
      distance = calculateDistance(start[0], start[1], end[0], end[1]);
    }

    const code = routeCode || `${city.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newRoute = new Route({
      routeCode: code,
      name,
      city,
      gpsCoordinates,
      geospatialData: {
        startPoint: {
          coordinates: [gpsCoordinates[0][1], gpsCoordinates[0][0]]
        },
        endPoint: {
          coordinates: [gpsCoordinates[gpsCoordinates.length - 1][1], gpsCoordinates[gpsCoordinates.length - 1][0]]
        },
        distanceKm: distance
      },
      schedule: {
        rawString: schedule || `${startTime} - ${endTime}`,
        startTime: startTime || '06:00',
        endTime: endTime || '23:00'
      },
      travelTime: {
        estimatedMinutes: parseInt(timeToComplete) || 30
      }
    });

    await newRoute.save();
    res.status(201).json({ message: 'Ruta agregada exitosamente', routeId: newRoute._id, routeCode: newRoute.routeCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar la ruta' });
  }
});

app.delete('/route/:id', async (req, res) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);
    if (!deletedRoute) return res.status(404).json({ error: 'Ruta no encontrada' });
    res.json({ message: 'Ruta eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la ruta' });
  }
});

// =====================
// RUTAS: EVENTOS
// =====================

app.post('/api/events', async (req, res) => {
  try {
    const { eventType, routeId, userLocation, sessionDuration, durationOnRoute, deviceInfo, searchQuery, actionResult } = req.body;

    if (!eventType || !routeId) {
      return res.status(400).json({ error: 'Faltan eventType o routeId' });
    }

    let proximityToRoute = null;
    let routeCode = null;

    try {
      const route = await Route.findById(routeId).select('routeCode geospatialData');
      routeCode = route?.routeCode;
      if (userLocation && route?.geospatialData?.startPoint) {
        const startCoords = route.geospatialData.startPoint.coordinates;
        proximityToRoute = calculateDistance(userLocation[0], userLocation[1], startCoords[1], startCoords[0]) * 1000;
      }
    } catch (e) {
      console.warn('No se pudo obtener datos de ruta');
    }

    const event = new RouteEvent({
      eventType,
      userId: req.userHash,
      sessionId: req.sessionId,
      routeId,
      routeCode,
      userLocation: userLocation ? { type: 'Point', coordinates: [userLocation[1], userLocation[0]] } : null,
      proximityToRoute,
      sessionDuration,
      durationOnRoute,
      deviceInfo,
      searchQuery,
      actionResult: actionResult || 'success'
    });

    await event.save();
    res.status(201).json({ message: 'Evento capturado', eventId: event.eventId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al capturar evento' });
  }
});

app.get('/api/events/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { days = 7, limit = 100 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const events = await RouteEvent.find({
      routeId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 }).limit(parseInt(limit));

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

app.get('/api/events-stats/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;

    const stats = await RouteEvent.aggregate([
      { $match: { routeId: new mongoose.Types.ObjectId(routeId) } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          successCount: { $sum: { $cond: [{ $eq: ['$actionResult', 'success'] }, 1, 0] } },
          avgSessionDuration: { $avg: '$sessionDuration' },
          avgDurationOnRoute: { $avg: '$durationOnRoute' }
        }
      },
      {
        $project: {
          totalEvents: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          successRate: { $round: [{ $multiply: [{ $divide: ['$successCount', '$totalEvents'] }, 100] }, 2] },
          avgSessionDuration: { $round: ['$avgSessionDuration', 0] },
          avgDurationOnRoute: { $round: ['$avgDurationOnRoute', 0] }
        }
      }
    ]);

    res.json(stats[0] || {
      totalEvents: 0,
      uniqueUsers: 0,
      successRate: 0,
      avgSessionDuration: 0,
      avgDurationOnRoute: 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// =====================
// RUTAS: MÉTRICAS REALES
// =====================

app.post('/api/realtime-metrics', async (req, res) => {
  try {
    const { vehicleId, routeId, currentLocation, occupancy, delay, speed, nextStopId, nextStopETA } = req.body;

    if (!vehicleId || !routeId || !currentLocation || occupancy === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const route = await Route.findById(routeId).select('routeCode');

    const metric = new RealTimeMetric({
      vehicleId,
      routeId,
      routeCode: route?.routeCode,
      currentLocation: { type: 'Point', coordinates: [currentLocation[1], currentLocation[0]] },
      occupancy,
      delay: delay || 0,
      speed: speed || 0,
      nextStopId,
      nextStopETA,
      onTimePerformance: (delay || 0) <= 300
    });

    await metric.save();
    res.status(201).json({ message: 'Métrica registrada', metricId: metric._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar métrica' });
  }
});

app.get('/api/realtime-metrics/latest/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;

    const metrics = await RealTimeMetric.find({ routeId })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(metrics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

// =====================
// HEALTH CHECK
// =====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// =====================
// ERROR HANDLING
// =====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// =====================
// INICIAR SERVIDOR
// =====================

app.listen(PORT, () => {
  console.log(`\n================================`);
  console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`\nEndpoints disponibles:`);
  console.log(`  GET  /routes`);
  console.log(`  GET  /route/:id`);
  console.log(`  POST /add-route`);
  console.log(`  DELETE /route/:id`);
  console.log(`  POST /api/events`);
  console.log(`  GET  /api/events/:routeId`);
  console.log(`  GET  /api/events-stats/:routeId`);
  console.log(`  POST /api/realtime-metrics`);
  console.log(`  GET  /api/realtime-metrics/latest/:routeId`);
  console.log(`  GET  /health`);
  console.log(`================================\n`);
});

export default app;
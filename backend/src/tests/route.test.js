import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

// Mock de datos para pruebas
const mockRoute = {
  name: 'Ruta Test',
  city: 'Ciudad Test',
  waypoints: {
    type: 'LineString',
    coordinates: [[-99.13, 19.43], [-99.14, 19.44]]
  },
  schedule: [{ day: 'Monday', departures: ['08:00', '12:00'] }],
  timeToComplete: '30min'
};

describe('API /api/v1/routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('debe crear una ruta', async () => {
    const res = await request(app)
      .post('/api/v1/routes')
      .send(mockRoute);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(mockRoute.name);
  });

  it('debe obtener todas las rutas', async () => {
    const res = await request(app).get('/api/v1/routes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe validar datos incorrectos', async () => {
    const res = await request(app)
      .post('/api/v1/routes')
      .send({ name: '', city: '', waypoints: {} });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

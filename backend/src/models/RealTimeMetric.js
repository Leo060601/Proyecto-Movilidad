import mongoose from 'mongoose';

const realtimeMetricSchema = new mongoose.Schema({
  // =====================
  // IDENTIFICADORES
  // =====================
  vehicleId: {
    type: String,
    required: true,
    index: true
  },
  
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
    index: true
  },
  
  routeCode: String,
  
  // =====================
  // POSICIÓN EN TIEMPO REAL
  // =====================
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lon, lat]
      required: true
    },
    accuracy: Number // metros de precisión GPS
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // =====================
  // ESTADO OPERACIONAL
  // =====================
  occupancy: {
    type: Number,
    min: 0,
    max: 100, // porcentaje de capacidad
    required: true
  },
  
  occupancyCount: Number, // número absoluto de pasajeros
  
  delay: {
    type: Number, // segundos vs schedule teórico
    default: 0
  },
  
  speed: Number, // km/h
  
  nextStopId: String,
  
  nextStopETA: Number, // segundos hasta siguiente parada
  
  // =====================
  // DESEMPEÑO
  // =====================
  onTimePerformance: {
    type: Boolean, // ¿está a tiempo?
    default: true
  },
  
  doorStatus: {
    type: String,
    enum: ['open', 'closed', 'closing', 'opening'],
    default: 'closed'
  },
  
  engineStatus: {
    type: String,
    enum: ['running', 'idle', 'off'],
    default: 'running'
  },
  
  // =====================
  // PREDICCIÓN
  // =====================
  predictedArrivalTime: Date, // hora de llegada estimada al final
  
  predictedArrivalTimeConfidence: {
    type: Number,
    min: 0,
    max: 1
  }, // 0-1
  
  // =====================
  // AMBIENTAL
  // =====================
  temperature: Number, // Celsius (opcional)
  
  weatherCondition: {
    type: String,
    enum: ['clear', 'cloudy', 'rainy', 'foggy', 'snowy'],
    default: 'clear'
  },
  
  // =====================
  // ANOMALÍAS
  // =====================
  isAnomaly: {
    type: Boolean,
    default: false
  },
  
  anomalyReason: String, // ej: "Delay > 900 segundos"
  
  // =====================
  // METADATA
  // =====================
  source: {
    type: String,
    enum: ['gps', 'api', 'simulated', 'manual'],
    default: 'gps'
  },
  
  dataQuality: {
    type: Number,
    min: 0,
    max: 100
  } // confiabilidad del dato
  
}, {
  timestamps: true,
  collection: 'realtime_metrics'
});

// =====================
// ÍNDICES PARA ANÁLISIS
// =====================
// TTL: Auto-eliminar registros después de 7 días
realtimeMetricSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 604800 }
);

// Búsquedas por ruta + hora
realtimeMetricSchema.index({ routeId: 1, timestamp: -1 });

// Búsqueda geoespacial
realtimeMetricSchema.index({ 'currentLocation': '2dsphere' });

// Análisis de anomalías
realtimeMetricSchema.index({ isAnomaly: 1, timestamp: -1 });

// Vehículo
realtimeMetricSchema.index({ vehicleId: 1, timestamp: -1 });

const RealTimeMetric = mongoose.model('RealTimeMetric', realtimeMetricSchema);

export default RealTimeMetric;
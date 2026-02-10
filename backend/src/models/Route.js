import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  // =====================
  // IDENTIDAD DE LA RUTA
  // =====================
  routeCode: { 
    type: String, 
    unique: true, 
    required: true,
    index: true 
  }, // ej: "CEL-001"
  
  name: { 
    type: String, 
    required: true 
  },
  
  city: { 
    type: String, 
    required: true,
    index: true 
  },
  
  operator: { 
    type: String, 
    default: 'No especificado' 
  }, // empresa transportista
  
  // =====================
  // DATOS GEOESPACIALES
  // =====================
  gpsCoordinates: {
    type: [[Number]], // [lat, lon]
    required: true
  },
  
  geospatialData: {
    startPoint: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lon, lat] - NOTA: GeoJSON usa [lon, lat]
        required: true
      }
    },
    endPoint: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    distanceKm: {
      type: Number,
      required: true
    },
    polylineEncoded: String // para mapas (opcional)
  },
  
  // =====================
  // HORARIOS (PARSEADOS)
  // =====================
  schedule: {
    rawString: String, // original ej: "6:00 - 23:00"
    startTime: {
      type: String,
      match: /^\d{2}:\d{2}$/, // "06:00"
      required: true
    },
    endTime: {
      type: String,
      match: /^\d{2}:\d{2}$/,
      required: true
    },
    frequency: {
      type: String,
      enum: ['5min', '10min', '15min', '30min', 'hourly', 'peak'],
      default: '15min'
    },
    daysOfWeek: {
      type: [Number], // 0=lunes, 6=domingo
      default: [0, 1, 2, 3, 4, 5, 6]
    },
    holidays: [Date] // días sin servicio
  },
  
  // =====================
  // TIEMPO DE VIAJE
  // =====================
  travelTime: {
    estimatedMinutes: {
      type: Number,
      required: true
    },
    // Estadísticas históricas
    historicalStats: {
      mean: Number,
      median: Number,
      std: Number, // desviación estándar
      p50: Number,
      p90: Number,
      p95: Number
    },
    // Por franja horaria
    byTimeOfDay: {
      morning: Number, // 6-9 AM
      midday: Number, // 9-12
      afternoon: Number, // 12-17
      evening: Number, // 17-20
      night: Number // 20-6
    }
  },
  
  // =====================
  // PARADAS DETALLADAS
  // =====================
  stops: [{
    stopId: String,
    name: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    sequenceOrder: Number,
    dwellTime: Number, // segundos
    isAccessible: Boolean // para discapacitados
  }],
  
  // =====================
  // CARACTERÍSTICAS
  // =====================
  characteristics: {
    capacity: {
      type: Number,
      default: 40
    },
    vehicleType: {
      type: String,
      enum: ['bus', 'minibus', 'metro', 'van', 'otro'],
      default: 'bus'
    },
    accessibility: {
      type: Boolean,
      default: false
    },
    averagePassengers: Number,
    peakCapacityUtilization: {
      type: Number,
      default: 0
    }
  },
  
  // =====================
  // METADATA PARA QA
  // =====================
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    lastModifiedBy: String,
    dataQuality: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    source: {
      type: String,
      enum: ['manual', 'api', 'gps', 'scraping'],
      default: 'manual'
    }
  }
  
}, { 
  timestamps: true,
  collection: 'routes'
});

// =====================
// ÍNDICES PARA QUERIES
// =====================
routeSchema.index({ 'geospatialData.startPoint': '2dsphere' });
routeSchema.index({ 'geospatialData.endPoint': '2dsphere' });
routeSchema.index({ city: 1, 'schedule.daysOfWeek': 1 });
routeSchema.index({ routeCode: 1 });
routeSchema.index({ 'metadata.lastUpdated': -1 });

const Route = mongoose.model('Route', routeSchema);

export default Route;
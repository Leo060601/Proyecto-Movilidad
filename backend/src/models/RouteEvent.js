import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const routeEventSchema = new mongoose.Schema({
  // =====================
  // IDENTIFICADORES
  // =====================
  eventId: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  
  eventType: {
    type: String,
    enum: ['view', 'select', 'click', 'favorite', 'share', 'search', 'booking'],
    required: true,
    index: true
  },
  
  // =====================
  // USUARIO (ANÓNIMO)
  // =====================
  userId: {
    type: String, // hash del IP + user agent
    index: true,
    required: true
  },
  
  sessionId: {
    type: String,
    index: true,
    required: true
  },
  
  // =====================
  // CONTEXTO GEOGRÁFICO
  // =====================
  userLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [lon, lat]
  },
  
  proximityToRoute: Number, // metros desde el start de la ruta
  
  // =====================
  // RUTA INVOLUCRADA
  // =====================
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    index: true,
    required: true
  },
  
  routeCode: {
    type: String,
    index: true
  },
  
  // =====================
  // CONTEXTO TEMPORAL
  // =====================
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  dayOfWeek: {
    type: Number, // 0-6
    default: function() {
      return this.timestamp?.getDay() || new Date().getDay();
    }
  },
  
  hourOfDay: {
    type: Number, // 0-23
    default: function() {
      return this.timestamp?.getHours() || new Date().getHours();
    }
  },
  
  isWeekend: {
    type: Boolean,
    default: function() {
      const day = this.dayOfWeek;
      return day === 0 || day === 6;
    }
  },
  
  // =====================
  // DURACIÓN EN LA APP
  // =====================
  sessionDuration: Number, // segundos totales en la sesión
  
  durationOnRoute: Number, // segundos viendo esta ruta específica
  
  timeToAction: Number, // segundos desde inicio de sesión hasta este evento
  
  // =====================
  // DATOS DEL DISPOSITIVO
  // =====================
  deviceInfo: {
    browser: String, // 'Chrome', 'Firefox', etc
    os: String, // 'iOS', 'Android', 'Windows', etc
    screenSize: String, // '1920x1080'
    isMobile: Boolean
  },
  
  // =====================
  // RESULTADO / CONVERSIÓN
  // =====================
  actionResult: {
    type: String,
    enum: ['success', 'abandoned', 'error', 'pending'],
    default: 'success'
  },
  
  // Si hizo una búsqueda anterior
  previousEventType: String,
  
  // =====================
  // DATOS CONTEXTALES
  // =====================
  searchQuery: String, // si fue un evento de búsqueda
  
  selectedStops: [String], // paradas que seleccionó (si aplica)
  
  // =====================
  // METADATA
  // =====================
  ipAddressHash: String, // hash del IP para privacidad
  
  referer: String // página anterior
  
}, {
  timestamps: true,
  collection: 'route_events',
  TTL: 2592000 // Auto-eliminar después de 30 días (opcional)
});

// =====================
// ÍNDICES PARA ANÁLISIS
// =====================
// Búsquedas rápidas por ruta + tiempo
routeEventSchema.index({ routeId: 1, timestamp: -1 });

// Análisis de usuarios
routeEventSchema.index({ userId: 1, timestamp: -1 });

// Búsquedas geoespaciales
routeEventSchema.index({ 'userLocation': '2dsphere' });

// Análisis temporal
routeEventSchema.index({ dayOfWeek: 1, hourOfDay: 1, eventType: 1 });

// Búsquedas de eventos específicos
routeEventSchema.index({ eventType: 1, timestamp: -1 });

// Conversión (funnel analysis)
routeEventSchema.index({ sessionId: 1, timestamp: 1 });

const RouteEvent = mongoose.model('RouteEvent', routeEventSchema);

export default RouteEvent;
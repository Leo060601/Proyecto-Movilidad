import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * EventTracker: Captura y envía eventos al backend
 * Uso: tracker.trackEvent('view', routeId, { userLocation: [lat, lon] })
 */
class EventTracker {
  constructor() {
    this.sessionStartTime = Date.now();
    this.sessionId = this.generateSessionId();
    this.currentRouteViewStart = null;
    this.isOnline = navigator.onLine;
    
    // Listener para cambios de conexión
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('✓ Conexión establecida - sincronizando eventos');
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('✗ Sin conexión - eventos almacenados localmente');
    });
  }

  /**
   * Generar ID de sesión único
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener duración de sesión en segundos
   */
  getSessionDuration() {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  /**
   * Obtener información del dispositivo
   */
  getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detectar navegador
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';

    // Detectar SO
    if (ua.indexOf('Windows') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'macOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';

    return {
      browser,
      os,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    };
  }

  /**
   * Rastrear evento general
   */
  async trackEvent(eventType, routeId, options = {}) {
    const eventData = {
      eventType,
      routeId,
      sessionDuration: this.getSessionDuration(),
      deviceInfo: this.getDeviceInfo(),
      actionResult: options.actionResult || 'success',
      ...options
    };

    try {
      // Intentar enviar al servidor
      if (this.isOnline) {
        // ✅ CORRECTO: /api/events
        const response = await axios.post(`${API_BASE}/api/events`, eventData, {
          timeout: 5000
        });
        console.log(`✓ Evento "${eventType}" capturado:`, response.data);
        return response.data;
      } else {
        // Guardar localmente si está offline
        this.saveEventLocally(eventData);
        console.log(`📦 Evento guardado localmente (sin conexión)`);
      }
    } catch (error) {
      console.error(`✗ Error capturando evento:`, error);
      this.saveEventLocally(eventData);
    }
  }

  /**
   * Rastrear búsqueda de ruta
   */
  async trackSearch(query, resultCount) {
    return this.trackEvent('search', null, {
      searchQuery: query,
      resultCount,
      actionResult: resultCount > 0 ? 'success' : 'no_results'
    });
  }

  /**
   * Rastrear visualización de ruta
   */
  async trackRouteView(routeId, userLocation = null) {
    this.currentRouteViewStart = Date.now();
    return this.trackEvent('view', routeId, {
      userLocation,
      durationOnRoute: 0
    });
  }

  /**
   * Rastrear selección de ruta
   */
  async trackRouteSelect(routeId, userLocation = null) {
    const durationOnRoute = this.currentRouteViewStart 
      ? Math.floor((Date.now() - this.currentRouteViewStart) / 1000)
      : 0;

    return this.trackEvent('select', routeId, {
      userLocation,
      durationOnRoute,
      actionResult: 'success'
    });
  }

  /**
   * Rastrear click en ruta
   */
  async trackRouteClick(routeId) {
    return this.trackEvent('click', routeId, {});
  }

  /**
   * Rastrear favorito
   */
  async trackFavorite(routeId, isFavorited) {
    return this.trackEvent('favorite', routeId, {
      actionResult: isFavorited ? 'added' : 'removed'
    });
  }

  /**
   * Guardar evento localmente
   */
  saveEventLocally(eventData) {
    const events = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
    events.push({
      ...eventData,
      timestamp: new Date().toISOString(),
      synced: false
    });
    localStorage.setItem('pendingEvents', JSON.stringify(events));
  }

  /**
   * Sincronizar eventos guardados cuando haya conexión
   */
  async syncPendingEvents() {
    if (!this.isOnline) return;

    try {
      const events = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
      const unsyncedEvents = events.filter(e => !e.synced);

      if (unsyncedEvents.length === 0) return;

      console.log(`Sincronizando ${unsyncedEvents.length} eventos pendientes...`);

      for (const event of unsyncedEvents) {
        const { synced, timestamp, ...eventData } = event;
        try {
          // ✅ CORRECTO: /api/events
          await axios.post(`${API_BASE}/api/events`, eventData, {
            timeout: 5000
          });
          event.synced = true;
        } catch (error) {
          console.warn(`Falló sincronización de evento:`, error);
        }
      }

      localStorage.setItem('pendingEvents', JSON.stringify(events));
      console.log(`✓ Sincronización completada`);
    } catch (error) {
      console.error('Error sincronizando eventos:', error);
    }
  }

  /**
   * Obtener estadísticas de sesión actual
   */
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      duration: this.getSessionDuration(),
      startTime: new Date(this.sessionStartTime).toISOString(),
      isOnline: this.isOnline,
      deviceInfo: this.getDeviceInfo()
    };
  }
}

// Singleton
export const eventTracker = new EventTracker();

export default EventTracker;
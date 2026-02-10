import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar'; 
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import truckIcon from './img/truck-icon.jpg'; 
import userIcon from './img/user-icon.jpg';
import './App.css'; 
import Footer from './Footer';
import Header from './Header';
import { eventTracker } from './utils/eventTracker';

function App() {
  // =====================
  // ESTADO
  // =====================
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [randomTime, setRandomTime] = useState(null);
  const [trafficStatus, setTrafficStatus] = useState("blue");
  const [clickCount, setClickCount] = useState(0);
  const [eventStats, setEventStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // =====================
  // EFECTOS
  // =====================

  useEffect(() => {
    getUserLocation();
    
    const syncInterval = setInterval(() => {
      eventTracker.syncPendingEvents();
    }, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  // Cuando hay ruta seleccionada, cargar estadísticas
  useEffect(() => {
    if (selectedRoute && selectedRoute._id) {
      loadRouteEventStats(selectedRoute._id);
    }
  }, [selectedRoute]);

  // =====================
  // FUNCIONES
  // =====================

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([
            position.coords.latitude,
            position.coords.longitude
          ]);
        },
        (error) => {
          console.warn("Ubicación no disponible:", error);
        }
      );
    }
  };

  const loadRouteEventStats = async (routeId) => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      
      // ✅ URL CORRECTA: /api/events-stats
      const response = await axios.get(`http://localhost:5000/api/events-stats/${routeId}`);
      setEventStats(response.data);
      console.log('📊 Estadísticas de ruta cargadas:', response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setStatsError('No se pudieron cargar las estadísticas');
      setEventStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRouteSelect = async (route) => {
    setSelectedRoute(route);
    setCurrentPosition(
      route && route.gpsCoordinates && route.gpsCoordinates.length > 0 
        ? route.gpsCoordinates[0] 
        : null
    );
    setRandomTime(route ? Math.floor(Math.random() * 30) + 10 : null);
    setTrafficStatus("blue");
    setClickCount(0);

    try {
      await eventTracker.trackRouteSelect(route._id, userPosition);
    } catch (error) {
      console.error('Error rastreando evento:', error);
    }
  };

  const handleRouteClick = async () => {
    setClickCount(prev => prev + 1);
    
    if (clickCount % 3 === 0) {
      setTrafficStatus("red");
    } else if (clickCount % 3 === 1) {
      setTrafficStatus("yellow");
    } else {
      setTrafficStatus("blue");
    }

    if (selectedRoute) {
      try {
        await eventTracker.trackRouteClick(selectedRoute._id);
      } catch (error) {
        console.error('Error rastreando click:', error);
      }
    }
  };

  // =====================
  // RENDER
  // =====================

  return (
    <div className="App">
      <Header />
      <Sidebar onRouteSelect={handleRouteSelect} />
      
      <div className="content-wrapper">
        <div className="map-container">
          <MapContainer 
            center={[20.5215, -100.8086]} 
            zoom={13} 
            style={{ height: '500px', width: '90%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {selectedRoute && selectedRoute.gpsCoordinates && selectedRoute.gpsCoordinates.length > 0 && (
              <>
                <Polyline 
                  positions={selectedRoute.gpsCoordinates} 
                  color={trafficStatus}
                  eventHandlers={{
                    click: handleRouteClick
                  }}
                />
                {currentPosition && (
                  <Marker 
                    position={currentPosition} 
                    icon={L.icon({ 
                      iconUrl: truckIcon, 
                      iconSize: [32, 32] 
                    })}
                  >
                    <Popup>Camión en ruta</Popup>
                  </Marker>
                )}
              </>
            )}
            
            {userPosition && (
              <Marker 
                position={userPosition} 
                icon={L.icon({ 
                  iconUrl: userIcon,
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                })}
              >
                <Popup>Tu ubicación actual</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="details-container">
          <h2>Detalles de la Ruta</h2>
          
          {selectedRoute ? (
            <div>
              <p><strong>Nombre:</strong> {selectedRoute.name || 'N/A'}</p>
              <p><strong>Código:</strong> {selectedRoute.routeCode || 'N/A'}</p>
              <p><strong>Ciudad:</strong> {selectedRoute.city || 'N/A'}</p>
              <p><strong>Horario:</strong> {selectedRoute.schedule || 'N/A'}</p>
              <p><strong>Tiempo estimado de recorrido:</strong> {randomTime || 0} minutos</p>
              <p><strong>Estado del tráfico:</strong> { 
                trafficStatus === 'red' 
                  ? '🔴 Congestión Alta' 
                  : trafficStatus === 'yellow' 
                  ? '🟡 Congestión Leve' 
                  : trafficStatus === 'blue' 
                  ? '🟢 Libre' 
                  : 'Estado desconocido'
              }</p>

              {/* Estadísticas de Eventos */}
              <div className="event-stats" style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#f0f0f0',
                borderRadius: '5px'
              }}>
                <h3>📊 Estadísticas de Uso</h3>
                
                {statsLoading ? (
                  <p>Cargando estadísticas...</p>
                ) : statsError ? (
                  <p style={{color: 'orange'}}>⚠️ {statsError}</p>
                ) : eventStats ? (
                  <>
                    <p><strong>Total de eventos:</strong> {eventStats.totalEvents || 0}</p>
                    <p><strong>Usuarios únicos:</strong> {eventStats.uniqueUsers || 0}</p>
                    <p><strong>Tasa de éxito:</strong> {eventStats.successRate || 0}%</p>
                    <p><strong>Duración promedio en ruta:</strong> {eventStats.avgDurationOnRoute || 0}s</p>
                  </>
                ) : (
                  <p>Sin datos de eventos aún</p>
                )}
              </div>

              {/* Estado de Captura de Eventos */}
              <div className="tracking-status" style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#e8f5e9',
                borderRadius: '5px',
                fontSize: '0.9em'
              }}>
                <p>
                  {eventTracker.isOnline 
                    ? '✅ Eventos capturados en tiempo real' 
                    : '📦 Eventos guardados localmente (sin conexión)'}
                </p>
              </div>
            </div>
          ) : (
            <p>Selecciona una ruta para ver sus detalles y estadísticas</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
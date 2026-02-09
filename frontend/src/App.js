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

function App() {
			// Maneja la selección de ruta desde Sidebar
			const handleRouteSelect = (route) => {
				setSelectedRoute(route);
				setCurrentPosition(route && route.gpsCoordinates && route.gpsCoordinates.length > 0 ? route.gpsCoordinates[0] : null);
				setLastRouteId(route ? route.id : null);
				// Simula tiempo estimado aleatorio
				setRandomTime(route ? Math.floor(Math.random() * 30) + 10 : null);
				setTrafficStatus("blue");
				setClickCount(0);
			};

			// Maneja el clic sobre la ruta (Polyline)
			const handleRouteClick = () => {
				setClickCount(prev => prev + 1);
				// Cambia el estado del tráfico según el número de clics
				if (clickCount % 3 === 0) {
					setTrafficStatus("red");
				} else if (clickCount % 3 === 1) {
					setTrafficStatus("yellow");
				} else {
					setTrafficStatus("blue");
				}
			};
		const [selectedRoute, setSelectedRoute] = useState(null);
		const [currentPosition, setCurrentPosition] = useState(null);
		const [userPosition, setUserPosition] = useState(null);
		const [intervalId, setIntervalId] = useState(null);
		const [randomTime, setRandomTime] = useState(null);
		const [trafficStatus, setTrafficStatus] = useState("blue");
		const [clickCount, setClickCount] = useState(0);
		const [lastRouteId, setLastRouteId] = useState(null);

		// Función para obtener la ubicación del usuario
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
						console.error("Error obteniendo la ubicación del usuario:", error);
					}
				);
			}
		};

// ...existing code...
return (
	<div className="App">
		<Header />
		<Sidebar onRouteSelect={handleRouteSelect} />
		<div className="content-wrapper">
			<div className="map-container">
				<MapContainer center={[20.5215, -100.8086]} zoom={13} style={{ height: '500px', width: '90%' }}>
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
								<Marker position={currentPosition} icon={L.icon({ iconUrl: truckIcon, iconSize: [32, 32] })}>
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
							})}>
							<Popup>Tu ubicación actual</Popup>
						</Marker>
					)}
				</MapContainer>
			</div>
			<div className="details-container">
				<h2>Detalles de la Ruta</h2>
				{selectedRoute ? (
					<div>
						<p><strong>Nombre:</strong> {selectedRoute.name}</p>
						<p><strong>Ciudad:</strong> {selectedRoute.city}</p>
						<p><strong>Horario:</strong> {selectedRoute.schedule}</p>
						<p><strong>Tiempo estimado de recorrido:</strong> {randomTime} minutos</p>
						<p><strong>Estado del tráfico:</strong> { 
							trafficStatus === 'red' 
								? 'Congestión Alta' 
								: trafficStatus === 'yellow' 
								? 'Congestión Leve' 
								: trafficStatus === 'blue' 
								? 'Libre' 
								: 'Estado desconocido'
						}</p>
					</div>
				) : (
					<p>Selecciona una ruta para ver sus detalles</p>
				)}
			</div>
		</div>
		<Footer default fluid />
	</div>
);
}

export default App;
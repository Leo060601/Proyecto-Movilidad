import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

function MapPage() {
	const [routes, setRoutes] = useState([]);

	useEffect(() => {
		// Obtener rutas del servidor
		axios.get('http://localhost:5000/routes')
			.then(response => {
				setRoutes(response.data);  // Guardar las rutas en el estado
			})
			.catch(error => {
				console.error('Error al obtener las rutas:', error);
			});
	}, []);

	return (
		<div>
			<h1>Mapa de Rutas</h1>
			<MapContainer center={[20.0, -100.0]} zoom={13} style={{ width: '100%', height: '600px' }}>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
        
				{/* Muestra cada ruta */}
				{routes.map((route, index) => (
					<React.Fragment key={index}>
						<Polyline positions={route.gpsCoordinates.map(coord => [coord[0], coord[1]])} color="blue" />
            
						{/* Muestra los marcadores para cada punto de la ruta */}
						{route.gpsCoordinates.map((coord, i) => (
							<Marker key={i} position={[coord[0], coord[1]]}>
								<Popup>
									<h4>{route.name}</h4>
									<p>Coordenadas: {coord[0]}, {coord[1]}</p>
								</Popup>
							</Marker>
						))}
					</React.Fragment>
				))}
			</MapContainer>
		</div>
	);
}

export default MapPage;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; 

function Sidebar(props) {
	const [filteredRoutes, setFilteredRoutes] = useState([]);

	useEffect(() => {

		const fetchRoutes = async () => {
			try {
				const response = await axios.get('http://localhost:5000/routes'); // Actualiza la URL al nuevo endpoint
				const celayaRoutes = response.data.filter(route => route.city === 'Celaya');
				setFilteredRoutes(celayaRoutes);
			} catch (error) {
				console.error('Error fetching routes:', error);
			}
		};

		fetchRoutes(); 
	}, []);

	return (
		<div id="nav-bar">
			<input type="checkbox" id="nav-toggle" />
			<div id="nav-header">
				<label htmlFor="nav-toggle">
					<span id="nav-toggle-burger"></span>
				</label>
				<hr />
			</div>
			<div id="nav-content">
				<div className="route-list">
					{filteredRoutes.length > 0 ? (
						filteredRoutes.map(route => (
							<button key={route._id} onClick={() => props.onRouteSelect(route)}>
								{route.name}
							</button>
						))
					) : (
						<p>No routes available</p>
					)}
				</div>
				<hr />
			</div>
		</div>
	);
}

export default Sidebar;
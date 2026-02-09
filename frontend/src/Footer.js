import React from 'react';
import './App.css'; // Asegúrate de que el archivo CSS esté vinculado correctamente

const Footer = () => {
	return (
		<footer className="footer">
			<div className="bubbles">
				<div className="bubble" style={{ '--position': '25%', '--size': '5rem', '--time': '6s', '--delay': '1s', '--distance': '8rem' }}></div>
				<div className="bubble" style={{ '--position': '50%', '--size': '4rem', '--time': '5s', '--delay': '2s', '--distance': '10rem' }}></div>
				<div className="bubble" style={{ '--position': '75%', '--size': '6rem', '--time': '7s', '--delay': '0s', '--distance': '12rem' }}></div>
			</div>
			<p className="copyright">
				© 2024, Zuñiga Almaraz Leonardo - Todos los derechos reservados.
			</p>
		</footer>
	);
};

export default Footer;
import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Hello } from './pages/Frontpage'

function App() {
	return (
		<div className="App">
			<header className="App-header">
				<img 
					className="App-logo" 
					src="https://i.imgur.com/MK3eW3As.jpg"
					alt="Säkraste sidan på webben!" 
				/>
				<Hello />
			</header>
		</div>
	);
}

export default App;

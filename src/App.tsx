import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Hello} from './ui/pages/Frontpage'

function App() {
	return (
		<div className="App">
			<header className="App-header">
				<img className="App-logo" alt="Tjingeling badring" />
				<Hello/>
			</header>
		</div>
	);
}

export default App;

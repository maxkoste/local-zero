import React from 'react';
import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/login-page';
import { FrontPage } from './pages/front-page';
import { UserPage } from './pages/user-page'
import { BrowserRouter, Routes, Route} from "react-router-dom";

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	}
});

function App() {
	return (
		<ThemeProvider theme={darkTheme}>
			<BrowserRouter>
				<CssBaseline/>
			<Routes>
				<Route path="/" element={<LoginPage />} />
				<Route path="/front" element={<FrontPage />} />
				<Route path="/profile" element={<UserPage />} />
			</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;

import React from 'react';
import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/login-page';
import {FrontPage} from './pages/front-page';
import { UserPage } from './pages/user-page'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from './pages/main-layout';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	}
});

function App() {
	return (
		<ThemeProvider theme={darkTheme}>
			<BrowserRouter>
				<CssBaseline />
				<Routes>
					<Route path="/" element={<LoginPage />} />
					<Route element={<MainLayout />}>
						<Route path="/front" element={<FrontPage />} />
						<Route path="/profile" element={<UserPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;

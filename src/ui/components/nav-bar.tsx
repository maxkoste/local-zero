import React from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { FrontPage } from '../pages/front-page';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';


export default function NavBar() {
	const [value, setValue] = React.useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	const navigate = useNavigate();

	return (
		<Box sx={{ width: '100%' }}>
			<Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered>
				<Tab label="Front Page" onClick={() => navigate("/front")} />
				<Tab label="Profile" onClick={() => navigate("/profile")} />
			</Tabs>
		</Box>
	);
}

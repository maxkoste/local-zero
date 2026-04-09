
import React, { useState } from "react";
<<<<<<< HEAD:frontend/src/pages/sign-up.tsx
import { Visibility } from "../types";
=======
import { Visibility } from "../../backend/visibility";
>>>>>>> 458adfd (backend runs on its own server and exposes two endpoints for adding and getting users that are stored in a json file):src/ui/pages/sign-up.tsx


export function SignUp() {
	const [formData, setFormData] = useState({
		username: '',
		password: '',
		email: '',
		visibility: Visibility.PUBLIC
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e: React.ChangeEvent) => {
		e.preventDefault();

		try {
			const res = await fetch('http://localhost:3001/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const data = await res.json();
			console.log('Created user:', data);

		} catch (err) {
			console.error('Error:', err);
		}
	}

	return (
		<>
			<h1> THIS IS FAKE AND UNSAFE USE A DUMMY PSWRD</h1>
			<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
				<label>
					username
					<input type="text" name="username" value={formData.username} onChange={handleChange} required />
				</label>
				<label>
					Email:
					<input type="email" name="email" value={formData.email} onChange={handleChange} required />
				</label>

				<label>
					Password:
					<input type="password" name="password" value={formData.password} onChange={handleChange} required />
				</label>

				<label>
					Visibility:
					<select name="visibility" value={formData.visibility} onChange={handleChange}>
						{Object.keys(Visibility).map((key) => (
							<option key={key} value={Visibility[key as keyof typeof Visibility]}>
								{key}
							</option>
						))}
					</select>
				</label>

				<button type="submit">Sign Up</button>
			</form>
		</>
	)
}

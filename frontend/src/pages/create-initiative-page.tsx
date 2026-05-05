import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Button,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { Visibility } from "shared";

export function CreateInitiativePage() {
	const navigate = useNavigate();

	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [visibility, setVisibility] = useState<Visibility>(Visibility.PUBLIC);
	const [location, setLocation] = useState("");
	const [duration, setDuration] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const [author, setAuthor] = useState<any>(null);

	useEffect(() => {
		async function fetchCurrentUser() {
			try {
				const token = localStorage.getItem('token');

				const res = await fetch('http://localhost:3001/api/me', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				if (!res.ok) throw new Error();
				const data = await res.json();
				setAuthor(data.user);

			} catch {
				setAuthor(null);
			}
		}
		fetchCurrentUser();
	}, []);

	async function handleSubmit() {


		if (!title.trim() || !body.trim()) {
			setError("Title and description are required.");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch("http://localhost:3001/api/initiatives", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title.trim(),
					author: author,
					body: body.trim(),
					visibility,
					location: location.trim() || null,
					duration: duration.trim() || null,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error ?? "Something went wrong.");
			}

			navigate("/front");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box sx={{ maxWidth: 600, margin: "0 auto", padding: 2 }}>
			<Typography variant="h5" sx={{ mb: 3 }}>
				Create initiative
			</Typography>

			<Stack spacing={2}>
				<TextField
					label="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
					fullWidth
				/>

				<TextField
					label="Description"
					value={body}
					onChange={(e) => setBody(e.target.value)}
					required
					fullWidth
					multiline
					minRows={4}
				/>

				<TextField
					label="Visibility"
					value={visibility}
					onChange={(e) => setVisibility(e.target.value as Visibility)}
					select
					fullWidth
				>
					{(Object.values(Visibility) as string[]).map((v) => (
						<MenuItem key={v} value={v}>
							{v}
						</MenuItem>
					))}
				</TextField>

				<TextField
					label="Location (optional)"
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					fullWidth
				/>

				<TextField
					label="Duration (optional)"
					value={duration}
					onChange={(e) => setDuration(e.target.value)}
					placeholder="e.g. 2 weeks, ongoing"
					fullWidth
				/>

				{error && (
					<Typography variant="body2" color="error">
						{error}
					</Typography>
				)}

				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={loading}
				>
					{loading ? "Creating..." : "Create initiative"}
				</Button>
			</Stack>
		</Box>
	);
}

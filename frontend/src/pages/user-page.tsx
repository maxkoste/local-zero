
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Placeholder

//TODO: Ändra om i variabelnamnen så att de faktiskt stämmer överrens mellan front-och backend
type User = {
	id: number;
	name: string;
	location: string;
	bio: string;
	email: string;
	avatar?: string;
	stats: {
		Initiativ: number;
		CarbonScore: number;
	};
	recentActivity: { id: number; text: string; date: string }[];
};

const Card = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.background.paper,
	borderRadius: 16,
	padding: theme.spacing(3),
	border: `1px solid ${theme.palette.divider}`,
	boxShadow: 'none',
	alignItems: 'center',
}));

const StatBox = styled(Box)(({ theme }) => ({
	textAlign: 'center',
	padding: theme.spacing(1.5),
	borderRadius: 12,
	backgroundColor: theme.palette.action.hover,
	alignItems: 'center',
}));

const ActivityRow = styled(Box)(({ theme }) => ({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'flex-start',
	padding: theme.spacing(1.25, 0),
	'&:not(:last-child)': {
		borderBottom: `1px solid ${theme.palette.divider}`,
	},
}));

const Label = styled(Typography)(({ theme }) => ({
	fontSize: 11,
	fontWeight: 600,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: theme.palette.text.disabled,
	marginBottom: theme.spacing(0.5),
}));

//TODO: Måste fixa någon sorts lagring på bio, och annan data som inte skapas när man signar upp.

export function UserPage() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const loadUser = async () => {
			try {
				const token = localStorage.getItem('token');

				const res = await fetch('http://localhost:3001/api/me', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				console.log("Authentication user")

				if (!res.ok) throw new Error();
				const data = await res.json();

				console.log("Data: " + JSON.stringify(data));
				const user = data.user;

				const userId = user.id;

				console.log("userId " + userId);

				const profileRes = await fetch(`http://localhost:3001/api/users/${userId}/profile`,{
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const profileData = await profileRes.json();

				console.log("Profile Data " + JSON.stringify(profileRes));

				setUser(profileData);
				
			} catch (error) {
				console.error("Error loading user data:", error);
			} finally {
				setLoading(false);
			}
		};

		loadUser();
	}, []);

	if (loading) {
		return <Box sx={{ p: 4 }}>Loading profile...</Box>;
	}

	if (!user) {
		return <Box sx={{ p: 4 }}>Could not load user.</Box>;
	}

	return (
		<Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
			<Grid container spacing={3}>

				{/* Left column */}
				<Grid size={{ xs: 12, md: 4 }}>
					<Card>
						<Box sx={{ textAlign: 'center', mb: 3 }}>
							<Avatar
								src={user.avatar}
								sx={{
									width: 88, height: 88, mx: 'auto', mb: 2,
									fontSize: 28, bgcolor: 'primary.light',
									color: 'primary.dark', fontWeight: 600,
								}}
							>
								{user.name.split(' ').map(n => n[0]).join('')}
							</Avatar>
							<Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
								{user.name}
							</Typography>
						</Box>

						<Divider sx={{ my: 2 }} />

						<Grid container spacing={1} sx={{ mb: 2, justifyContent: 'center' }}>
							{Object.entries(user.stats).map(([key, val]) => (
								<Grid size={8} key={key}>
									<StatBox>
										<Typography sx={{ fontWeight: 700, fontSize: 18 }}>
											{val.toLocaleString()}
										</Typography>
										<Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
											{key}
										</Typography>
									</StatBox>
								</Grid>
							))}
						</Grid>
						<Button
							variant="outlined"
							fullWidth
							onClick={() => navigate('/chat/chat-1')}
							sx={{ mt: 1, borderRadius: 2 }}
						>
							Skicka meddelande
						</Button>
					</Card>
				</Grid>

				{/* Right column */}
				<Grid size={{ xs: 12, md: 8 }}>
					<Grid container spacing={3}>

						<Grid size={12}>
							<Card>
								<Label>About</Label>
								<Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
									{user.bio}
								</Typography>
							</Card>
						</Grid>

						<Grid size={{ xs: 12, sm: 12 }}>
							<Card sx={{ height: '100%' }}>
								<Label>Contact</Label>
								{[
									{ label: 'Email', value: user.email },
									{ label: 'Location', value: user.location },
								].map(({ label, value }) => (
									<Box key={label} sx={{ mb: 1.5 }}>
										<Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 600 }}>
											{label}
										</Typography>
										<Typography variant="body2">{value}</Typography>
									</Box>
								))}
							</Card>
						</Grid>

						<Grid size={12}>
							<Card>
								<Label>Recent activity</Label>
								{user.recentActivity.map(item => (
									<ActivityRow key={item.id}>
										<Typography variant="body2" color="text.secondary" sx={{ flex: 1, pr: 2 }}>
											{item.text}
										</Typography>
										<Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
											{item.date}
										</Typography>
									</ActivityRow>
								))}
							</Card>
						</Grid>

					</Grid>
				</Grid>
			</Grid>
		</Box>
	);
}

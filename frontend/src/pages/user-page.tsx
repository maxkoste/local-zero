import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';

const ECO_ACTIONS: Record<string, { label: string; points: number }> = {
    BIKE:   { label: 'Bike to work',          points: 10   },
    TREE:   { label: 'Plant a tree',           points: 20   },
    PANTA:  { label: 'Recycle',                points: 5    },
    CEO:    { label: 'Shoot a CEO',            points: 1000 },
    OIL:    { label: 'Oil spill',              points: -500 },
    FLIGHT: { label: 'Take a flight to work',  points: -50  },
};

type User = {
    userId: number;
    username: string;
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

export function UserPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState<string>('BIKE');
    const [logging, setLogging] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });
    const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);

    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = localStorage.getItem('token');
                let userId = id;

                const meRes = await fetch('http://localhost:3001/api/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (meRes.ok) {
                    const meData = await meRes.json();
                    setLoggedInUserId(meData.user.id);
                    if (!userId) userId = String(meData.user.id);
                }

                const profileRes = await fetch(`http://localhost:3001/api/users/${userId}/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!profileRes.ok) throw new Error('Profile fetch failed');
                const profileData = await profileRes.json();
                setUser(profileData);
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [id]);

    const isOwnProfile = !id || (loggedInUserId !== null && Number(id) === loggedInUserId);

    async function handleLogAction() {
        if (!user) return;
        setLogging(true);
        try {
            const token = localStorage.getItem('token');
            const targetId = id ?? String(loggedInUserId);

            const res = await fetch(`http://localhost:3001/api/users/${targetId}/eco-actions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ key: selectedAction }),
            });

            if (!res.ok) throw new Error();

            const action = ECO_ACTIONS[selectedAction];
            const pointDelta = action.points;

            setUser(prev => prev ? {
                ...prev,
                stats: {
                    ...prev.stats,
                    CarbonScore: prev.stats.CarbonScore + pointDelta,
                }
            } : prev);

            setSnackbar({
                open: true,
                message: `"${action.label}" logged! ${pointDelta >= 0 ? '+' : ''}${pointDelta} points`,
                severity: 'success',
            });
        } catch {
            setSnackbar({ open: true, message: 'Could not log action.', severity: 'error' });
        } finally {
            setLogging(false);
        }
    }

    if (loading) return <Box sx={{ p: 4 }}>Loading profile...</Box>;
    if (!user) return <Box sx={{ p: 4 }}>Could not load user.</Box>;

    const action = ECO_ACTIONS[selectedAction];

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
                                {user.username.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                {user.username}
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

                        {/* Eco-action section – own profile only */}
                        {isOwnProfile && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Label>Log eco-action</Label>

                                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                                    <InputLabel>What did you do?</InputLabel>
                                    <Select
                                        value={selectedAction}
                                        label="What did you do?"
                                        onChange={e => setSelectedAction(e.target.value)}
                                    >
                                        {Object.entries(ECO_ACTIONS).map(([key, a]) => (
                                            <MenuItem key={key} value={key}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                                                    <span>{a.label}</span>
                                                    <Chip
                                                        label={`${a.points >= 0 ? '+' : ''}${a.points}p`}
                                                        size="small"
                                                        color={a.points >= 0 ? 'success' : 'error'}
                                                        sx={{ fontSize: 11 }}
                                                    />
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleLogAction}
                                    disabled={logging}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {logging ? 'Logging...' : `Log (${action.points >= 0 ? '+' : ''}${action.points}p)`}
                                </Button>
                            </>
                        )}

                        {!isOwnProfile && (
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => navigate('/chat/chat-1')}
                                sx={{ mt: 1, borderRadius: 2 }}
                            >
                                Send message
                            </Button>
                        )}
                    </Card>
                </Grid>

                {/* Right column */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Grid container spacing={3}>

                        <Grid size={12}>
                            <Card>
                                <Label>About</Label>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                    {user.bio || '–'}
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
                                        <Typography variant="body2">{value || '–'}</Typography>
                                    </Box>
                                ))}
                            </Card>
                        </Grid>

                        <Grid size={12}>
                            <Card>
                                <Label>Recent activity</Label>
                                {user.recentActivity.length === 0 ? (
                                    <Typography variant="body2" color="text.disabled">No activity yet.</Typography>
                                ) : (
                                    user.recentActivity.map(item => (
                                        <ActivityRow key={item.id}>
                                            <Typography variant="body2" color="text.secondary" sx={{ flex: 1, pr: 2 }}>
                                                {item.text}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
                                                {item.date}
                                            </Typography>
                                        </ActivityRow>
                                    ))
                                )}
                            </Card>
                        </Grid>

                    </Grid>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
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
import { Action, ActionKey } from 'shared';

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
    recentActivity: { id: string; text: string; date: string }[];
};

type UserRecord = {
    visibility: string;
    role: 'user' | 'admin';
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
    const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState<ActionKey>('BIKE');
    const [logging, setLogging] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });
    const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
    const [firstChatId, setFirstChatId] = useState<string | null>(null);

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
                setUser(await profileRes.json());

                const userRes = await fetch(`http://localhost:3001/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (userRes.ok) setUserRecord(await userRes.json());

            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [id]);

    const isOwnProfile = !id || (loggedInUserId !== null && Number(id) === loggedInUserId);

    // Fetch just the first chat ID for the "Open inbox" button
    useEffect(() => {
        if (!isOwnProfile || loggedInUserId === null) return;

        const loadFirstChat = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:3001/api/chats?userId=${loggedInUserId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const chats = await res.json();
                    if (chats.length > 0) setFirstChatId(chats[0].id);
                }
            } catch {
                // fail silently
            }
        };

        loadFirstChat();
    }, [isOwnProfile, loggedInUserId]);

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

            const actionDef = Action[selectedAction];
            const pointDelta = actionDef.points;

            setUser(prev => prev ? {
                ...prev,
                stats: { ...prev.stats, CarbonScore: prev.stats.CarbonScore + pointDelta }
            } : prev);

            setSnackbar({
                open: true,
                message: `"${actionDef.label}" logged! ${pointDelta >= 0 ? '+' : ''}${pointDelta} points`,
                severity: 'success',
            });
        } catch {
            setSnackbar({ open: true, message: 'Could not log action.', severity: 'error' });
        } finally {
            setLogging(false);
        }
    }

    async function handleOpenChat() {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3001/api/chats/with/${user?.userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Could not open chat.");
            const chat = await res.json();
            navigate(`/chat/${chat.id}`);
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) return <Box sx={{ p: 4 }}>Loading profile...</Box>;
    if (!user) return <Box sx={{ p: 4 }}>Could not load user.</Box>;

    const actionDef = Action[selectedAction];

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
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1, flexWrap: 'wrap' }}>
                                {userRecord?.role && (
                                    <Chip
                                        label={userRecord.role}
                                        size="small"
                                        color={userRecord.role === 'admin' ? 'warning' : 'default'}
                                        sx={{ textTransform: 'capitalize', fontSize: 11 }}
                                    />
                                )}
                                {userRecord?.visibility && (
                                    <Chip
                                        label={userRecord.visibility.replace('_', ' ')}
                                        size="small"
                                        variant="outlined"
                                        sx={{ textTransform: 'capitalize', fontSize: 11 }}
                                    />
                                )}
                            </Box>
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

                        {isOwnProfile ? (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Label sx={{ mb: 2 }}>Log eco-action</Label>   
                                
                                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                                    <InputLabel>What did you do?</InputLabel>
                                    <Select
                                        value={selectedAction}
                                        label="What did you do?"
                                        onChange={e => setSelectedAction(e.target.value as ActionKey)}
                                    >
                                        {(Object.entries(Action) as [ActionKey, typeof Action[ActionKey]][]).map(([key, a]) => (
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
                                    sx={{ borderRadius: 2, mb: 1 }}
                                >
                                    {logging ? 'Logging...' : `Log (${actionDef.points >= 0 ? '+' : ''}${actionDef.points}p)`}
                                </Button>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => navigate(firstChatId ? `/chat/${firstChatId}` : '/chat')}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Open inbox
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleOpenChat}
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
                                                {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
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
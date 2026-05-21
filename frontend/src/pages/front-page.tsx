import { useEffect, useState } from "react";
import { Stack, Box, Button, Typography, Tabs, Tab, Paper, Chip } from "@mui/material";
import { ContentRecord, CATEGORIES } from "shared";
import { InitiativeCard } from "../components/initiative-card";
import { useNavigate } from "react-router-dom";
import { CategoryChip } from "../components/category-chip";

const ALL_NEIGHBORHOODS = ['public', 'kirseberg', 'sofielund', 'sorgenfri', 'folkets_park'] as const;
type Neighborhood = typeof ALL_NEIGHBORHOODS[number];

const NEIGHBORHOOD_LABELS: Record<string, string> = {
    public:       'All',
    kirseberg:    'Kirseberg',
    sofielund:    'Sofielund',
    sorgenfri:    'Sorgenfri',
    folkets_park: 'Folkets Park',
};

type CommunityScores = Record<string, number>;

type LoggedInUser = {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'admin';
};

export function FrontPage() {
    const navigate = useNavigate();
    const [apiInitiatives, setApiInitiatives]   = useState<ContentRecord[]>([]);
    const [communityScores, setCommunityScores] = useState<CommunityScores>({});
    const [error, setError]                     = useState<string | null>(null);
    const [activeTab, setActiveTab]             = useState(0);
    const [loggedInUser, setLoggedInUser]       = useState<LoggedInUser | null>(null);
    const [userVisibility, setUserVisibility]   = useState<string>('kirseberg');
    const [activeCategories, setActiveCategories] = useState<string[]>([]);

    const token = localStorage.getItem("token");

    function toggleCategoryFilter(cat: string) {
    setActiveCategories(prev =>
        prev.includes(cat) ? prev.filter(existing => existing !== cat) : [...prev, cat]
    );
    }

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const meRes = await fetch('http://localhost:3001/api/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!meRes.ok) return;
                const meData = await meRes.json();
                setLoggedInUser(meData.user);

                const userRes = await fetch(`http://localhost:3001/api/users/${meData.user.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!userRes.ok) return;
                const userData = await userRes.json();
                setUserVisibility(userData.visibility?.toLowerCase() ?? 'kirseberg');
            } catch {
                // fail silently
            }
        }
        loadCurrentUser();
    }, []);

    function fetchInitiatives() {
        fetch(`http://localhost:3001/api/initiatives`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then((data: ContentRecord[]) => setApiInitiatives(data))
            .catch(() => setError("Could not load initiatives from server."));
    }

    function fetchCommunityScores() {
        fetch(`http://localhost:3001/api/community-scores`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setCommunityScores(data))
            .catch(() => {});
    }

    useEffect(() => {
        fetchInitiatives();
        fetchCommunityScores();
    }, [token]);

    async function handleDelete(id: string) {
        await fetch(`http://localhost:3001/api/initiatives/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchInitiatives();
    }

    const isAdmin = loggedInUser?.role === 'admin';

    const visibleNeighborhoods = isAdmin
        ? ALL_NEIGHBORHOODS
        : ALL_NEIGHBORHOODS.filter(n => n === 'public' || n === userVisibility);

    const safeTab = Math.min(activeTab, visibleNeighborhoods.length - 1);
    const activeNeighborhood = visibleNeighborhoods[safeTab];

    const filteredInitiatives = [...apiInitiatives]
        .filter(i => {
            if (activeNeighborhood !== 'public') {
                if (
                    i.visibility.toLowerCase() !== activeNeighborhood &&
                    i.visibility.toLowerCase() !== 'public'
                ) return false;
            }
            if (activeCategories.length > 0) {
                const cats = i.categories ?? [];
                if (!activeCategories.every(c => cats.includes(c))) return false;
            }
            return true;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const communityScore = communityScores[activeNeighborhood] ?? 0;

    return (
        <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Initiatives</Typography>
                <Button variant="contained" onClick={() => navigate("/create-initiative")}>
                    New initiative
                </Button>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 3, mb: 2, overflow: 'hidden' }}>
                <Tabs
                    value={safeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    {visibleNeighborhoods.map(n => (
                        <Tab key={n} label={NEIGHBORHOOD_LABELS[n]} sx={{ fontSize: 13, minWidth: 80 }} />
                    ))}
                </Tabs>

                {activeNeighborhood !== 'public' && (
                    <Box sx={{
                        px: 2.5, py: 1.5,
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        bgcolor: 'action.hover',
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            Community CarbonScore for <strong>{NEIGHBORHOOD_LABELS[activeNeighborhood]}</strong>:
                        </Typography>
                        <Chip
                            label={`${communityScore.toLocaleString()} pts`}
                            color={communityScore >= 0 ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 700 }}
                        />
                    </Box>
                )}
            </Paper>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {CATEGORIES.map(cat => (
                    <CategoryChip
                        key={cat}
                        label={cat}
                        selected={activeCategories.includes(cat)}
                        onClick={() => toggleCategoryFilter(cat)}
                    />
                ))}
            </Box>

            {error && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <Stack spacing={2}>
                {filteredInitiatives.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
                        No initiatives in this feed yet.
                    </Typography>
                ) : (
                    filteredInitiatives.map(initiative => (
                        <InitiativeCard
                            key={initiative.id}
                            content={initiative}
                            onDelete={apiInitiatives.some(i => i.id === initiative.id)
                                ? () => handleDelete(initiative.id)
                                : undefined}
                            onRefresh={fetchInitiatives}
                        />
                    ))
                )}
            </Stack>
        </Box>
    );
}
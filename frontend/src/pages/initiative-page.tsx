import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Stack, Typography, TextField, Button, Divider } from "@mui/material";
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { IContent, Visibility } from "shared";
import { InitiativeCard } from "../components/initiative-card";
import { UpdateCard } from "../components/update-card";

function getCurrentUserInfo(): { id: string; role: string } | null {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { id: String(payload.userId), role: payload.role ?? 'user' };
    } catch {
        return null;
    }
}

export function InitiativePage() {
    const { id } = useParams();
    const [initiative, setInitiative] = useState<IContent | null>(null);
    const [updateTitle, setUpdateTitle] = useState("");
    const [updateBody, setUpdateBody]   = useState("");
    const [imageUrl, setImageUrl]       = useState("");
    const [imageAlt, setImageAlt]       = useState("");
    const [posting, setPosting]         = useState(false);
    const [joining, setJoining]         = useState(false);
    const [error, setError]             = useState<string | null>(null);

    const currentUser = getCurrentUserInfo();

    function fetchInitiative() {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:3001/api/initiatives/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch initiative');
                return res.json();
            })
            .then((data: IContent) => setInitiative(data))
            .catch(() => setInitiative(null));
    }

    useEffect(() => {
        fetchInitiative();
    }, [id]);

    const isMember    = currentUser && initiative ? (initiative.members ?? []).includes(currentUser.id) : false;
    const memberCount = initiative?.members?.length ?? 0;

    async function handleJoin() {
        console.log('handleJoin called', { currentUser, initiative: initiative?.id });
        if (!currentUser || !initiative) {
            console.log('early return – missing user or initiative');
            return;
        }
        setJoining(true);

        const current = initiative.members ?? [];
        const next = isMember
            ? current.filter(uid => uid !== currentUser.id)
            : [...current, currentUser.id];

        console.log('sending members:', next);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/api/initiatives/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ members: next }),
            });
            console.log('response status:', res.status);
            const data = await res.json();
            console.log('response body:', data);
            fetchInitiative();
        } catch (err) {
            console.error('Failed to update membership', err);
        } finally {
            setJoining(false);
        }
    }

    async function handlePostUpdate() {
        if (!updateTitle.trim() || !updateBody.trim()) {
            setError("Title and description are required.");
            return;
        }

        setPosting(true);
        setError(null);

        const image = imageUrl.trim()
            ? { id: String(Date.now()), url: imageUrl.trim(), alt: imageAlt.trim() || undefined }
            : null;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/api/initiatives/${id}/children`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        type: "update",
                        title: updateTitle.trim(),
                        body: updateBody.trim(),
                        image,
                        visibility: initiative?.visibility ?? Visibility.PUBLIC,
                    }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error ?? "Something went wrong.");
            }

            setUpdateTitle("");
            setUpdateBody("");
            setImageUrl("");
            setImageAlt("");
            fetchInitiative();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setPosting(false);
        }
    }

    if (!initiative) {
        return (
            <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
                <Typography>Initiative not found.</Typography>
            </Box>
        );
    }

    const updates = initiative.children.filter(c => c.type === "update");

    return (
        <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
            <Stack spacing={2}>
                <InitiativeCard
                    content={initiative}
                    showLink={false}
                    detailed={true}
                    onRefresh={fetchInitiative}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button
                        variant={isMember ? "outlined" : "contained"}
                        color={isMember ? "error" : "primary"}
                        onClick={handleJoin}
                        disabled={joining || !currentUser}
                        size="small"
                    >
                        {isMember ? "Leave initiative" : "Join initiative"}
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {memberCount} {memberCount === 1 ? "member" : "members"}
                        </Typography>
                    </Box>
                </Box>

                {updates.length > 0 ? (
                    <>
                        <Typography variant="overline" color="text.secondary" sx={{ pl: 1 }}>
                            Updates ({updates.length})
                        </Typography>
                        {updates.map(update => (
                            <UpdateCard
                                key={update.id}
                                content={update}
                                initiativeId={id!}
                                onRefresh={fetchInitiative}
                            />
                        ))}
                    </>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                        No updates yet.
                    </Typography>
                )}

                <Divider />
                <Box>
                    <Typography variant="overline" color="text.secondary">
                        Post an update
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                        <TextField
                            label="Title"
                            value={updateTitle}
                            onChange={e => setUpdateTitle(e.target.value)}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Description"
                            value={updateBody}
                            onChange={e => setUpdateBody(e.target.value)}
                            fullWidth
                            multiline
                            minRows={3}
                            size="small"
                        />
                        <TextField
                            label="Image URL (optional)"
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="https://example.com/image.jpg"
                        />
                        {imageUrl.trim() && (
                            <TextField
                                label="Image description (optional)"
                                value={imageAlt}
                                onChange={e => setImageAlt(e.target.value)}
                                fullWidth
                                size="small"
                                placeholder="A brief description of the image"
                            />
                        )}
                        {error && (
                            <Typography variant="caption" color="error">
                                {error}
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            onClick={handlePostUpdate}
                            disabled={posting}
                            sx={{ alignSelf: "flex-end" }}
                        >
                            {posting ? "Posting..." : "Post update"}
                        </Button>
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}
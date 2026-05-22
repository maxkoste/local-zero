import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Stack, Typography, TextField, Button, Divider } from "@mui/material";
import { IContent, Visibility } from "shared";
import { InitiativeCard } from "../components/initiative-card";
import { UpdateCard } from "../components/update-card";

export function InitiativePage() {
    const { id } = useParams();
    const [initiative, setInitiative] = useState<IContent | null>(null);
    const [updateTitle, setUpdateTitle] = useState("");
    const [updateBody, setUpdateBody]   = useState("");
    const [imageUrl, setImageUrl]       = useState("");
    const [imageAlt, setImageAlt]       = useState("");
    const [posting, setPosting]         = useState(false);
    const [error, setError]             = useState<string | null>(null);

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
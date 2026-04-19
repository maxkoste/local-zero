import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Stack, Typography, TextField, Button, Divider } from "@mui/material";
import { initiatives as mockInitiatives, IContent, Visibility } from "shared";
import { InitiativeCard } from "../components/content-card";
import { UpdateCard } from "../components/update-card";

// TODO: replace with logged-in user when that exists
const hardcodedAuthor = {
    id: 1,
    username: "Lolita",
    email: "lolita@email.com",
    visibility: Visibility.PUBLIC,
};

export function InitiativePage() {
    const { id } = useParams();
    const [initiative, setInitiative] = useState<IContent | undefined>(
        mockInitiatives.find((i) => i.id === id)
    );

    const [updateTitle, setUpdateTitle] = useState("");
    const [updateBody, setUpdateBody] = useState("");
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function fetchInitiative() {
        fetch(`http://localhost:3001/api/initiatives`)
            .then((res) => res.json())
            .then((data: IContent[]) => {
                const found = data.find((i) => i.id === id);
                if (found) setInitiative(found);
            })
            .catch(() => {});
    }

    useEffect(() => {
        if (!mockInitiatives.find((i) => i.id === id)) {
            fetchInitiative();
        }
    }, [id]);

    async function handlePostUpdate() {
        if (!updateTitle.trim() || !updateBody.trim()) {
            setError("Title and description are required.");
            return;
        }

        setPosting(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:3001/api/initiatives/${id}/children`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "update",
                        title: updateTitle.trim(),
                        body: updateBody.trim(),
                        author: hardcodedAuthor,
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

    const updates = initiative.children.filter((c) => c.type === "update");
    const isMockInitiative = !!mockInitiatives.find((i) => i.id === id);

    return (
        <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
            <Stack spacing={2}>
                <InitiativeCard content={initiative} showLink={false} detailed={true} />

                {updates.length > 0 && (
                    <>
                        <Typography variant="overline" color="text.secondary" sx={{ pl: 1 }}>
                            Updates ({updates.length})
                        </Typography>
                        {updates.map((update) => (
                            <UpdateCard key={update.id} content={update} />
                        ))}
                    </>
                )}

                {updates.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                        No updates yet.
                    </Typography>
                )}

                {!isMockInitiative && (
                    <>
                        <Divider />
                        <Box>
                            <Typography variant="overline" color="text.secondary">
                                Post an update
                            </Typography>
                            <Stack spacing={1.5} sx={{ mt: 1 }}>
                                <TextField
                                    label="Title"
                                    value={updateTitle}
                                    onChange={(e) => setUpdateTitle(e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="Description"
                                    value={updateBody}
                                    onChange={(e) => setUpdateBody(e.target.value)}
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    size="small"
                                />
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
                    </>
                )}
            </Stack>
        </Box>
    );
}
import { useEffect, useState } from "react";
import { Stack, Box, Button, Typography } from "@mui/material";
import { initiatives as mockInitiatives, IContent } from "shared";
import { ContentCard } from "../components/content-card";
import { useNavigate } from "react-router-dom";

export function FrontPage() {
    const navigate = useNavigate();
    const [apiInitiatives, setApiInitiatives] = useState<IContent[]>([]);
    const [error, setError] = useState<string | null>(null);

    function fetchInitiatives() {
        fetch("http://localhost:3001/api/initiatives")
            .then((res) => res.json())
            .then((data) => setApiInitiatives(data))
            .catch(() => setError("Could not load initiatives from server."));
    }

    useEffect(() => {
        fetchInitiatives();
    }, []);

    async function handleDelete(id: string) {
        await fetch(`http://localhost:3001/api/initiatives/${id}`, {
            method: "DELETE",
        });
        fetchInitiatives();
    }

    /*
    const allInitiatives = [...mockInitiatives, ...apiInitiatives]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        */
    //Fix sålänge så att det inte kraschar om någon av dem inte är en array, vilket den inte är i vissa fall. Borde kanske fixa så att de alltid är det istället.
    const allInitiatives = [
    ...(Array.isArray(mockInitiatives) ? mockInitiatives : []),
    ...(Array.isArray(apiInitiatives) ? apiInitiatives : [])
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Initiatives</Typography>
                <Button variant="contained" onClick={() => navigate("/create-initiative")}>
                    New initiative
                </Button>
            </Box>

            {error && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <Stack spacing={2}>
                {allInitiatives.map((initiative) => (
                    <ContentCard
                        key={initiative.id}
                        content={initiative}
                        onDelete={apiInitiatives.some(i => i.id === initiative.id)
                            ? () => handleDelete(initiative.id)
                            : undefined}
                    />
                ))}
            </Stack>
        </Box>
    );
}
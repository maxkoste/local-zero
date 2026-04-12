import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { initiatives as mockInitiatives, IContent } from "shared";
import { InitiativeCard } from "../components/content-card";
import { UpdateCard } from "../components/update-card";

export function InitiativePage() {
    const { id } = useParams();
    const [initiative, setInitiative] = useState<IContent | undefined>(
        mockInitiatives.find((i) => i.id === id)
    );

    useEffect(() => {
        if (!initiative) {
            fetch(`http://localhost:3001/api/initiatives`)
                .then((res) => res.json())
                .then((data: IContent[]) => {
                    const found = data.find((i) => i.id === id);
                    setInitiative(found);
                })
                .catch(() => {});
        }
    }, [id]);

    if (!initiative) {
        return (
            <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
                <Typography>Initiative not found.</Typography>
            </Box>
        );
    }

    const updates = initiative.children.filter((c) => c.type === "update");

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
            </Stack>
        </Box>
    );
}
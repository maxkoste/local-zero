import { useParams } from "react-router-dom";
import { Box, Stack, Typography } from "@mui/material";
import { initiatives } from "../types";
import { InitiativeCard } from "../components/content-card";
import { UpdateCard } from "../components/update-card";

export function InitiativePage() {
    const { id } = useParams();

    const initiative = initiatives.find((i) => i.id === id);

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
                {/* The initiative itself */}
                <InitiativeCard content={initiative} showLink={false} />

                {/* Updates with expandable comments */}
                {updates.length > 0 && (
                    <>
                        <Typography
                            variant="overline"
                            color="text.secondary"
                            sx={{ pl: 1 }}
                        >
                            Updates ({updates.length})
                        </Typography>
                        {updates.map((update) => (
                            <UpdateCard key={update.id} content={update} />
                        ))}
                    </>
                )}

                {updates.length === 0 && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ pl: 1 }}
                    >
                        No updates yet.
                    </Typography>
                )}
            </Stack>
        </Box>
    );
}
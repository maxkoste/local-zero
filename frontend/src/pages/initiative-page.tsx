import { useParams } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { initiatives } from "../types";
import { ContentCard } from "../components/content-card";
import { Content } from "../types";

export function InitiativePage() {
    const { id } = useParams();

    const initiative = initiatives.find(i => i.id === id);

    if (!initiative) {
        return <div>Not found</div>;
    }

    return (
        <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
            <Stack spacing={2}>
                <ContentCard content={initiative} />

                {initiative.children.map(child => (
                    <ContentCard key={child.id} content={child as Content} />
                ))}
            </Stack>
        </Box>
    );
}
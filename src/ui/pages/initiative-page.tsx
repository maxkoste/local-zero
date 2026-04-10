import { useParams } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { initiatives } from "../../backend/storage-system";
import { ContentCard } from "../components/content-card";
import { Content } from "../../backend/content/content";

export function InitiativePage() {
    const { id } = useParams();

    const initiative = initiatives.find(i => i.id === id);

    if (!initiative) {
        return <div>Not found</div>;
    }

    return (
        <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
            <Stack spacing={2}>
                {/* Root initiative */}
                <ContentCard content={initiative} />

                {/* Children (updates/comments) */}
                {initiative.children.map(child => (
                    <ContentCard key={child.id} content={child as Content} />
                ))}
            </Stack>
        </Box>
    );
}
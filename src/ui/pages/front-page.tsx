import { Stack, Box } from "@mui/material";
import { initiatives } from "../../backend/storage-system";
import { ContentCard } from "../components/content-card";

export function FrontPage() {
    return (
        <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
            <Stack spacing={2}>
                {initiatives.map((initiative) => (
                    <ContentCard key={initiative.id} content={initiative} />
                ))}
            </Stack>
        </Box>
    );
}
import { Card, CardContent, Typography, CardHeader } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Thread = {
    id: string;
    title: string;
    body: string;
    author: string;
};

export default function ThreadCard({ thread }: { thread: Thread }) {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    return (
        <Card sx={{ maxWidth: 600, margin: "0 auto" }}>
            <CardHeader
                title={thread.title}
                subheader={`Posted by ${thread.author}`}
                onClick={() => navigate(`/thread/${thread.id}`)}
                sx={{ cursor: "pointer" }}
            />

            <CardContent>
                <Typography variant="body2">
                    {expanded
                        ? thread.body
                        : thread.body.slice(0, 100) + "..."}
                </Typography>
            </CardContent>
        </Card>
    );
}

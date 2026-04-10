import { Card, CardContent, Typography, CardHeader } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Content } from "../../backend/content/content";

type Props = {
    content: Content;
};

export function ContentCard({ content }: Props) {
    switch (content.type) {
    case "initiative":
        return <InitiativeCard content={content} />;
    case "update":
        return <UpdateCard content={content} />;
    case "comment":
        return <CommentCard content={content} />;
    }
}

type BaseProps = {
    content: Content;
    children?: React.ReactNode;
};

export function BaseContentCard({ content, children }: BaseProps) {
    return (
        <Card sx={{ maxWidth: 600, margin: "0 auto" }}>
            <CardHeader
                title={content.title}
                subheader={`Posted by ${content.author.username}`}
            />

            <CardContent>
                <Typography variant="body2">
                    {content.body}
                </Typography>

                <Typography variant="caption" sx={{ display: "block" }}>
                    {content.date.toLocaleDateString()}
                </Typography>

                {children}
            </CardContent>
        </Card>
    );
}

export default function InitiativeCard({ content }: { content: Content }) {
    const navigate = useNavigate();

    return (
        <BaseContentCard content={content}>
            <div
                onClick={() => navigate(`/initiative/${content.id}`)}
                style={{ cursor: "pointer" }}
            >
                View initiative
            </div>
        </BaseContentCard>
    );
}

export function UpdateCard({ content }: { content: Content }) {
    return (
        <BaseContentCard content={content}>
            <Typography variant="caption">
                Update
            </Typography>
        </BaseContentCard>
    );
}

export function CommentCard({ content }: { content: Content }) {
    return (
        <BaseContentCard content={content}>
            <Typography variant="caption">
                Comment
            </Typography>
        </BaseContentCard>
    );
}
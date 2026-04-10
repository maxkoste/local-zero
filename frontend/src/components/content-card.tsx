import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IContent } from "../types";

type Props = {
    content: IContent;
};

export function ContentCard({ content }: Props) {
    switch (content.type) {
        case "initiative":
            return <InitiativeCard content={content} />;
        case "update":
            // Updates are rendered by UpdateCard on the initiative page,
            // but fall back to a plain card if used standalone.
            return <BaseContentCard content={content} />;
        case "comment":
            return <BaseContentCard content={content} />;
    }
}

type BaseProps = {
    content: IContent;
    children?: React.ReactNode;
};

export function BaseContentCard({ content, children }: BaseProps) {
    return (
        <Card sx={{ maxWidth: 600, margin: "0 auto" }}>
            <CardHeader
                title={content.title || undefined}
                subheader={`Posted by ${content.author.username} · ${content.date.toLocaleDateString()}`}
            />
            <CardContent>
                <Typography variant="body2">{content.body}</Typography>
                {children}
            </CardContent>
        </Card>
    );
}

export function InitiativeCard({ content, showLink = true }: { content: IContent; showLink?: boolean }) {
    const navigate = useNavigate();

    const updateCount = content.children.filter((c) => c.type === "update").length;

    return (
        <BaseContentCard content={content}>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
            >
                {updateCount} update{updateCount !== 1 ? "s" : ""}
            </Typography>
            {showLink && (
                <Typography
                    variant="caption"
                    onClick={() => navigate(`/initiative/${content.id}`)}
                    sx={{ cursor: "pointer", color: "primary.main", display: "block", mt: 0.5 }}
                >
                    View initiative →
                </Typography>
            )}
        </BaseContentCard>
    );
}
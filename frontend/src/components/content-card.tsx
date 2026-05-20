import {
    Card, CardContent, CardHeader, CardActions,
    Typography, IconButton, Tooltip, Box,
} from "@mui/material";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { useNavigate } from "react-router-dom";
import { ContentRecord } from "shared";

function useLikeDislike(
    content: ContentRecord,
    onRefresh?: () => void,
) {
    const currentUserId = (() => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return String(payload.userId);
        } catch {
            return null;
        }
    })();

    const hasLiked = currentUserId ? content.likes.includes(currentUserId) : false;
    const hasDisliked = currentUserId ? content.dislikes.includes(currentUserId) : false;

    async function toggle(action: 'like' | 'dislike') {
        if (!currentUserId) return;

        let likes = [...content.likes];
        let dislikes = [...content.dislikes];

        if (action === 'like') {
            likes = hasLiked
                ? likes.filter(id => id !== currentUserId)
                : [...likes, currentUserId];
            dislikes = dislikes.filter(id => id !== currentUserId);
        } else {
            dislikes = hasDisliked
                ? dislikes.filter(id => id !== currentUserId)
                : [...dislikes, currentUserId];
            likes = likes.filter(id => id !== currentUserId);
        }

        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3001/api/initiatives/${content.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ likes, dislikes }),
            });

            if (onRefresh) {
                onRefresh();
            } else {
                console.warn(`Like/Dislike on content ${content.id} has no onRefresh handler`);
            }
        } catch (err) {
            console.error('Failed to update like/dislike', err);
        }
    }

    return { hasLiked, hasDisliked, likeCount: content.likes.length, dislikeCount: content.dislikes.length, toggle };
}

function LikeDislikeBar({
    content,
    onRefresh,
}: {
    content: ContentRecord;
    onRefresh?: () => void;
}) {
    const { hasLiked, hasDisliked, likeCount, dislikeCount, toggle } = useLikeDislike(content, onRefresh);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={() => toggle('like')} color={hasLiked ? 'primary' : 'default'}>
                {hasLiked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
            </IconButton>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 16 }}>
                {likeCount}
            </Typography>

            <IconButton size="small" onClick={() => toggle('dislike')} color={hasDisliked ? 'error' : 'default'}>
                {hasDisliked ? <ThumbDownIcon fontSize="small" /> : <ThumbDownOutlinedIcon fontSize="small" />}
            </IconButton>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 16 }}>
                {dislikeCount}
            </Typography>
        </Box>
    );
}

function ContentImage({ image }: { image: ContentRecord['image'] }) {
    if (!image) return null;
    return (
        <Box
            component="img"
            src={image.url}
            alt={image.alt ?? ''}
            sx={{
                width: '100%',
                maxHeight: 320,
                objectFit: 'cover',
                borderRadius: 1,
                mt: 1,
                display: 'block',
            }}
            onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
        />
    );
}

type Props = {
    content: ContentRecord;
    onDelete?: () => void;
    onRefresh?: () => void;
};

export function ContentCard({ content, onDelete, onRefresh }: Props) {
    switch (content.type) {
        case "initiative":
            return <InitiativeCard content={content} onDelete={onDelete} onRefresh={onRefresh} />;
        case "update":
            return <BaseContentCard content={content} onRefresh={onRefresh} />;
        case "comment":
            return <BaseContentCard content={content} onRefresh={onRefresh} />;
    }
}

type BaseProps = {
    content: ContentRecord;
    children?: React.ReactNode;
    onDelete?: () => void;
    onRefresh?: () => void;
};

export function BaseContentCard({ content, children, onDelete, onRefresh }: BaseProps) {
    const navigate = useNavigate();

    return (
        <Card sx={{ maxWidth: 600, margin: "0 auto" }}>
            <CardHeader
                title={content.title || undefined}
                subheader={
                    <>
                        Posted by{" "}
                        <Typography
                            component="span"
                            onClick={() => navigate(`/profile/${content.author.id}`)}
                            sx={{
                                cursor: "pointer",
                                color: "primary.main",
                                fontWeight: 500,
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            {content.author.username}
                        </Typography>
                        {" · " + new Date(content.date).toLocaleDateString()}
                    </>
                }
                action={
                    onDelete && (
                        <Tooltip title="Delete">
                            <IconButton onClick={onDelete} size="small" color="error">
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )
                }
            />
            <CardContent>
                <Typography variant="body2">{content.body}</Typography>
                <ContentImage image={content.image} />
                {children}
            </CardContent>
            <CardActions disableSpacing sx={{ px: 2, pb: 1.5, justifyContent: 'flex-start' }}>
                <LikeDislikeBar content={content} onRefresh={onRefresh} />
            </CardActions>
        </Card>
    );
}

export function InitiativeCard({
    content,
    onDelete,
    onRefresh,
    showLink = true,
    detailed = false,
}: {
    content: ContentRecord;
    onDelete?: () => void;
    onRefresh?: () => void;
    showLink?: boolean;
    detailed?: boolean;
}) {
    const navigate = useNavigate();
    const updateCount = content.children.filter(c => c.type === "update").length;

    return (
        <BaseContentCard content={content} onDelete={onDelete} onRefresh={onRefresh}>
            {detailed && (
                <>
                    {content.visibility && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                            Visibility: {content.visibility}
                        </Typography>
                    )}
                    {content.location && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                            Location: {content.location}
                        </Typography>
                    )}
                    {content.duration && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                            Duration: {content.duration}
                        </Typography>
                    )}
                </>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
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
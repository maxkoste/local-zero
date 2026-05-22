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
import { IContent, CATEGORIES } from "shared";
import { CategoryChip } from "./category-chip";

function getCurrentUserInfo(): { id: string; role: string } | null {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { id: String(payload.userId), role: payload.role ?? 'user' };
    } catch {
        return null;
    }
}

function useLikeDislike(content: IContent, onRefresh?: () => void) {
    const currentUser = getCurrentUserInfo();

    const hasLiked    = currentUser ? content.likes.includes(currentUser.id) : false;
    const hasDisliked = currentUser ? content.dislikes.includes(currentUser.id) : false;

    async function toggle(action: 'like' | 'dislike') {
        if (!currentUser) return;

        let likes    = [...content.likes];
        let dislikes = [...content.dislikes];

        if (action === 'like') {
            likes    = hasLiked
                ? likes.filter(id => id !== currentUser.id)
                : [...likes, currentUser.id];
            dislikes = dislikes.filter(id => id !== currentUser.id);
        } else {
            dislikes = hasDisliked
                ? dislikes.filter(id => id !== currentUser.id)
                : [...dislikes, currentUser.id];
            likes = likes.filter(id => id !== currentUser.id);
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
            onRefresh?.();
        } catch (err) {
            console.error('Failed to update like/dislike', err);
        }
    }

    return { hasLiked, hasDisliked, likeCount: content.likes.length, dislikeCount: content.dislikes.length, toggle };
}

function LikeDislikeBar({ content, onRefresh }: { content: IContent; onRefresh?: () => void }) {
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

function ContentImage({ image }: { image: IContent['image'] }) {
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
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
    );
}

export function InitiativeCard({
    content,
    onDelete,
    onRefresh,
    showLink = true,
    detailed = false,
}: {
    content: IContent;
    onDelete?: () => void;
    onRefresh?: () => void;
    showLink?: boolean;
    detailed?: boolean;
}) {
    const navigate = useNavigate();
    const updateCount = content.children.filter(c => c.type === "update").length;

    const currentUser = getCurrentUserInfo();
    const canEditCategories =
        currentUser !== null && (
            currentUser.role === 'admin' ||
            String(content.author.id) === currentUser.id
        );

    return (
        <Card>
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

                {content.categories && content.categories.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                        {content.categories.map(cat => (
                            <CategoryChip key={cat} label={cat} selected />
                        ))}
                    </Box>
                )}

                {detailed && canEditCategories && (
                    <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                            Edit categories
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {CATEGORIES.map(cat => (
                                <CategoryChip
                                    key={cat}
                                    label={cat}
                                    selected={content.categories?.includes(cat) ?? false}
                                    onClick={async () => {
                                        const current = content.categories ?? [];
                                        const next = current.includes(cat)
                                            ? current.filter(existing => existing !== cat)
                                            : [...current, cat];
                                        const token = localStorage.getItem('token');
                                        await fetch(`http://localhost:3001/api/initiatives/${content.id}`, {
                                            method: 'PATCH',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({ categories: next }),
                                        });
                                        onRefresh?.();
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
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
            </CardContent>
            <CardActions disableSpacing sx={{ px: 2, pb: 1.5, justifyContent: 'flex-start' }}>
                <LikeDislikeBar content={content} onRefresh={onRefresh} />
            </CardActions>
        </Card>
    );
}
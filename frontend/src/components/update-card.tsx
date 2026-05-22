import { useState } from "react";
import {
    Card, CardHeader, CardContent, CardActions, Collapse,
    Typography, IconButton, Divider, Box, Stack, TextField, Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { IContent } from "shared";
import { useNavigate } from "react-router-dom";

function getCurrentUserId(): string | null {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return String(payload.userId);
    } catch {
        return null;
    }
}

async function patchLikes(nodeId: string, likes: string[], dislikes: string[]): Promise<void> {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3001/api/initiatives/${nodeId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ likes, dislikes }),
    });
}

function LikeDislikeBar({ content, onRefresh }: { content: IContent; onRefresh: () => void }) {
    const userId      = getCurrentUserId();
    const hasLiked    = userId ? content.likes.indexOf(userId) !== -1 : false;
    const hasDisliked = userId ? content.dislikes.indexOf(userId) !== -1 : false;

    async function toggle(action: 'like' | 'dislike') {
        if (!userId) return;

        let likes    = [...content.likes];
        let dislikes = [...content.dislikes];

        if (action === 'like') {
            likes    = hasLiked ? likes.filter(id => id !== userId) : [...likes, userId];
            dislikes = dislikes.filter(id => id !== userId);
        } else {
            dislikes = hasDisliked ? dislikes.filter(id => id !== userId) : [...dislikes, userId];
            likes    = likes.filter(id => id !== userId);
        }

        try {
            await patchLikes(content.id, likes, dislikes);
            onRefresh();
        } catch {
        }
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={() => toggle('like')} color={hasLiked ? 'primary' : 'default'}>
                {hasLiked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
            </IconButton>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 16 }}>
                {content.likes.length}
            </Typography>
            <IconButton size="small" onClick={() => toggle('dislike')} color={hasDisliked ? 'error' : 'default'}>
                {hasDisliked ? <ThumbDownIcon fontSize="small" /> : <ThumbDownOutlinedIcon fontSize="small" />}
            </IconButton>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 16 }}>
                {content.dislikes.length}
            </Typography>
        </Box>
    );
}

type Props = {
    content: IContent;
    initiativeId: string;
    onRefresh: () => void;
};

export function UpdateCard({ content, initiativeId, onRefresh }: Props) {
    const navigate = useNavigate();
    const [expanded, setExpanded]       = useState(false);
    const [commentBody, setCommentBody] = useState("");
    const [posting, setPosting]         = useState(false);
    const [error, setError]             = useState<string | null>(null);

    const comments = content.children.filter(c => c.type === "comment");

    function countAllComments(items: IContent[]): number {
        return items.reduce(
            (acc, item) => acc + 1 + countAllComments(item.children.filter(c => c.type === "comment")),
            0,
        );
    }

    const totalCommentCount = countAllComments(comments);

    async function handlePostComment() {
        if (!commentBody.trim()) return;

        setPosting(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/api/initiatives/${initiativeId}/children`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        type: "comment",
                        parentId: content.id,
                        body: commentBody.trim(),
                        visibility: content.visibility,
                    }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error ?? "Something went wrong.");
            }

            setCommentBody("");
            onRefresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setPosting(false);
        }
    }

    return (
        <Card sx={{ maxWidth: 600, margin: "0 auto" }}>
            <CardHeader
                title={content.title}
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
            />

            <CardContent>
                <Typography variant="body2">{content.body}</Typography>

                {content.image && (
                    <Box
                        component="img"
                        src={content.image.url}
                        alt={content.image.alt ?? ''}
                        sx={{
                            width: '100%',
                            maxHeight: 280,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mt: 1,
                            display: 'block',
                        }}
                        onError={e => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                    />
                )}
            </CardContent>

            <CardActions disableSpacing sx={{ px: 2, justifyContent: 'space-between' }}>
                <LikeDislikeBar content={content} onRefresh={onRefresh} />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(prev => !prev)}
                        aria-expanded={expanded}
                        aria-label="show comments"
                    >
                        <ChatBubbleOutlineIcon fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {totalCommentCount}
                        </Typography>
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(prev => !prev)}
                        sx={{
                            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                        }}
                        aria-label="expand"
                    >
                        <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                </Box>
            </CardActions>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Divider />
                <CardContent>
                    {comments.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                            No comments yet.
                        </Typography>
                    ) : (
                        <Stack spacing={1}>
                            {comments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    depth={0}
                                    initiativeId={initiativeId}
                                    onRefresh={onRefresh}
                                />
                            ))}
                        </Stack>
                    )}

                    <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 1.5 }} />
                        <Stack spacing={1}>
                            <TextField
                                placeholder="Write a comment..."
                                value={commentBody}
                                onChange={e => setCommentBody(e.target.value)}
                                fullWidth
                                multiline
                                minRows={2}
                                size="small"
                            />
                            {error && (
                                <Typography variant="caption" color="error">
                                    {error}
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handlePostComment}
                                disabled={posting || !commentBody.trim()}
                                sx={{ alignSelf: "flex-end" }}
                            >
                                {posting ? "Posting..." : "Post comment"}
                            </Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Collapse>
        </Card>
    );
}

type CommentProps = {
    comment: IContent;
    depth: number;
    initiativeId: string;
    onRefresh: () => void;
};

function CommentItem({ comment, depth, initiativeId, onRefresh }: CommentProps) {
    const navigate = useNavigate();
    const replies = comment.children.filter(c => c.type === "comment");
    const [replying, setReplying]   = useState(false);
    const [replyBody, setReplyBody] = useState("");
    const [posting, setPosting]     = useState(false);
    const [error, setError]         = useState<string | null>(null);

    async function handlePostReply() {
        if (!replyBody.trim()) return;

        setPosting(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/api/initiatives/${initiativeId}/children`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        type: "comment",
                        parentId: comment.id,
                        body: replyBody.trim(),
                        visibility: comment.visibility,
                    }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error ?? "Something went wrong.");
            }

            setReplyBody("");
            setReplying(false);
            onRefresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setPosting(false);
        }
    }

    return (
        <Box sx={{ pl: depth * 2 }}>
            <Box
                sx={{
                    borderLeft: depth > 0 ? "2px solid" : "none",
                    borderColor: "divider",
                    pl: depth > 0 ? 1.5 : 0,
                }}
            >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    <Typography
                        component="span"
                        variant="caption"
                        onClick={() => navigate(`/profile/${comment.author.id}`)}
                        sx={{
                            cursor: "pointer",
                            color: "primary.main",
                            fontWeight: 500,
                            "&:hover": { textDecoration: "underline" },
                        }}
                    >
                        {comment.author.username}
                    </Typography>
                    {" · "}
                    {new Date(comment.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.25 }}>
                    {comment.body}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <LikeDislikeBar content={comment} onRefresh={onRefresh} />
                    <Button
                        size="small"
                        onClick={() => setReplying(prev => !prev)}
                        sx={{ minWidth: 0, p: 0, fontSize: "0.7rem" }}
                    >
                        {replying ? "Cancel" : "Reply"}
                    </Button>
                </Box>

                {replying && (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        <TextField
                            placeholder="Write a reply..."
                            value={replyBody}
                            onChange={e => setReplyBody(e.target.value)}
                            fullWidth
                            multiline
                            minRows={2}
                            size="small"
                        />
                        {error && (
                            <Typography variant="caption" color="error">
                                {error}
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handlePostReply}
                            disabled={posting || !replyBody.trim()}
                            sx={{ alignSelf: "flex-end" }}
                        >
                            {posting ? "Posting..." : "Post reply"}
                        </Button>
                    </Stack>
                )}

                {replies.length > 0 && (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                depth={depth + 1}
                                initiativeId={initiativeId}
                                onRefresh={onRefresh}
                            />
                        ))}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}
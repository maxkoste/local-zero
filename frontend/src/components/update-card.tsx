import { useState } from "react";
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Collapse,
    Typography,
    IconButton,
    Divider,
    Box,
    Stack,
    TextField,
    Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { IContent, Visibility } from "shared";

// TODO: replace with logged-in user from auth context when that exists
const hardcodedAuthor = {
    id: 1,
    username: "Lolita",
    email: "lolita@email.com",
    visibility: Visibility.PUBLIC,
};

type Props = {
    content: IContent;
    initiativeId: string;
    onRefresh: () => void;
};

export function UpdateCard({ content, initiativeId, onRefresh }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [commentBody, setCommentBody] = useState("");
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const comments = content.children.filter((c) => c.type === "comment");

    async function handlePostComment() {
        if (!commentBody.trim()) return;

        setPosting(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:3001/api/initiatives/${initiativeId}/children`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "comment",
                        parentId: content.id,
                        body: commentBody.trim(),
                        author: hardcodedAuthor,
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
                subheader={`Posted by ${content.author.username} · ${new Date(content.date).toLocaleDateString()}`}
            />

            <CardContent>
                <Typography variant="body2">{content.body}</Typography>
            </CardContent>

            <CardActions disableSpacing sx={{ justifyContent: "flex-end" }}>
                <IconButton
                    size="small"
                    onClick={() => setExpanded((prev) => !prev)}
                    aria-expanded={expanded}
                    aria-label="show comments"
                >
                    <ChatBubbleOutlineIcon fontSize="small" />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {comments.length}
                    </Typography>
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => setExpanded((prev) => !prev)}
                    sx={{
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                    }}
                    aria-label="expand"
                >
                    <ExpandMoreIcon fontSize="small" />
                </IconButton>
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
                            {comments.map((comment) => (
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
                                onChange={(e) => setCommentBody(e.target.value)}
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
    const replies = comment.children.filter((c) => c.type === "comment");
    const [replying, setReplying] = useState(false);
    const [replyBody, setReplyBody] = useState("");
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handlePostReply() {
        if (!replyBody.trim()) return;

        setPosting(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:3001/api/initiatives/${initiativeId}/children`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "comment",
                        parentId: comment.id,
                        body: replyBody.trim(),
                        author: hardcodedAuthor,
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
                    {comment.author.username}
                    {" · "}
                    {new Date(comment.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.25 }}>
                    {comment.body}
                </Typography>

                <Button
                    size="small"
                    onClick={() => setReplying((prev) => !prev)}
                    sx={{ mt: 0.5, minWidth: 0, p: 0, fontSize: "0.7rem" }}
                >
                    {replying ? "Cancel" : "Reply"}
                </Button>

                {replying && (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        <TextField
                            placeholder="Write a reply..."
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
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
                        {replies.map((reply) => (
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
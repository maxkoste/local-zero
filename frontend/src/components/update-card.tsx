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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { IContent } from "shared";

type Props = {
    content: IContent;
};

//updates/posts
export function UpdateCard({ content }: Props) {
    const [expanded, setExpanded] = useState(false);

    const comments = content.children.filter((c) => c.type === "comment");

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
                                <CommentItem key={comment.id} comment={comment} depth={0} />
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Collapse>
        </Card>
    );
}

type CommentProps = {
    comment: IContent;
    depth: number;
};

function CommentItem({ comment, depth }: CommentProps) {
    const replies = comment.children.filter((c) => c.type === "comment");

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

                {replies.length > 0 && (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                        ))}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}
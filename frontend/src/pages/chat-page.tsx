import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
    Box, Stack, Typography, TextField, IconButton,
    CircularProgress, Divider, Avatar, Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

type ChatSummary = {
    id: string;
    sender: { id: number; username: string; email: string };
    receiver: { id: number; username: string; email: string };
    children: { id: string; body: string; date: string }[];
};

function getInitials(username: string): string {
    return username.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ message, isMine, onDelete }: {
    message: any;
    isMine: boolean;
    onDelete?: (id: string) => void;
}) {
    return (
        <Box sx={{ display: "flex", flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end", gap: 1 }}>
            <Avatar sx={{
                width: 30, height: 30, fontSize: 11, fontWeight: 500,
                bgcolor: isMine ? "primary.light" : "grey.700",
                color: isMine ? "primary.dark" : "text.primary",
                flexShrink: 0,
            }}>
                {getInitials(message.sender.username)}
            </Avatar>
            <Box sx={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                <Typography variant="caption" color="text.disabled" sx={{ mb: 0.25, px: 0.5 }}>
                    {!isMine && `${message.sender.username} · `}{formatTime(message.date)}
                </Typography>
                <Box sx={{
                    bgcolor: isMine ? "primary.main" : "grey.800",
                    color: isMine ? "primary.contrastText" : "text.primary",
                    px: 1.5, py: 1,
                    borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    wordBreak: "break-word",
                }}>
                    <Typography variant="body2">{message.body}</Typography>
                </Box>
                {isMine && onDelete && (
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        onClick={() => onDelete(message.id)}
                        sx={{ mt: 0.25, px: 0.5, cursor: "pointer", "&:hover": { color: "error.main" } }}
                    >
                        delete
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

function InboxSidebar({ chats, currentChatId, currentUserId }: {
    chats: ChatSummary[];
    currentChatId: string | undefined;
    currentUserId: number;
}) {
    const navigate = useNavigate();

    return (
        <Paper
            variant="outlined"
            sx={{
                width: 260,
                flexShrink: 0,
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '80vh',
            }}
        >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Inbox</Typography>
            </Box>

            <Box sx={{ overflowY: 'auto', flex: 1 }}>
                {chats.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ p: 2 }}>
                        No conversations yet.
                    </Typography>
                ) : (
                    chats.map(chat => {
                        const other = chat.sender.id === currentUserId ? chat.receiver : chat.sender;
                        const last = chat.children[chat.children.length - 1];
                        const isActive = chat.id === currentChatId;

                        return (
                            <Box
                                key={chat.id}
                                onClick={() => navigate(`/chat/${chat.id}`)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 1.5,
                                    py: 1.25,
                                    cursor: 'pointer',
                                    bgcolor: isActive ? 'action.selected' : 'transparent',
                                    borderLeft: isActive ? '3px solid' : '3px solid transparent',
                                    borderColor: isActive ? 'primary.main' : 'transparent',
                                    transition: 'background 0.15s',
                                    '&:hover': { bgcolor: isActive ? 'action.selected' : 'action.hover' },
                                    '&:not(:last-child)': { borderBottom: '1px solid', borderBottomColor: 'divider' },
                                }}
                            >
                                <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: 'grey.700', flexShrink: 0 }}>
                                    {getInitials(other.username)}
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13 }}>
                                        {other.username}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    >
                                        {last ? last.body : 'No messages yet'}
                                    </Typography>
                                </Box>
                                {last && (
                                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, fontSize: 10 }}>
                                        {new Date(last.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </Typography>
                                )}
                            </Box>
                        );
                    })
                )}
            </Box>
        </Paper>
    );
}

export function ChatPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [chat, setChat] = useState<any>(undefined);
    const [chats, setChats] = useState<ChatSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageBody, setMessageBody] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    async function fetchAll() {
        try {
            const token = localStorage.getItem("token");

            const meRes = await fetch("http://localhost:3001/api/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!meRes.ok) throw new Error("Could not authenticate user.");
            const meData = await meRes.json();
            setCurrentUser(meData.user);

            // Load inbox
            const chatsRes = await fetch(`http://localhost:3001/api/chats?userId=${meData.user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (chatsRes.ok) {
                const chatsData: ChatSummary[] = await chatsRes.json();
                setChats(chatsData);

                // If no chat id in URL, redirect to first chat
                if (!id && chatsData.length > 0) {
                    navigate(`/chat/${chatsData[0].id}`, { replace: true });
                    return;
                }
            }

            // Load current chat
            if (id) {
                const chatRes = await fetch(`http://localhost:3001/api/chats/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!chatRes.ok) throw new Error("Failed to load chat.");
                setChat(await chatRes.json());
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAll();
    }, [id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.children?.length]);

    async function handleSend() {
        if (!messageBody.trim() || !currentUser) return;

        setSending(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3001/api/chats/${id}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ sender: currentUser, body: messageBody.trim() }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? "Something went wrong.");
            }

            setMessageBody("");
            await fetchAll();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    }

    async function handleDelete(messageId: string) {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3001/api/chats/${id}/messages/${messageId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? "Could not delete message.");
            }
            await fetchAll();
        } catch (err: any) {
            setError(err.message);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    }

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (!currentUser) {
        return <Box sx={{ p: 4 }}><Typography>Could not load current user.</Typography></Box>;
    }

    const otherUser = chat
        ? (chat.sender.id === currentUser.id ? chat.receiver : chat.sender)
        : null;
    const messages = chat?.children ?? [];

    return (
        <Box sx={{ maxWidth: 1000, margin: "0 auto", px: 2, py: 3, display: "flex", gap: 2, alignItems: "flex-start" }}>

            {/* Sidebar */}
            <InboxSidebar
                chats={chats}
                currentChatId={id}
                currentUserId={currentUser.id}
            />

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "80vh" }}>
                {!chat ? (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.disabled">Select a conversation</Typography>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1.5, borderBottom: "1px solid", borderColor: "divider", mb: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: "grey.700" }}>
                                {getInitials(otherUser!.username)}
                            </Avatar>
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                    onClick={() => navigate(`/profile/${otherUser!.id}`)}
                                >
                                    {otherUser!.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">{otherUser!.email}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
                            <Stack spacing={1.5}>
                                {messages.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                                        No messages yet. Say hi!
                                    </Typography>
                                )}
                                {messages.map((msg: any) => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        isMine={msg.sender.id === currentUser.id}
                                        onDelete={handleDelete}
                                    />
                                ))}
                                <div ref={bottomRef} />
                            </Stack>
                        </Box>

                        {/* Composer */}
                        <Divider sx={{ my: 1.5 }} />
                        {error && (
                            <Typography variant="caption" color="error" sx={{ mb: 0.5 }}>{error}</Typography>
                        )}
                        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                            <TextField
                                placeholder="Write a message…"
                                value={messageBody}
                                onChange={(e) => setMessageBody(e.target.value)}
                                onKeyDown={handleKeyDown}
                                multiline maxRows={4} fullWidth size="small"
                                disabled={sending}
                            />
                            <IconButton
                                onClick={handleSend}
                                disabled={sending || !messageBody.trim()}
                                color="primary"
                                sx={{ mb: 0.25 }}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
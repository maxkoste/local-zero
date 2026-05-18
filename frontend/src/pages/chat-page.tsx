import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
    Box, Stack, Typography, TextField, IconButton,
    CircularProgress, Divider, Avatar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

// TODO: replace with logged-in user
const hardcodedSender = {
    id: 1,
    username: "Lolita",
    email: "lolita@email.com",
};

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CHAT = {
    id: "chat-1",
    sender: hardcodedSender,
    receiver: { id: 2, username: "Maggan Lopez", email: "maggan@lopez.se" },
    date: new Date(),
    children: [
        {
            id: "msg-1",
            sender: { id: 2, username: "Maggan Lopez", email: "maggan@lopez.se" },
            body: "Hej! Har du sett det nya initiativet i Möllan?",
            date: new Date(Date.now() - 1000 * 60 * 10),
        },
        {
            id: "msg-2",
            sender: hardcodedSender,
            body: "Ja!! Det ser jättebra ut, vi borde engagera oss.",
            date: new Date(Date.now() - 1000 * 60 * 8),
        },
        {
            id: "msg-3",
            sender: { id: 2, username: "Maggan Lopez", email: "maggan@lopez.se" },
            body: "Exakt! Jag tänkte skriva en kommentar nu på eftermiddagen.",
            date: new Date(Date.now() - 1000 * 60 * 3),
        },
    ],
};
// ─────────────────────────────────────────────────────────────────────────────

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
                {/* Delete button — only shown for own messages */}
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

export function ChatPage() {
    const { id } = useParams<{ id: string }>();
    const [chat, setChat] = useState<any>(undefined);
    const [loading, setLoading] = useState(true);
    const [messageBody, setMessageBody] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    async function fetchChat() {
        try {
            const token = localStorage.getItem("token");

            const meRes = await fetch("http://localhost:3001/api/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!meRes.ok) throw new Error("Could not authenticate user.");

            const meData = await meRes.json();
            setCurrentUser(meData.user);

            const chatRes = await fetch(`http://localhost:3001/api/chats/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!chatRes.ok) throw new Error("Failed to load chat.");

            const chatData = await chatRes.json();
            setChat(chatData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchChat();

        // ── Polling — re-enable with real API ────────────────────────────────
        // const poll = setInterval(fetchChat, 3000);
        // return () => clearInterval(poll);
        // ────────────────────────────────────────────────────────────────────
    }, [id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.children.length]);

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
                body: JSON.stringify({
                    sender: currentUser,
                    body: messageBody.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? "Something went wrong.");
            }

            setMessageBody("");
            await fetchChat();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    }

    async function handleDelete(messageId: string) {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `http://localhost:3001/api/chats/${id}/messages/${messageId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? "Could not delete message.");
            }

            await fetchChat();
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

    if (!chat) {
        return (
            <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
                <Typography>Chat not found.</Typography>
            </Box>
        );
    }

    if (!currentUser) {
        return (
            <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
                <Typography>Could not load current user.</Typography>
            </Box>
        );
    }

    const otherUser = chat.sender.id === currentUser.id ? chat.receiver : chat.sender;
    const messages = chat.children ?? [];

    return (
        <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2, display: "flex", flexDirection: "column", height: "80vh" }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1.5, borderBottom: "1px solid", borderColor: "divider", mb: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: "grey.700" }}>
                    {getInitials(otherUser.username)}
                </Avatar>
                <Box>
                    <Typography variant="subtitle2">{otherUser.username}</Typography>
                    <Typography variant="caption" color="text.secondary">{otherUser.email}</Typography>
                </Box>
            </Box>

            {/* Message list */}
            <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
                <Stack spacing={1.5}>
                    {messages.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                            Inga meddelanden än. Säg hej!
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
                    placeholder="Skriv ett meddelande…"
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
        </Box>
    );
}
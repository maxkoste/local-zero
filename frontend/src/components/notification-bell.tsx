import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Badge,
    Box,
    IconButton,
    Popover,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    Chip,
    Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ForumIcon from '@mui/icons-material/Forum';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNotifications} from '../notification-poller';
import { Notification } from 'shared';

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function notificationLabel(n: Notification): string {
    if (n.type === 'reply') {
        const action = n.contentType === 'update' ? 'posted an update on' : 'commented on';
        return `${n.actorUsername} ${action}`;
    }
    if (n.type === 'thread-reply') {
        return `${n.actorUsername} replied to your ${n.contentType} in`;
    }
    return `${n.actorUsername} posted in your neighborhood`;
}

function notificationIcon(n: Notification) {
    if (n.type === 'reply') {
        return <ForumIcon fontSize="small" sx={{ color: 'primary.main', mt: 0.3, flexShrink: 0 }} />;
    }
    return <LocationOnIcon fontSize="small" sx={{ color: 'success.main', mt: 0.3, flexShrink: 0 }} />;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
    userId: number | null;
}

export function NotificationBell({ userId }: Props) {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications(userId);
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

    const open = Boolean(anchor);

    function handleOpen(e: React.MouseEvent<HTMLButtonElement>) {
        setAnchor(e.currentTarget);
    }

    function handleClose() {
        setAnchor(null);
    }

    function handleNotificationClick(n: Notification) {
        markOneRead(n.id);
        handleClose();
        navigate(`/initiative/${n.initiativeId}`);
    }

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    color="inherit"
                    onClick={handleOpen}
                    aria-label={`${unreadCount} unread notifications`}
                    sx={{ p: 1 }}
                >
                    <Badge
                        badgeContent={unreadCount}
                        color="error"
                        max={99}
                        invisible={unreadCount === 0}
                    >
                        {unreadCount > 0
                            ? <NotificationsIcon />
                            : <NotificationsNoneIcon />
                        }
                    </Badge>
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchor}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: {
                            width: 360,
                            maxHeight: 480,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            boxShadow: 6,
                        }
                    }
                }}
            >
                {/* ── Header ── */}
                <Box sx={{
                    px: 2, py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Notifications
                        </Typography>
                        {unreadCount > 0 && (
                            <Chip
                                label={unreadCount}
                                size="small"
                                color="error"
                                sx={{ height: 18, fontSize: 11, fontWeight: 700 }}
                            />
                        )}
                    </Box>

                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={markAllRead}
                            sx={{ fontSize: 12, textTransform: 'none', minWidth: 'auto' }}
                        >
                            Mark all read
                        </Button>
                    )}
                </Box>

                {/* ── List ── */}
                <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                    {notifications.length === 0 ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 5,
                            gap: 1,
                            color: 'text.disabled',
                        }}>
                            <NotificationsNoneIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                            <Typography variant="body2">No new notifications</Typography>
                            <Typography variant="caption">
                                We'll let you know when something happens.
                            </Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {notifications.map((n, idx) => (
                                <React.Fragment key={n.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        onClick={() => handleNotificationClick(n)}
                                        sx={{
                                            px: 2,
                                            py: 1.25,
                                            gap: 1.25,
                                            cursor: 'pointer',
                                            bgcolor: n.read ? 'transparent' : 'action.hover',
                                            transition: 'background-color 0.15s',
                                            '&:hover': { bgcolor: 'action.selected' },
                                        }}
                                    >
                                        {/* Icon column */}
                                        <Box sx={{ pt: 0.25, flexShrink: 0 }}>
                                            {notificationIcon(n)}
                                        </Box>

                                        {/* Text column */}
                                        <ListItemText
                                            disableTypography
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>
                                                        {notificationLabel(n)}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.primary"
                                                        sx={{ fontWeight: 700, lineHeight: 1.4 }}
                                                    >
                                                        "{n.initiativeTitle}"
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 0.4 }}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {n.body}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                                                        {relativeTime(n.date)}
                                                    </Typography>
                                                </Box>
                                            }
                                        />

                                        {/* Unread dot */}
                                        {!n.read && (
                                            <Box sx={{
                                                width: 8, height: 8,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                flexShrink: 0,
                                                mt: 0.75,
                                            }} />
                                        )}
                                    </ListItem>
                                    {idx < notifications.length - 1 && (
                                        <Divider component="li" sx={{ mx: 2 }} />
                                    )}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Box>

                {/* ── Footer ── */}
                {notifications.length > 0 && (
                    <Box sx={{
                        px: 2, py: 1,
                        borderTop: 1,
                        borderColor: 'divider',
                        flexShrink: 0,
                        textAlign: 'center',
                    }}>
                        <Typography variant="caption" color="text.disabled">
                            Showing activity from the last 24 hours
                        </Typography>
                    </Box>
                )}
            </Popover>
        </>
    );
}
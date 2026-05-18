import { useState, useEffect, useRef, useCallback } from 'react';
import { Notification } from 'shared';
 
const POLL_INTERVAL_MS = 30_000;
 
export function useNotifications(userId: number | null) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
 
    // `since` is fixed at mount time — 24 h ago — and never changes.
    // Using a ref so it survives re-renders without triggering effects.
    const sinceRef = useRef<string>(
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    );
 
    // We track which notification IDs have been seen (read) locally.
    // The server always returns `read: false`; we overlay our local state.
    const readIdsRef = useRef<Set<string>>(new Set());
 
    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
 
        const token = localStorage.getItem('token');
        if (!token) return;
 
        try {
            const res = await fetch(
                `http://localhost:3001/api/notifications?userId=${userId}&since=${sinceRef.current}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) return;
 
            const data: Notification[] = await res.json();
 
            // Overlay local read state onto fresh server data
            const withReadState = data.map(n => ({
                ...n,
                read: readIdsRef.current.has(n.id),
            }));
 
            setNotifications(withReadState);
        } catch {
            // Fail silently — notifications are non-critical
        }
    }, [userId]);
 
    // Initial fetch + polling
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchNotifications]);
 
    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            updated.forEach(n => readIdsRef.current.add(n.id));
            return updated;
        });
    }, []);
 
    const markOneRead = useCallback((id: string) => {
        readIdsRef.current.add(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);
 
    const unreadCount = notifications.filter(n => !n.read).length;
 
    return { notifications, unreadCount, markAllRead, markOneRead };
}

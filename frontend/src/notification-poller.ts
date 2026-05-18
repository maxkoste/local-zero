import { useState, useEffect, useRef, useCallback } from 'react';

export interface AppNotification {
    id: string;
    type: 'reply' | 'neighborhood';
    initiativeId: string;
    initiativeTitle: string;
    actorUsername: string;
    contentType: string;
    body: string;
    date: string;
    read: boolean;
}

const POLL_INTERVAL_MS = 30_000;

export function useNotifications(userId: number | null) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const sinceRef = useRef<string>(
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    );

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

            const data: AppNotification[] = await res.json();

            const withReadState = data.map(n => ({
                ...n,
                read: readIdsRef.current.has(n.id),
            }));

            setNotifications(withReadState);
        } catch {
            //???
        }
    }, [userId]);

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
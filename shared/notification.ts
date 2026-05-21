export interface Notification {
    id: string;
    type: 'reply' | 'thread-reply' | 'neighborhood';
    initiativeId: string;
    initiativeTitle: string;
    actorUsername: string;
    contentType: string;
    body: string;
    date: string;
    read: boolean;
}
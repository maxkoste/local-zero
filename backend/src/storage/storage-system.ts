import fs from 'fs/promises';
import path from 'path';

export interface AuthorRecord {
    id: number;
    username: string;
    email: string;
    visibility: string;
}

export interface ImageRecord {
    id: string;
    url: string;
    alt?: string;
}

export type ContentType = 'initiative' | 'update' | 'comment';

export interface ContentRecord {
    id: string;
    type: ContentType;
    title?: string;
    author: AuthorRecord;
    body: string;
    visibility: string;
    date: string;
    image: ImageRecord | null;
    location: string | null;
    duration: string | null;
    likes: string[];
    dislikes: string[];
    children: ContentRecord[];
}

export type ContentUpdate = Partial<Pick<
    ContentRecord,
    'title' | 'body' | 'visibility' | 'image' | 'location' | 'duration' | 'likes' | 'dislikes'
>>;

export interface UserRecord {
    id: number;
    username: string;
    password: string;
    email: string;
    visibility: string;
}

const INITIATIVES_FILE = path.join(process.cwd(), 'src/storage/initiatives.json');
const USERS_FILE = path.join(process.cwd(), 'src/storage/users.json');

class StorageSystem {
    private static instance: StorageSystem;

    private initiatives: ContentRecord[] = [];
    private users: UserRecord[] = [];

    // Chained promises ensure writes to each file are safe by queueing them
    private initiativesWriteQueue: Promise<void> = Promise.resolve();
    private usersWriteQueue: Promise<void> = Promise.resolve();

    private initialized = false;

    private constructor() {}

    static getInstance(): StorageSystem {
        if (!StorageSystem.instance) {
            StorageSystem.instance = new StorageSystem();
        }
        return StorageSystem.instance;
    }

    async init(): Promise<void> {
        if (this.initialized) return;

        const [initiativesData, usersData] = await Promise.all([
            fs.readFile(INITIATIVES_FILE, 'utf-8'),
            fs.readFile(USERS_FILE, 'utf-8'),
        ]);

        this.initiatives = JSON.parse(initiativesData);
        this.users = JSON.parse(usersData);
        this.initialized = true;
    }

    //Initiatives

    getInitiatives(): ContentRecord[] {
        return this.initiatives;
    }

    getInitiativeById(id: string): ContentRecord | undefined {
        return this.initiatives.find(i => i.id === id);
    }

    addInitiative(initiative: ContentRecord): void {
        this.initiatives.push(initiative);
        this.flushInitiatives();
    }


    updateInitiative(id: string, update: ContentUpdate): ContentRecord | null {
        const index = this.initiatives.findIndex(i => i.id === id);
        if (index === -1) return null;

        this.initiatives[index] = { ...this.initiatives[index], ...update };
        this.flushInitiatives();
        return this.initiatives[index];
    }

    deleteInitiative(id: string): boolean {
        const before = this.initiatives.length;
        this.initiatives = this.initiatives.filter(i => i.id !== id);
        if (this.initiatives.length === before) return false; //if initiative not found

        this.flushInitiatives();
        return true;
    }

    //Users

    getUsers(): UserRecord[] {
        return this.users;
    }

    getUserById(id: number): UserRecord | undefined {
        return this.users.find(u => u.id === id);
    }

    addUser(user: UserRecord): void {
        this.users.push(user);
        this.flushUsers();
    }


    //Updates and comments
    addChild(parentId: string, child: ContentRecord): ContentRecord | null {
        const parent = this.findNode(this.initiatives, parentId);
        if (!parent) return null;

        const validParent: Record<ContentType, ContentType[]> = {
            initiative: ['update'],
            update: ['comment'],
            comment: ['comment'],
        };

        if (!validParent[parent.type].includes(child.type)) return null;

        parent.children.push(child);
        this.flushInitiatives();
        return parent;
    }


    //Room for handling chats



    //Flushes - handles concurrency
    private flushInitiatives(): void {
        this.initiativesWriteQueue = this.initiativesWriteQueue.then(() =>
            fs.writeFile(INITIATIVES_FILE, JSON.stringify(this.initiatives, null, 2), 'utf-8')
        );
    }

    private flushUsers(): void {
        this.usersWriteQueue = this.usersWriteQueue.then(() =>
            fs.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8')
        );
    }

    //Helper method to traverse children
    private findNode(nodes: ContentRecord[], id: string): ContentRecord | null {
        for (const node of nodes) {
            if (node.id === id) return node;
            const found = this.findNode(node.children, id);
            if (found) return found;
        }
        return null;
    }
}

export const storage = StorageSystem.getInstance();

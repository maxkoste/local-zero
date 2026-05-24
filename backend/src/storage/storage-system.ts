import fs from 'fs/promises';
import path from 'path';
import { IContent, Author } from 'shared';
import Content from '../content/content'

export type ContentUpdate = Partial<Pick<IContent, 'title' | 'body' | 'visibility' | 'image' | 'location' | 'duration' | 'likes' | 'dislikes' | 'categories' | 'members'>>;

export interface ProfileRecord {
    userId: number;
    username: string;
    location: string;
    bio: string;
    email: string;
    stats: {
        Initiativ: number;
        CarbonScore: number;
    };
    recentActivity: { id: string; text: string; date: string }[];
}

export interface EcoAction {
    id: string;
    key: string;
    date: string;
}

export interface UserRecord {
    id: number;
    username: string;
    password: string;
    email: string;
    visibility: string;
    role?: 'user' | 'admin';
    ecoActions?: EcoAction[];
}

export interface MessageRecord {
    id: string;
    sender: Author;
    body: string;
    date: string;
}

export interface ChatRecord {
    id: string;
    sender: Author;
    receiver: Author;
    body: string;
    date: string;
    children: MessageRecord[];
}

const INITIATIVES_FILE = path.join(process.cwd(), 'src/storage/initiatives.json');
const USERS_FILE       = path.join(process.cwd(), 'src/storage/users.json');
const CHATS_FILE       = path.join(process.cwd(), 'src/storage/chats.json');
const PROFILES_FILE    = path.join(process.cwd(), 'src/storage/profiles.json');

class StorageSystem {
    private static instance: StorageSystem;

    private initiatives: Content[]       = [];
    private users:       UserRecord[]    = [];
    private chats:       ChatRecord[]    = [];
    private profiles:    ProfileRecord[] = [];

    private initiativesWriteQueue: Promise<void> = Promise.resolve();
    private usersWriteQueue:        Promise<void> = Promise.resolve();
    private chatsWriteQueue:        Promise<void> = Promise.resolve();
    private profilesWriteQueue:     Promise<void> = Promise.resolve();

    private initialized = false;

    private constructor() {}

    static getInstance(): StorageSystem {
        if (!StorageSystem.instance) StorageSystem.instance = new StorageSystem();
        return StorageSystem.instance;
    }

    async init(): Promise<void> {
        if (this.initialized) return;

        const [initiativesData, usersData, chatsData, profilesData] = await Promise.all([
            fs.readFile(INITIATIVES_FILE, 'utf-8'),
            fs.readFile(USERS_FILE,       'utf-8'),
            fs.readFile(CHATS_FILE,       'utf-8'),
            fs.readFile(PROFILES_FILE,    'utf-8'),
        ]);

        this.initiatives = (JSON.parse(initiativesData) as IContent[])
            .map(record => Content.fromJSON(record));

        this.users    = JSON.parse(usersData);
        this.chats    = JSON.parse(chatsData);
        this.profiles = JSON.parse(profilesData);

        this.initialized = true;
    }

    getInitiatives(): Content[] { return this.initiatives; }

    getInitiativeById(id: string): Content | undefined {
        return this.initiatives.find(i => i.id === id);
    }

    findById(id: string): Content | undefined {
        return this.findNode(this.initiatives, id);
    }

    addInitiative(initiative: Content): void {
        this.initiatives.push(initiative);
        this.flushInitiatives();
    }

    updateInitiative(id: string, update: ContentUpdate): Content | null {
        const node = this.findById(id);
        if (!node) return null;

        if (update.title      !== undefined) node.title      = update.title;
        if (update.body       !== undefined) node.body       = update.body;
        if (update.visibility !== undefined) node.visibility = update.visibility as any;
        if (update.image      !== undefined) node.image      = update.image;
        if (update.location   !== undefined) node.location   = update.location;
        if (update.duration   !== undefined) node.duration   = update.duration;
        if (update.likes      !== undefined) node.likes      = new Set(update.likes);
        if (update.dislikes   !== undefined) node.dislikes   = new Set(update.dislikes);
        if (update.members    !== undefined) node.members = new Set(update.members);
        if (update.categories !== undefined) node.categories = update.categories;

        this.flushInitiatives();
        return node;
    }

    deleteInitiative(id: string): boolean {
        const before = this.initiatives.length;
        this.initiatives = this.initiatives.filter(i => i.id !== id);
        if (this.initiatives.length === before) return false;
        this.flushInitiatives();
        return true;
    }

    addChild(parentId: string, child: Content): Content | null {
        const parent = this.findNode(this.initiatives, parentId);
        if (!parent) return null;
        parent.addChild(child);
        this.flushInitiatives();
        return parent;
    }

    getUsers(): UserRecord[] { return this.users; }

    getUserById(id: number): UserRecord | undefined {
        return this.users.find(u => u.id === id);
    }

    addUser(user: UserRecord): void {
        this.users.push(user);
        this.flushUsers();
    }

    getProfiles(): ProfileRecord[] { return this.profiles; }

    getProfileByUserId(userId: number): ProfileRecord | undefined {
        return this.profiles.find(p => p.userId === userId);
    }

    addProfile(profile: ProfileRecord): void {
        this.profiles.push(profile);
        this.flushProfiles();
    }

    updateProfile(userId: number, update: Partial<Omit<ProfileRecord, 'userId'>>): ProfileRecord | null {
        const index = this.profiles.findIndex(p => p.userId === userId);
        if (index === -1) return null;
        this.profiles[index] = { ...this.profiles[index], ...update };
        this.flushProfiles();
        return this.profiles[index];
    }

    addEcoAction(userId: number, action: EcoAction): UserRecord | null {
        const user = this.users.find(u => u.id === userId);
        if (!user) return null;
        user.ecoActions = user.ecoActions ?? [];
        user.ecoActions.push(action);
        this.flushUsers();
        return user;
    }

    getChats(): ChatRecord[] { return this.chats; }

    getChatById(id: string): ChatRecord | undefined {
        return this.chats.find(c => c.id === id);
    }

    addChat(chat: ChatRecord): void {
        this.chats.push(chat);
        this.flushChats();
    }

    addMessage(chatId: string, message: MessageRecord): ChatRecord | null {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return null;
        chat.children.push(message);
        this.flushChats();
        return chat;
    }

    deleteMessage(chatId: string, messageId: string): boolean {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return false;
        const before = chat.children.length;
        chat.children = chat.children.filter(m => m.id !== messageId);
        if (chat.children.length === before) return false;
        this.flushChats();
        return true;
    }

    private flushInitiatives(): void {
        const serialised = this.initiatives.map(i => i.toJSON());
        this.initiativesWriteQueue = this.initiativesWriteQueue.then(() =>
            fs.writeFile(INITIATIVES_FILE, JSON.stringify(serialised, null, 2), 'utf-8')
        );
    }

    private flushUsers(): void {
        this.usersWriteQueue = this.usersWriteQueue.then(() =>
            fs.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8')
        );
    }

    private flushChats(): void {
        this.chatsWriteQueue = this.chatsWriteQueue.then(() =>
            fs.writeFile(CHATS_FILE, JSON.stringify(this.chats, null, 2), 'utf-8')
        );
    }

    private flushProfiles(): void {
        this.profilesWriteQueue = this.profilesWriteQueue.then(() =>
            fs.writeFile(PROFILES_FILE, JSON.stringify(this.profiles, null, 2), 'utf-8')
        );
    }

    private findNode(nodes: Content[], id: string): Content | undefined {
        for (const node of nodes) {
            if (node.id === id) return node;
            const found = this.findNode(node.children, id);
            if (found) return found;
        }
        return undefined;
    }
}

export const storage = StorageSystem.getInstance();
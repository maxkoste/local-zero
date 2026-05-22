import express from 'express';
import cors from 'cors';
import { storage, UserRecord, ChatRecord, MessageRecord, EcoAction, ProfileRecord } from './storage/storage-system';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { ContentFactory } from './content/content-factory';
import { Notification, Content, Visibility, Author, Action } from 'shared';

dotenv.config();

const app = express();
const PORT = 3001;
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET as string;

type JwtPayload = { userId: number };

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Add a .env with JWT_SECRET="<random string>"');
}

function generateToken(user: UserRecord) {
    return jwt.sign({ userId: user.id, role: user.role ?? 'user' }, JWT_SECRET, { expiresIn: '1h' });
}

function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

function requireAuth(req: express.Request, res: express.Response): JwtPayload | null {
    const header = req.headers.authorization;
    if (!header) {
        res.status(401).json({ error: 'No token provided' });
        return null;
    }
    try {
        return verifyToken(header.split(' ')[1]);
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
        return null;
    }
}

function resolveAuthor(payload: JwtPayload, res: express.Response): Author | null {
    const user = storage.getUserById(payload.userId);
    if (!user) {
        res.status(404).json({ error: 'Authenticated user not found' });
        return null;
    }
    return { id: user.id, username: user.username, email: user.email, role: user.role };
}

function collectReplyNotifications(
    nodes: Content[],
    parent: Content,
    initiativeId: string,
    initiativeTitle: string,
    userId: number,
    since: Date,
    seen: Set<string>,
    notifications: Notification[],
): void {
    for (const node of nodes) {
        const notifId = `reply-${node.id}`;

        if (
            node.author.id !== userId &&
            node.date > since &&
            !seen.has(notifId)
        ) {
            if (parent.author.id === userId) {
                seen.add(notifId);

                const type: Notification['type'] =
                    parent.type === 'initiative' || parent.type === 'update'
                        ? 'reply'
                        : 'thread-reply';

                notifications.push({
                    id: notifId,
                    type,
                    initiativeId,
                    initiativeTitle,
                    actorUsername: node.author.username,
                    contentType: node.type,
                    body: node.body,
                    date: node.date.toISOString(),
                    read: false,
                });
            }
        }

        collectReplyNotifications(
            node.children,
            node,
            initiativeId,
            initiativeTitle,
            userId,
            since,
            seen,
            notifications,
        );
    }
}

app.get('/api/users', (req, res) => {
    res.json(storage.getUsers());
});

app.get('/api/users/:id', (req, res) => {
    const user = storage.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, username: user.username, email: user.email, visibility: user.visibility, role: user.role });
});

app.post('/api/users', (req, res) => {
    const { username, password, email, visibility, role } = req.body;
    if (!username || !password || !email || !visibility) {
        return res.status(400).json({ error: 'username, password, email, and visibility are required' });
    }

    const users = storage.getUsers();
    const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;

    const newUser: UserRecord = {
        id: nextId, username, password, email, visibility,
        role: role ?? 'user', ecoActions: [],
    };
    storage.addUser(newUser);

    const newProfile: ProfileRecord = {
        userId: nextId, username,
        location: '', bio: '', email: '',
        stats: { Initiativ: 0, CarbonScore: 0 },
        recentActivity: [],
    };
    storage.addProfile(newProfile);

    res.status(201).json(newUser);
});

app.patch('/api/users/:id', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const userId = Number(req.params.id);
    if (payload.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const user = storage.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
});

app.get('/api/users/:id/profile', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const userId = Number(req.params.id);
    const profile = storage.getProfileByUserId(userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const user = storage.getUserById(userId);
    const activityItems: { id: string; text: string; date: string }[] = [];

    for (const action of user?.ecoActions ?? []) {
        const def = Action[action.key as keyof typeof Action];
        const label = def ? def.label : action.key;
        activityItems.push({
            id:   action.id,
            text: `Logged: ${label}`,
            date: action.date,
        });
    }

    function collectAuthoredContent(nodes: Content[]) {
        for (const node of nodes) {
            if (node.author.id === userId) {
                if (node.type === 'comment') {
                    collectAuthoredContent(node.children);
                    continue;
                }
                const typeLabel = node.type === 'initiative' ? 'Created initiative' : 'Posted update';
                activityItems.push({
                    id:   node.id,
                    text: `${typeLabel}: ${node.title ?? node.body?.slice(0, 60) ?? ''}`,
                    date: node.date.toISOString(),
                });
            }
            collectAuthoredContent(node.children);
        }
    }
    collectAuthoredContent(storage.getInitiatives());

    activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ ...profile, recentActivity: activityItems.slice(0, 3) });
});

app.patch('/api/users/:id/profile', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const userId = Number(req.params.id);
    if (payload.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const { username, location, bio, email, stats } = req.body;

    const updated = storage.updateProfile(userId, {
        ...(username !== undefined && { username }),
        ...(location !== undefined && { location }),
        ...(bio      !== undefined && { bio }),
        ...(email    !== undefined && { email }),
        ...(stats && {
            stats: {
                ...(stats.Initiativ   !== undefined && { Initiativ:   stats.Initiativ }),
                ...(stats.CarbonScore !== undefined && { CarbonScore: stats.CarbonScore }),
            },
        }),
    });

    if (!updated) return res.status(404).json({ error: 'Profile not found' });
    res.json(updated);
});

app.post('/api/users/:id/eco-actions', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const userId = Number(req.params.id);
    if (payload.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'key is required' });

    const action: EcoAction = { id: String(Date.now()), key, date: new Date().toISOString() };
    const updated = storage.addEcoAction(userId, action);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    const def = Action[key as keyof typeof Action];
    const points = def ? def.points : 0;

    const profile = storage.getProfileByUserId(userId);
    if (profile) {
        storage.updateProfile(userId, {
            stats: {
                Initiativ: profile.stats.Initiativ,
                CarbonScore: profile.stats.CarbonScore + points,
            },
        });
    }

    res.status(201).json(action);
});

app.get('/api/community-scores', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const scores: Record<string, number> = {};
    for (const profile of storage.getProfiles()) {
        const user = storage.getUserById(profile.userId);
        if (!user) continue;
        const vis = user.visibility.toLowerCase();
        scores[vis] = (scores[vis] ?? 0) + profile.stats.CarbonScore;
    }
    res.json(scores);
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const match = storage.getUsers().find(u => u.email === email && u.password === password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    res.status(200).json({
        message: 'login successful',
        token: generateToken(match),
        user: { id: match.id, username: match.username, email: match.email },
    });
});

app.get('/api/me', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const user = storage.getUserById(payload.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
});

app.get('/api/initiatives', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const user = storage.getUserById(payload.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userVisibility = user.visibility?.toLowerCase() ?? 'public';
    const initiatives    = storage.getInitiatives();

    if (userVisibility === 'public') {
        return res.json(initiatives.map(i => i.toJSON()));
    }

    const filtered = initiatives.filter(i =>
        i.visibility === Visibility.PUBLIC ||
        i.visibility.toLowerCase() === userVisibility
    );

    res.json(filtered.map(i => i.toJSON()));
});

app.get('/api/initiatives/:id', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const initiative = storage.getInitiativeById(req.params.id);
    if (!initiative) return res.status(404).json({ error: 'Initiative not found' });
    res.json(initiative.toJSON());
});

app.post('/api/initiatives', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const author = resolveAuthor(payload, res);
    if (!author) return;

    const { title, body, visibility, image, location, duration, categories } = req.body;
    if (!title || !body || !visibility) {
        return res.status(400).json({ error: 'title, body, and visibility are required' });
    }

    const initiative = ContentFactory.createInitiative(
        String(Date.now()), title, author, body,
        visibility as Visibility, image, location, duration,
        Array.isArray(categories) ? categories : [],
    );

    storage.addInitiative(initiative);
    res.status(201).json(initiative.toJSON());
});

app.patch('/api/initiatives/:id', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const { title, body, visibility, image, location, duration, likes, dislikes, categories } = req.body;

    const updated = storage.updateInitiative(req.params.id, {
        ...(title      !== undefined && { title }),
        ...(body       !== undefined && { body }),
        ...(visibility !== undefined && { visibility }),
        ...(image      !== undefined && { image }),
        ...(location   !== undefined && { location }),
        ...(duration   !== undefined && { duration }),
        ...(likes      !== undefined && { likes }),
        ...(dislikes   !== undefined && { dislikes }),
        ...(categories !== undefined && { categories }),
    });

    if (!updated) return res.status(404).json({ error: 'Initiative not found' });
    res.json(updated.toJSON());
});

app.delete('/api/initiatives/:id', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const deleted = storage.deleteInitiative(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Initiative not found' });
    res.status(200).json({ message: 'Initiative deleted' });
});

app.post('/api/initiatives/:parentId/children', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const author = resolveAuthor(payload, res);
    if (!author) return;

    const { parentId: urlParentId } = req.params;
    const { type, body, visibility, title, image, location, duration, parentId: bodyParentId } = req.body;

    if (!type || !body || !visibility) {
        return res.status(400).json({ error: 'type, body, and visibility are required' });
    }
    if (type === 'initiative') {
        return res.status(400).json({ error: 'Cannot create an initiative as a child' });
    }

    const targetParentId = bodyParentId ?? urlParentId;
    const parent = storage.findById(targetParentId);
    if (!parent) return res.status(404).json({ error: 'Parent not found' });

    try {
        const child = type === 'update'
            ? ContentFactory.createUpdate(
                String(Date.now()),
                title || `Update ${Date.now()}`,
                author, body, visibility as Visibility,
                image, location, duration,
            )
            : ContentFactory.createComment(
                String(Date.now()),
                title || `Comment ${Date.now()}`,
                author, body, visibility as Visibility,
            );

        storage.addChild(targetParentId, child);
        res.status(201).json(child.toJSON());
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

app.get('/api/chats', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const userId = req.query.userId ? Number(req.query.userId) : null;
    if (userId === null) return res.status(400).json({ error: 'userId is required' });

    const chats = storage.getChats().filter(c =>
        c.sender.id === userId || c.receiver.id === userId
    );
    res.json(chats);
});

app.post('/api/chats/with/:userId', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const currentUserId = payload.userId;
    const otherUserId   = Number(req.params.userId);

    const existing = storage.getChats().find(c =>
        (c.sender.id === currentUserId && c.receiver.id === otherUserId) ||
        (c.sender.id === otherUserId   && c.receiver.id === currentUserId)
    );
    if (existing) return res.json(existing);

    const sender   = storage.getUserById(currentUserId);
    const receiver = storage.getUserById(otherUserId);
    if (!sender || !receiver) return res.status(404).json({ error: 'User not found' });

    const newChat: ChatRecord = {
        id: String(Date.now()), sender, receiver,
        body: '', date: new Date().toISOString(), children: [],
    };
    storage.addChat(newChat);
    res.status(201).json(newChat);
});

app.get('/api/chats/:id', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const chat = storage.getChatById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
});

app.post('/api/chats', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const { sender, receiver, body } = req.body;
    if (!sender || !receiver || !body) {
        return res.status(400).json({ error: 'sender, receiver, and body are required' });
    }

    const newChat: ChatRecord = {
        id: String(Date.now()), sender, receiver,
        body, date: new Date().toISOString(), children: [],
    };
    storage.addChat(newChat);
    res.status(201).json(newChat);
});

app.post('/api/chats/:id/messages', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const { sender, body } = req.body;
    if (!sender || !body) return res.status(400).json({ error: 'sender and body are required' });

    const newMessage: MessageRecord = {
        id: String(Date.now()), sender, body, date: new Date().toISOString(),
    };
    const result = storage.addMessage(req.params.id, newMessage);
    if (!result) return res.status(404).json({ error: 'Chat not found' });
    res.status(201).json(newMessage);
});

app.delete('/api/chats/:id/messages/:messageId', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const deleted = storage.deleteMessage(req.params.id, req.params.messageId);
    if (!deleted) return res.status(404).json({ error: 'Chat or message not found' });
    res.status(200).json({ message: 'Message deleted' });
});

app.get('/api/notifications', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const userId = payload.userId;

    const sinceParam = req.query.since as string | undefined;
    const since = sinceParam
        ? new Date(sinceParam)
        : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const user = storage.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userNeighborhood = user.visibility?.toLowerCase() ?? null;
    const initiatives      = storage.getInitiatives();
    const notifications: Notification[] = [];
    const seen = new Set<string>();

    for (const initiative of initiatives) {
        const initiativeId    = initiative.id;
        const initiativeTitle = initiative.title ?? '(untitled)';

        collectReplyNotifications(
            initiative.children,
            initiative,
            initiativeId,
            initiativeTitle,
            userId,
            since,
            seen,
            notifications,
        );

        const neighborhoodId = `neighborhood-${initiative.id}`;
        if (
            userNeighborhood &&
            initiative.author.id !== userId &&
            initiative.date > since &&
            initiative.visibility.toLowerCase() === userNeighborhood &&
            !seen.has(neighborhoodId)
        ) {
            seen.add(neighborhoodId);
            notifications.push({
                id: neighborhoodId,
                type: 'neighborhood',
                initiativeId,
                initiativeTitle,
                actorUsername: initiative.author.username,
                contentType: 'initiative',
                body: initiative.body,
                date: initiative.date.toISOString(),
                read: false,
            });
        }
    }

    notifications.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json(notifications);
});

storage.init().then(() => {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}).catch(err => {
    console.error('Failed to initialise storage:', err);
    process.exit(1);
});
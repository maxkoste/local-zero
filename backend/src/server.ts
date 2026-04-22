import express from 'express';
import cors from 'cors';
import { storage, ContentRecord, UserRecord } from './storage/storage-system';

const app = express();
const PORT = 3001;
app.use(express.json());
app.use(cors());

//Users

app.get('/api/users', (req, res) => {
    res.json(storage.getUsers());
});

app.get('/api/users/:id', (req, res) => {
    const userId = Number(req.params.id);
    const user = storage.getUserById(userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
});

app.post('/api/users', (req, res) => {
    const { username, password, email, visibility } = req.body;

    if (!username || !password || !email || !visibility) {
        return res.status(400).json({ error: 'username, password, email, and visibility are required' });
    }

    const users = storage.getUsers();
    const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;

    const newUser: UserRecord = { id: nextId, username, password, email, visibility };
    storage.addUser(newUser);

    res.status(201).json(newUser);
});

app.patch('/api/users/:id', (req, res) => {
    const userId = Number(req.params.id);

    const user = storage.getUserById(userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // TODO: Implementera logik flör att updatera profil attribut (visibility, bio, etc.)
    // Just nu returneras endast användarens info utan att ändrinhgar görs.

    res.status(200).json(user);
});


//Initiatives

app.get('/api/initiatives', (req, res) => {
    res.json(storage.getInitiatives());
});

app.post('/api/initiatives', (req, res) => {
    const { title, author, body, visibility, image, location, duration } = req.body;

    if (!title || !author || !body || !visibility) {
        return res.status(400).json({ error: 'title, author, body, and visibility are required' });
    }

    const newInitiative: ContentRecord = {
        id: String(Date.now()),
        type: 'initiative',
        title,
        author,
        body,
        visibility,
        date: new Date().toISOString(),
        image: image ?? null,
        location: location ?? null,
        duration: duration ?? null,
        likes: [],
        dislikes: [],
        children: [],
    };

    storage.addInitiative(newInitiative);
    res.status(201).json(newInitiative);
});

app.patch('/api/initiatives/:id', (req, res) => {
    const { id } = req.params;
    const { title, body, visibility, image, location, duration, likes, dislikes } = req.body;

    //If not including a change - will skip
    const updated = storage.updateInitiative(id, {
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
        ...(visibility !== undefined && { visibility }),
        ...(image !== undefined && { image }),
        ...(location !== undefined && { location }),
        ...(duration !== undefined && { duration }),
        ...(likes !== undefined && { likes }),
        ...(dislikes !== undefined && { dislikes }),
    });

    if (!updated) {
        return res.status(404).json({ error: 'Initiative not found' });
    }

    res.json(updated);
});

app.delete('/api/initiatives/:id', (req, res) => {
    const { id } = req.params;
    const deleted = storage.deleteInitiative(id);

    if (!deleted) {
        return res.status(404).json({ error: 'Initiative not found' });
    }

    res.status(200).json({ message: 'Initiative deleted' });
});


//Updates and Comments. Is there unecessary checks now due to the factory and content types set in builder-pattern? 
app.post('/api/initiatives/:parentId/children', (req, res) => {
    const { parentId } = req.params;
    const { type, author, body, visibility, title, image, location, duration } = req.body;

    if (!type || !author || !body || !visibility) {
        return res.status(400).json({ error: 'type, author, body, and visibility are required' });
    }

    if (type === 'initiative') {
        return res.status(400).json({ error: 'Cannot create an initiative as a child' });
    }

    const newChild: ContentRecord = {
        id: String(Date.now()),
        type,
        author,
        body,
        visibility,
        date: new Date().toISOString(),
        title: title ?? undefined,
        image: image ?? null,
        location: location ?? null,
        duration: duration ?? null,
        likes: [],
        dislikes: [],
        children: [],
    };

    const result = storage.addChild(parentId, newChild);

    if (!result) {
        return res.status(404).json({ error: 'Parent not found or invalid type for parent' });
    }

    res.status(201).json(newChild);
});



//Room for chat-storage



//Initialization

storage.init().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize storage:', err);
    process.exit(1);
});

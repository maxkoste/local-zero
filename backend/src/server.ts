import express from 'express';
import cors from 'cors';
import { storage, ContentRecord, UserRecord, ChatRecord, MessageRecord, EcoAction, ProfileRecord } from './storage/storage-system';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = 3001;
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET as string;

type JwtPayload = {
	userId: number;
};

if (!JWT_SECRET) {
	throw new Error('JWT_SECRET is not defined in environment variables - Just add a .env with JWT_SECRET="Randomgibberishnumbers"');
}

//Tokens
function generateToken(user: UserRecord){
	return jwt.sign(
		{ userId: user.id },
		JWT_SECRET,
		{ expiresIn: '1h'}
	);
}

function verifyToken(token: string) : JwtPayload {
	return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

function requireAuth(req: express.Request, res: express.Response): JwtPayload | null {
	const header = req.headers.authorization;
	if (!header) {
		res.status(401).json({ error: 'no token to validify' });
		return null;
	}
	try {
		return verifyToken(header.split(' ')[1]);
	} catch {
		res.status(401).json({ error: 'Invalid or expired token' });
		return null;
	}
}


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

	const newUser: UserRecord = { id: nextId, username, password, email, visibility, ecoActions: [] };
	storage.addUser(newUser);

	const newProfile: ProfileRecord = { userId: nextId, bio: '', nbrInitiatives: null, carbonScore: null, contactInfo: null };
	storage.addProfile(newProfile);

	res.status(201).json(newUser);
});

app.patch('/api/users/:id', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const userId = Number(req.params.id);

    if (payload.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const user = storage.getUserById(userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // TODO: Implementera logik för att updatera profil attribut (visibility, bio, etc.)
    // Just nu returneras endast användarens info utan att ändringar görs.

    res.status(200).json(user);
});

app.get('/api/users/:id/profile', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const userId = Number(req.params.id);
    const profile = storage.getProfileByUserId(userId);

    if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
});

app.patch('/api/users/:id/profile', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const userId = Number(req.params.id);

    if (payload.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { bio, nbrInitiatives, carbonScore, contactInfo } = req.body;
    const updated = storage.updateProfile(userId, {
        ...(bio !== undefined && { bio }),
        ...(nbrInitiatives !== undefined && { nbrInitiatives }),
        ...(carbonScore !== undefined && { carbonScore }),
        ...(contactInfo !== undefined && { contactInfo }),
    });

    if (!updated) {
        return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(updated);
});

app.post('/api/users/:id/eco-actions', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const userId = Number(req.params.id);

    if (payload.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { key } = req.body;
    if (!key) {
        return res.status(400).json({ error: 'key is required' });
    }

    const action: EcoAction = {
        id: String(Date.now()),
        key,
        date: new Date().toISOString(),
    };

    const updated = storage.addEcoAction(userId, action);
    if (!updated) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(201).json(action);
});


app.post('/api/login', (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: 'email and password required' });
	}

	const users = storage.getUsers();

	const match = users.find(
		(u: any) => u.email === email && u.password === password
	);

	if (match) {
		const token = generateToken(match);
		res.status(200).json({ message: 'login successful', token, user: {
			id: match.id,
			username: match.username,
			email: match.email
		}});

	} else {
		res.status(401).json({ error: 'no such user' });
	}

});

app.get('/api/me', (req, res) => {
	const header = req.headers.authorization;

	if (!header){
		return res.status(401).json({error: 'no token to validify'})
	}

	const token = header.split(' ')[1];

	try {
		const jwtPayload = verifyToken(token);
		const user = storage.getUserById(jwtPayload.userId);

		if(!user){
			return res.status(404).json({error: 'User not found'});
		}

		return res.status(200).json({user:{
			id: user.id,
			username: user.username ,
			email: user.email
		}});
	} catch (error) {
		return res.status(401).json({error: 'Invalid or expired token'});
	}
});

//Initiatives
app.get('/api/initiatives', (req, res) => {
	const header = req.headers.authorization;

	if (!header){
		return res.status(401).json({error: 'no token to validify'})
	}

	const token = header.split(' ')[1];

	try {
		const jwtPayload = verifyToken(token);
		const userId = jwtPayload.userId;

		const user = storage.getUserById(userId);

		if (!user) {
			return res.status(404).json({error: 'User not found'});
		}

		const userVisibility = user?.visibility ?? null;
		const initiatives = storage.getInitiatives();

		if (userVisibility.toLocaleLowerCase() === 'public') {
			return res.json(initiatives);
		}

		const filtered = initiatives.filter(i =>
			i.visibility.toLowerCase() === 'public' || (userVisibility.toLowerCase() && i.visibility.toLowerCase() === userVisibility.toLocaleLowerCase())
		);

		res.json(filtered);

	} catch (error) {
		return res.status(401).json({error: 'Invalid or expired token'});
	}

});

app.get('/api/initiatives/:id', (req, res) => {
	const header = req.headers.authorization;

	if (!header) {
		return res.status(401).json({ error: 'no token to validify' });
	}

	const token = header.split(' ')[1];

	try {
		verifyToken(token);

		const id = req.params.id;
		const initiative = storage.getInitiativeById(id);

		if (!initiative) {
			return res.status(404).json({ error: 'Initiative not found' });
		}

		res.json(initiative);
	} catch (error) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
});

app.post('/api/initiatives', (req, res) => {
	const payload = requireAuth(req, res);
	if (!payload) return;

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
	const payload = requireAuth(req, res);
	if (!payload) return;

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
	const payload = requireAuth(req, res);
	if (!payload) return;

	const { id } = req.params;
	const deleted = storage.deleteInitiative(id);

	if (!deleted) {
		return res.status(404).json({ error: 'Initiative not found' });
	}

	res.status(200).json({ message: 'Initiative deleted' });
});


//Updates and Comments. Is there unecessary checks now due to the factory and content types set in builder-pattern? 
app.post('/api/initiatives/:parentId/children', (req, res) => {
	const payload = requireAuth(req, res);
	if (!payload) return;

	const { parentId } = req.params;
	const { type, author, body, visibility, title, image, location, duration, parentId: bodyParentId } = req.body;

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

	const targetId = bodyParentId ?? parentId;
	const result = storage.addChild(targetId, newChild);

	if (!result) {
		return res.status(404).json({ error: 'Parent not found or invalid type for parent' });
	}

	res.status(201).json(newChild);
});



//Chats
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
        id: String(Date.now()),
        sender,
        receiver,
        body,
        date: new Date().toISOString(),
        children: [],
    };

    storage.addChat(newChat);
    res.status(201).json(newChat);
});

app.post('/api/chats/:id/messages', (req, res) => {
    const payload = requireAuth(req, res);
    if (!payload) return;

    const { sender, body } = req.body;

    if (!sender || !body) {
        return res.status(400).json({ error: 'sender and body are required' });
    }

    const newMessage: MessageRecord = {
        id: String(Date.now()),
        sender,
        body,
        date: new Date().toISOString(),
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



//Initialization

storage.init().then(() => {
	app.listen(PORT, () => {
		console.log(`Server running at http://localhost:${PORT}`);
	});
}).catch(err => {
	console.error('Failed to initialize storage:', err);
	process.exit(1);
});

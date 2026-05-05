import express from 'express';
import cors from 'cors';
import { storage, ContentRecord, UserRecord } from './storage/storage-system';
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


//Users

app.get('/api/users', (req, res) => {
	res.json(storage.getUsers());
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

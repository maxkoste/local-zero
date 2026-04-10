import express from 'express';
import fs from 'fs';
import path from 'path';
import { User } from './user'
import cors from 'cors';

const app = express();
const PORT = 3001;
app.use(express.json());
app.use(cors());

const USERS_FILE = path.join(process.cwd(), 'users.json');

app.get('/api/users', (req, res) => {
	fs.readFile(USERS_FILE, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading users.json', err);
			return res.status(500).json({ error: 'Failed to read users file' });
		}

		try {
			const users = JSON.parse(data);
			res.json(users);
		} catch (parseErr) {
			console.error('Error parsing JSON:', parseErr);
			res.status(500).json({ error: 'Failed to parse users file' });
		}
	});
});

app.post('/api/users', (req, res) => {
	const { username, password, email, visibility } = req.body;

	if (!username || !password || !email || !visibility) {
		return res.status(400).json({ error: 'username, password, email, and visibility are required' });
	}

	fs.readFile(USERS_FILE, 'utf-8', (err, data) => {
		if (err) return res.status(500).json({ error: 'Failed to read users file' });

		const users = JSON.parse(data);
		const nextId = users.length ? Math.max(...users.map((u: any) => u.id)) + 1 : 1;

		const newUser = { id: nextId, username, password, email, visibility };

		users.push(newUser);

		fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8', (writeErr) => {
			if (writeErr) return res.status(500).json({ error: 'Failed to save new user' });

			res.status(201).json(newUser);
		});
	});
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});

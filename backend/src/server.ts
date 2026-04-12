import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 3001;
app.use(express.json());
app.use(cors());

const USERS_FILE = path.join(process.cwd(), 'users.json');
const INITIATIVES_FILE = path.join(process.cwd(), 'initiatives.json');

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

// Initiatives ──────────────────────────────────────────────────────────────

app.get('/api/initiatives', (req, res) => {
    fs.readFile(INITIATIVES_FILE, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading initiatives.json', err);
            return res.status(500).json({ error: 'Failed to read initiatives file' });
        }
        try {
            const initiatives = JSON.parse(data);
            res.json(initiatives);
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ error: 'Failed to parse initiatives file' });
        }
    });
});

app.post('/api/initiatives', (req, res) => {
    const { title, author, body, visibility, image, location, duration } = req.body;

    if (!title || !author || !body || !visibility) {
        return res.status(400).json({ error: 'title, author, body, and visibility are required' });
    }

    fs.readFile(INITIATIVES_FILE, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read initiatives file' });

        const initiatives = JSON.parse(data);
        const nextId = initiatives.length
            ? String(Math.max(...initiatives.map((i: any) => Number(i.id))) + 1)
            : '1';

        const newInitiative = {
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

        initiatives.push(newInitiative);

        fs.writeFile(INITIATIVES_FILE, JSON.stringify(initiatives, null, 2), 'utf-8', (writeErr) => {
            if (writeErr) return res.status(500).json({ error: 'Failed to save initiative' });
            res.status(201).json(newInitiative);
        });
    });
});

app.delete('/api/initiatives/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(INITIATIVES_FILE, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read initiatives file' });

        const initiatives = JSON.parse(data);
        const filtered = initiatives.filter((i: any) => i.id !== id);

        if (filtered.length === initiatives.length) {
            return res.status(404).json({ error: 'Initiative not found' });
        }

        fs.writeFile(INITIATIVES_FILE, JSON.stringify(filtered, null, 2), 'utf-8', (writeErr) => {
            if (writeErr) return res.status(500).json({ error: 'Failed to delete initiative' });
            res.status(200).json({ message: 'Initiative deleted' });
        });
    });
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});

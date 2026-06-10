import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5732;

app.use(express.json());

// In-memory comments store
let comments = [
  { id: '1', text: 'First comment', parentId: null },
  { id: '2', text: 'Reply to first comment', parentId: '1' },
  { id: '3', text: 'Second comment', parentId: null },
];

let nextId = 4;

// GET /api/comments - return all comments
app.get('/api/comments', (req, res) => {
  res.json(comments);
});

// POST /api/comments - add a new comment with 1000ms delay
app.post('/api/comments', (req, res) => {
  const { text, parentId } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  setTimeout(() => {
    const newComment = {
      id: String(nextId++),
      text,
      parentId: parentId || null,
    };
    comments.push(newComment);
    res.status(201).json(newComment);
  }, 1000);
});

// Serve static files from the built React app
app.use(express.static(path.join(__dirname, 'dist')));

// For any non-API route, serve the React app (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
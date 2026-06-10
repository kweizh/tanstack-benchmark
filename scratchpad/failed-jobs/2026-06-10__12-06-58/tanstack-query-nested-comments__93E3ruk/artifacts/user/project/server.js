const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5732;

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory (built React app)
app.use(express.static(path.join(__dirname, 'dist')));

// In-memory comments store with some seed data
let comments = [
  {
    id: 'c1',
    text: 'Welcome! This is a nested comment system with optimistic updates.',
    parentId: null,
  },
  {
    id: 'c2',
    text: 'Try adding a comment — it appears instantly before the server responds!',
    parentId: 'c1',
  },
  {
    id: 'c3',
    text: 'The server has a 1000ms delay, but the UI updates in under 100ms.',
    parentId: 'c1',
  },
  {
    id: 'c4',
    text: 'TanStack Query makes optimistic updates straightforward.',
    parentId: null,
  },
];

// GET /api/comments — returns all comments
app.get('/api/comments', (req, res) => {
  res.status(200).json(comments);
});

// POST /api/comments — adds a new comment with a 1000ms artificial delay
app.post('/api/comments', (req, res) => {
  const { text, parentId = null } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'text is required' });
  }

  // Artificial 1000ms delay to make the optimistic update observable
  setTimeout(() => {
    const newComment = {
      id: uuidv4(),
      text: text.trim(),
      parentId: parentId || null,
    };

    comments.push(newComment);
    res.status(201).json(newComment);
  }, 1000);
});

// Fallback: serve the React app for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

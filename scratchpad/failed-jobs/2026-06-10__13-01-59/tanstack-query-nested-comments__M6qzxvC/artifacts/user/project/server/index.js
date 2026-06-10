const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5732;

// In-memory comments store
const comments = [
  {
    id: '1',
    text: 'Welcome to the nested comments!',
    parentId: null,
  },
  {
    id: '2',
    text: 'This is a reply to the first comment.',
    parentId: '1',
  },
  {
    id: '3',
    text: 'Another top-level comment.',
    parentId: null,
  },
];

app.use(express.json());

// GET /api/comments - return all comments
app.get('/api/comments', (_req, res) => {
  res.status(200).json(comments);
});

// POST /api/comments - add a new comment with 1000ms artificial delay
app.post('/api/comments', (req, res) => {
  const { text, parentId } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const newComment = {
    id: uuidv4(),
    text: text.trim(),
    parentId: parentId || null,
  };

  // Artificial 1000ms delay to make optimistic updates observable
  setTimeout(() => {
    comments.push(newComment);
    res.status(201).json(newComment);
  }, 1000);
});

// Serve the built React app in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

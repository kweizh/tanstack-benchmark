const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5732;

app.use(express.json());

// In-memory comments store
let comments = [
  {
    id: "1",
    text: "This is the first top-level comment. Try replying to it!",
    parentId: null
  },
  {
    id: "2",
    text: "This is a reply to the first comment.",
    parentId: "1"
  },
  {
    id: "3",
    text: "Here is another top-level comment to start a new thread.",
    parentId: null
  }
];

// Helper to generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

// GET /api/comments
app.get('/api/comments', (req, res) => {
  res.status(200).json(comments);
});

// POST /api/comments
app.post('/api/comments', (req, res) => {
  const { text, parentId } = req.body;
  
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Comment text is required and must be a string.' });
  }

  const newComment = {
    id: generateId(),
    text,
    parentId: parentId || null
  };

  // Artificial delay of exactly 1000ms
  setTimeout(() => {
    comments.push(newComment);
    res.status(201).json(newComment);
  }, 1000);
});

// Serve static files from the React frontend build folder
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for React SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

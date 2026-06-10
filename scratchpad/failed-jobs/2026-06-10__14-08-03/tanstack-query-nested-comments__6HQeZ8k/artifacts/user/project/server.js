const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let comments = [
  { id: '1', text: 'First comment', parentId: null }
];

app.get('/api/comments', (req, res) => {
  res.status(200).json(comments);
});

app.post('/api/comments', (req, res) => {
  const { text, parentId } = req.body;
  
  setTimeout(() => {
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      parentId: parentId || null
    };
    comments.push(newComment);
    res.status(201).json(newComment);
  }, 1000);
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 5732;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8321;

// Generate 50 mock items
const items = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  value: Math.floor(100 + (i * (4900 / 49))), // 100 to 5000 spread evenly
}));

app.use(cors());
app.use(express.json());

// API endpoint with pagination and sorting
app.get('/api/data', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || null;
  const sortDesc = req.query.sortDesc === 'true';

  let data = [...items];

  // Sort if requested
  if (sortBy && items.length > 0 && items[0].hasOwnProperty(sortBy)) {
    data.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === 'string') {
        return sortDesc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      return sortDesc ? bVal - aVal : aVal - bVal;
    });
  }

  const totalCount = data.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  res.json({ data: paginatedData, totalCount });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// For any non-API route, serve the React app
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
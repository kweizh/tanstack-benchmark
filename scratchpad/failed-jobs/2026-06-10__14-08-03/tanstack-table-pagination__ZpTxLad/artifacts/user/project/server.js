const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Generate mock data
const data = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  value: Math.floor(Math.random() * (5000 - 100 + 1)) + 100
}));

app.get('/api/data', (req, res) => {
  let { page = 1, limit = 10, sortBy, sortDesc } = req.query;
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  sortDesc = sortDesc === 'true';

  let result = [...data];

  if (sortBy) {
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });
  }

  const startIndex = (page - 1) * limit;
  const paginatedData = result.slice(startIndex, startIndex + limit);

  res.json({
    data: paginatedData,
    totalCount: data.length
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 8321;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
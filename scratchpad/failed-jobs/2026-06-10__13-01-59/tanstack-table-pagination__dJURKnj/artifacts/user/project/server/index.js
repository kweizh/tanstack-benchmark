const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8321;

app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Generate 50 mock items
const allItems = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  value: (i + 1) * 100,
}));

// API endpoint for server-side pagination and sorting
app.get('/api/data', (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sortBy = req.query.sortBy || 'id';
  const sortDesc = req.query.sortDesc === 'true';

  // Sort the data
  const sorted = [...allItems].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDesc ? bVal - aVal : aVal - bVal;
    }

    const aStr = String(aVal);
    const bStr = String(bVal);
    if (sortDesc) {
      return bStr.localeCompare(aStr);
    }
    return aStr.localeCompare(bStr);
  });

  // Paginate
  const startIndex = (page - 1) * limit;
  const paginated = sorted.slice(startIndex, startIndex + limit);

  res.json({
    data: paginated,
    totalCount: 50,
  });
});

// Serve the SPA for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

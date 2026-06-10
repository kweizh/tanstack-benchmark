import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8321;

// Generate 50 mock items
const allItems = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  value: Math.round(100 + (i * (4900 / 49))), // evenly distributed 100–5000
}));

// Serve static files from the Vite build output
app.use(express.static(join(__dirname, 'dist')));

// API endpoint: GET /api/data?page=1&limit=10&sortBy=id&sortDesc=false
app.get('/api/data', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const sortBy = req.query.sortBy || 'id';
  const sortDesc = req.query.sortDesc === 'true';

  // Validate sortBy field
  const validSortFields = ['id', 'name', 'value'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'id';

  // Sort a copy of the data
  const sorted = [...allItems].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string') {
      const cmp = aVal.localeCompare(bVal);
      return sortDesc ? -cmp : cmp;
    }

    return sortDesc ? bVal - aVal : aVal - bVal;
  });

  // Paginate
  const totalCount = sorted.length;
  const start = (page - 1) * limit;
  const data = sorted.slice(start, start + limit);

  res.json({ data, totalCount });
});

// Fallback: serve index.html for any non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

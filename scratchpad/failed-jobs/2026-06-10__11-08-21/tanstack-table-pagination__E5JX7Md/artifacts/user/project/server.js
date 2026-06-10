import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8321;

app.use(cors());
app.use(express.json());

// Generate 50 mock items
const mockItems = [];
for (let i = 1; i <= 50; i++) {
  // Deterministic but non-sorted values to make sorting visible
  const value = 100 + ((i * 37) % 49) * 100;
  mockItems.push({
    id: i,
    name: `Item ${i}`,
    value: value,
  });
}

// API Endpoint
app.get('/api/data', (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sortBy = req.query.sortBy || 'id';
  const sortDesc = req.query.sortDesc === 'true';

  // Create a copy of mockItems to sort
  let sortedItems = [...mockItems];

  // Sort logic
  sortedItems.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (valA === undefined) valA = a.id;
    if (valB === undefined) valB = b.id;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDesc
        ? valB.localeCompare(valA)
        : valA.localeCompare(valB);
    } else {
      // Numerical sort
      return sortDesc
        ? (valB - valA)
        : (valA - valB);
    }
  });

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  res.json({
    data: paginatedItems,
    totalCount: mockItems.length,
  });
});

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

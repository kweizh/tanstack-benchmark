import React, { useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    enableSorting: true,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: true,
  }),
  columnHelper.accessor('value', {
    header: 'Value',
    enableSorting: true,
  }),
];

const PAGE_SIZE = 10;

export default function App() {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [sorting, setSorting] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { pageIndex, pageSize } = pagination;
      const sortBy = sorting.length > 0 ? sorting[0].id : 'id';
      const sortDesc = sorting.length > 0 ? sorting[0].desc : false;

      const params = new URLSearchParams({
        page: pageIndex + 1,
        limit: pageSize,
        sortBy,
        sortDesc,
      });

      const res = await fetch(`/api/data?${params}`);
      const json = await res.json();
      setData(json.data);
      setTotalCount(json.totalCount);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const table = useReactTable({
    data,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
  });

  const { pageIndex } = pagination;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>TanStack Table — Server-Side Demo</h1>
      <p style={styles.subtitle}>
        Showing page {pageIndex + 1} of {pageCount} &nbsp;|&nbsp; {totalCount} total items
      </p>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      style={{
                        ...styles.th,
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      title={canSort ? 'Click to sort' : undefined}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {isSorted === 'asc' && ' ▲'}
                      {isSorted === 'desc' && ' ▼'}
                      {!isSorted && canSort && (
                        <span style={styles.sortHint}> ⇅</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={styles.loading}>
                  Loading…
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr key={row.id} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={styles.td}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <button
          style={styles.btn}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          ← Previous
        </button>
        <span style={styles.pageInfo}>
          Page {pageIndex + 1} / {pageCount}
        </span>
        <button
          style={styles.btn}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ── Inline styles ───────────────────────────────────────────── */
const styles = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 720,
    margin: '40px auto',
    padding: '0 16px',
    color: '#1a1a2e',
  },
  title: {
    fontSize: '1.6rem',
    marginBottom: 4,
    color: '#16213e',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: 20,
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: 8,
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
  },
  th: {
    background: '#16213e',
    color: '#fff',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  td: {
    padding: '11px 16px',
    fontSize: '0.95rem',
    borderBottom: '1px solid #eee',
  },
  rowEven: { background: '#f9f9fb' },
  rowOdd: { background: '#fff' },
  loading: {
    textAlign: 'center',
    padding: '32px',
    color: '#888',
    fontSize: '1rem',
  },
  sortHint: {
    opacity: 0.4,
    fontSize: '0.8em',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    justifyContent: 'center',
  },
  btn: {
    padding: '8px 20px',
    fontSize: '0.9rem',
    border: 'none',
    borderRadius: 6,
    background: '#16213e',
    color: '#fff',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  pageInfo: {
    fontSize: '0.9rem',
    color: '#444',
    minWidth: 90,
    textAlign: 'center',
  },
};

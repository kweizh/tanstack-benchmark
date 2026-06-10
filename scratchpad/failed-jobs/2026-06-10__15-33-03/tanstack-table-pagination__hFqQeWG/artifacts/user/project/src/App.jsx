import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

export default function App() {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0, // 0-indexed internally, but API uses 1-indexed
    pageSize: 10,
  });

  const [sorting, setSorting] = useState([]);

  // Fetch data from server whenever pagination or sorting changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const page = pagination.pageIndex + 1; // Convert to 1-indexed
        const limit = pagination.pageSize;
        const sortBy = sorting.length > 0 ? sorting[0].id : '';
        const sortDesc = sorting.length > 0 ? sorting[0].desc : false;

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (sortBy) {
          params.set('sortBy', sortBy);
          params.set('sortDesc', sortDesc.toString());
        }

        const response = await fetch(`/api/data?${params.toString()}`);
        const result = await response.json();
        setData(result.data);
        setTotalCount(result.totalCount);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination, sorting]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        enableSorting: false,
      },
      {
        accessorKey: 'value',
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <button
              onClick={column.getToggleSortingHandler()}
              style={{
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                font: 'inherit',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Value
              {sorted === 'asc' ? ' ↑' : sorted === 'desc' ? ' ↓' : ' ↕'}
            </button>
          );
        },
      },
    ],
    []
  );

  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>TanStack Table - Server-Side Pagination & Sorting</h1>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '16px',
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    border: '1px solid #ddd',
                    padding: '10px',
                    backgroundColor: '#f4f4f4',
                    textAlign: 'left',
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: 'center', padding: '20px' }}
              >
                Loading...
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      border: '1px solid #ddd',
                      padding: '10px',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          style={{
            padding: '8px 16px',
            cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
            opacity: table.getCanPreviousPage() ? 1 : 0.5,
          }}
        >
          Previous
        </button>
        <span>
          Page {pagination.pageIndex + 1} of {pageCount}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          style={{
            padding: '8px 16px',
            cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
            opacity: table.getCanNextPage() ? 1 : 0.5,
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
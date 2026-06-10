import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  PaginationState,
  SortingState,
  flexRender,
} from '@tanstack/react-table';

interface Item {
  id: number;
  name: string;
  value: number;
}

export default function App() {
  const [data, setData] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'value',
        header: 'Value',
      },
    ],
    []
  );

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      const sortBy = sorting[0]?.id || 'id';
      const sortDesc = sorting[0]?.desc ?? false;

      const url = `/api/data?page=${page}&limit=${limit}&sortBy=${sortBy}&sortDesc=${sortDesc}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch data from server');
      }
      const result = await response.json();
      setData(result.data);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, sorting]);

  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pageCount,
  });

  return (
    <div>
      <h1>TanStack Table Server-Side Pagination & Sorting</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : (
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ cursor: 'pointer' }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {isSorted ? (
                          <span className="sort-icon">
                            {isSorted === 'desc' ? ' 🔽' : ' 🔼'}
                          </span>
                        ) : (
                          <span className="sort-icon" style={{ opacity: 0.2 }}>
                            {header.column.getCanSort() ? ' ↕️' : ''}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pagination-container">
          <div className="pagination-info">
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)}{' '}
            of {totalCount} items (Page {pagination.pageIndex + 1} of {pageCount || 1})
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || loading}
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || loading}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

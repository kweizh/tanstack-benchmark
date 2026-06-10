TanStack Table is a headless logic engine, requiring strict typing for complex columns and manual boilerplate mapping to render the UI grid without "excessively deep" type instantiation errors.

You need to instantiate a data table using `useReactTable` and `createColumnHelper` for a specific `Employee` interface, and build the standard HTML table markup to display the data. 

**Constraints:**
- Must render the standard HTML `<table>`, `<thead>`, and `<tbody>` structure by manually mapping over `table.getHeaderGroups()` and `table.getRowModel().rows`.
- Must create at least one custom cell renderer (e.g., formatting a date or rendering an Action button).
- Do NOT use any pre-built UI library table components (like MUI DataGrid or AG Grid).
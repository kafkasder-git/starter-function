# Table Component Usage Guide

## Overview

This project uses base table primitives from `components/ui/table.tsx` rather
than wrapper components. This approach provides maximum flexibility for
different use cases while maintaining consistency across the application.

The decision to use primitives instead of wrapper components was made because:

- Each page has unique requirements (conditional columns, custom styling,
  different actions)
- Developers need flexibility and direct control
- Previous wrapper components (`EnhancedTable`, `ResponsiveTable`,
  `DesktopTable`, `MobileResponsiveTable`, `DataTable`) were created but never
  adopted

## Basic Usage

### Importing Components

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
```

### Minimal Example

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell>{item.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Common Patterns

### 1. Loading State

Show skeleton rows while data is loading. This pattern is used extensively in
`DonationsPage.tsx` (lines 822-850).

```tsx
<TableBody>
  {loading
    ? Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20" />
          </TableCell>
        </TableRow>
      ))
    : // Actual data rows
      data.map((item) => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.value}</TableCell>
          <TableCell>{item.status}</TableCell>
        </TableRow>
      ))}
</TableBody>
```

**Tips:**

- Use 5 skeleton rows by default
- Match skeleton widths to expected content
- Use `Skeleton` component from `components/ui/skeleton.tsx`

### 2. Empty State

Show a centered message when no data is available. Pattern from
`DonationsPage.tsx` (lines 923-931).

```tsx
<TableBody>
  {data.length === 0 ? (
    <TableRow>
      <TableCell colSpan={7} className="py-8 text-center text-gray-500">
        <Plus className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <p className="mb-2 text-gray-600">Henüz veri bulunmuyor</p>
        <p className="text-sm text-gray-400">
          Yeni kayıt eklemek için yukarıdaki butonu kullanın
        </p>
      </TableCell>
    </TableRow>
  ) : (
    // Actual data rows
    data.map((item) => <TableRow key={item.id}>...</TableRow>)
  )}
</TableBody>
```

**Important:**

- Set `colSpan` to match the total number of columns
- Use consistent icon size: `h-12 w-12`
- Center content with `text-center` and `mx-auto`

### 3. Responsive Columns

Hide less important columns on smaller screens using Tailwind's responsive
utilities.

```tsx
<TableHeader>
  <TableRow>
    <TableHead>Name</TableHead>
    <TableHead>Amount</TableHead>
    <TableHead className="hidden lg:table-cell">Payment Method</TableHead>
    <TableHead className="hidden lg:table-cell">Type</TableHead>
    <TableHead>Actions</TableHead>
  </TableRow>
</TableHeader>
<TableBody>
  {data.map((item) => (
    <TableRow key={item.id}>
      <TableCell>{item.name}</TableCell>
      <TableCell>{item.amount}</TableCell>
      <TableCell className="hidden lg:table-cell">{item.method}</TableCell>
      <TableCell className="hidden lg:table-cell">{item.type}</TableCell>
      <TableCell>{/* Actions */}</TableCell>
    </TableRow>
  ))}
</TableBody>
```

**Breakpoint Classes:**

- `hidden sm:table-cell` - Show on screens ≥640px
- `hidden md:table-cell` - Show on screens ≥768px
- `hidden lg:table-cell` - Show on screens ≥1024px
- `hidden xl:table-cell` - Show on screens ≥1280px

**Column Width Control:**

```tsx
<TableHead className="min-w-[150px]">Wide Column</TableHead>
<TableHead className="w-[100px]">Fixed Width</TableHead>
```

### 4. Action Buttons

Icon-only buttons in the last column for actions. Pattern from
`DonationsPage.tsx` (lines 877-919).

```tsx
<TableCell className="text-center">
  <div className="flex items-center justify-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
      onClick={() => handleView(item.id)}
      aria-label="Görüntüle"
    >
      <Eye className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
      onClick={() => handleEdit(item.id)}
      aria-label="Düzenle"
    >
      <Edit className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={() => handleDelete(item.id)}
      aria-label="Sil"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
```

**Best Practices:**

- Use `h-8 w-8 p-0` for consistent button sizing
- Use `ghost` variant for subtle appearance
- Add color classes for visual hierarchy (blue for view, green for edit, red for
  delete)
- Always include `aria-label` for accessibility
- Wrap buttons in flex container with `gap-2`

### 5. Row Click Handlers

Make entire rows clickable for navigation:

```tsx
<TableRow
  className="cursor-pointer hover:bg-gray-50"
  onClick={() => navigate(`/detail/${item.id}`)}
>
  <TableCell>{item.name}</TableCell>
  <TableCell>{item.value}</TableCell>
</TableRow>
```

**Alternative with keyboard support:**

```tsx
<TableRow
  className="cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
  onClick={() => navigate(`/detail/${item.id}`)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/detail/${item.id}`);
    }
  }}
  tabIndex={0}
>
```

### 6. Status Badges

Render status indicators with color coding:

```tsx
import { Badge } from '@/components/ui/badge';

const getStatusBadge = (status: string) => {
  const variants = {
    approved: {
      variant: 'default',
      label: 'Onaylandı',
      className: 'bg-green-100 text-green-800',
    },
    pending: {
      variant: 'secondary',
      label: 'Beklemede',
      className: 'bg-yellow-100 text-yellow-800',
    },
    rejected: {
      variant: 'destructive',
      label: 'Reddedildi',
      className: 'bg-red-100 text-red-800',
    },
  };

  const config = variants[status as keyof typeof variants] || variants.pending;

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

// In the table
<TableCell>{getStatusBadge(donation.status)}</TableCell>;
```

### 7. Conditional Rendering

Show/hide columns or actions based on data state:

```tsx
<TableCell className="text-center">
  <div className="flex items-center justify-center gap-2">
    {item.status === 'pending' && (
      <>
        <Button onClick={() => handleApprove(item.id)}>
          <CheckCircle className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleReject(item.id)}>
          <XCircle className="h-4 w-4" />
        </Button>
      </>
    )}
    <Button onClick={() => handleView(item.id)}>
      <Eye className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
```

### 8. Sorting Columns

Add sorting functionality to column headers:

```tsx
const [sortColumn, setSortColumn] = useState<string>('');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

const handleSort = (column: string) => {
  if (sortColumn === column) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortColumn(column);
    setSortDirection('asc');
  }
};

<TableHead
  className="cursor-pointer select-none"
  onClick={() => handleSort('name')}
>
  <div className="flex items-center gap-1">
    Name
    {sortColumn === 'name' &&
      (sortDirection === 'asc' ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      ))}
  </div>
</TableHead>;
```

## Accessibility

### Built-in Features

The table components include accessibility features:

- `role="table"` attribute
- `aria-label` for screen readers
- `aria-busy` during loading states
- Keyboard navigation support for selectable rows

### Best Practices

1. **Always provide aria-labels for action buttons:**

   ```tsx
   <Button aria-label="Kullanıcıyı düzenle">
     <Edit className="h-4 w-4" />
   </Button>
   ```

2. **Use semantic HTML:**

   ```tsx
   <TableHead>Header</TableHead> // Not: <TableCell>Header</TableCell>
   ```

3. **Provide context for screen readers:**

   ```tsx
   <Table aria-label="Bağış listesi">
   ```

4. **Use colSpan correctly:**
   ```tsx
   <TableCell colSpan={7}>  // Match total column count
   ```

## Performance Tips

### 1. Virtualization for Large Lists

For tables with 1000+ rows, consider using virtual scrolling:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const tableContainerRef = useRef<HTMLDivElement>(null);

const rowVirtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 60,
  overscan: 5,
});
```

### 2. Memoization

Memoize expensive calculations and components:

```tsx
const getStatusBadge = useMemo(
  () => (status: string) => {
    // Badge logic
  },
  [],
);

const TableRowMemo = memo(({ item }) => (
  <TableRow>
    <TableCell>{item.name}</TableCell>
  </TableRow>
));
```

### 3. Pagination

Implement pagination for better performance:

```tsx
import { usePagination } from '@/hooks/usePagination';

const { currentPage, pageSize, paginatedData, totalPages } = usePagination({
  data,
  initialPageSize: 10,
});
```

## Security

### XSS Protection

`TableCell` automatically sanitizes string children to prevent XSS attacks:

```tsx
// This is automatically sanitized
<TableCell>{userInput}</TableCell>;

// Manual sanitization (already handled internally)
import { sanitizeUserInput } from '@/lib/security/sanitization';
<TableCell>{sanitizeUserInput(userInput)}</TableCell>;
```

**Note:** The sanitization happens in `table.tsx` lines 159-164.

## Optional Helper Components

For common patterns, optional helper components are available in
`components/ui/table-helpers.tsx`:

```tsx
import {
  TableLoadingSkeleton,
  TableEmptyState,
  TableActionButtons,
} from '@/components/ui/table-helpers';

// Loading state
<TableLoadingSkeleton rows={5} columns={7} />

// Empty state
<TableEmptyState
  icon={<Plus className="h-12 w-12" />}
  title="No data found"
  description="Add new items to get started"
  colSpan={7}
/>

// Action buttons
<TableActionButtons
  actions={[
    { icon: <Eye />, onClick: handleView, label: 'View' },
    { icon: <Edit />, onClick: handleEdit, label: 'Edit', show: canEdit },
    { icon: <Trash2 />, onClick: handleDelete, label: 'Delete' },
  ]}
  row={item}
/>
```

**Note:** These helpers are OPTIONAL. Use them only if they fit your needs. The
manual patterns provide more flexibility for custom requirements.

## Migration from Old Components

The following wrapper components have been removed:

- `EnhancedTable` (enhanced-table.tsx)
- `ResponsiveTable` (ResponsiveTable.tsx)
- `DesktopTable` (desktop-table.tsx)
- `MobileResponsiveTable` (mobile-responsive-table.tsx)
- `DataTable` (search/DataTable.tsx)

All functionality can be achieved with base primitives following the patterns in
this guide.

## Examples from Codebase

### DonationsPage.tsx

The donations page demonstrates all major patterns:

- Loading skeletons (lines 822-850)
- Empty state (lines 923-931)
- Responsive columns (hidden lg:table-cell)
- Action buttons (lines 877-919)
- Status badges with color coding
- Conditional actions based on status

### AidApplicationsPage.tsx

Shows additional patterns:

- Complex nested data display
- Multiple action types per row
- Integration with filtering

## Summary

The table component system provides:

- ✅ Maximum flexibility through primitives
- ✅ Consistent patterns across pages
- ✅ Built-in accessibility features
- ✅ Automatic XSS protection
- ✅ Responsive design support
- ✅ Optional helper components for common cases

For questions or suggestions, refer to the codebase examples or create an issue
in the repository.

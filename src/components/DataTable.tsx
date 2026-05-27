import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Typography,
} from '@mui/material'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { Employee } from '../types'

interface DataTableProps {
  data: Employee[]
  sorting: SortingState
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>
}

export default function DataTable({ data, sorting, onSortingChange }: DataTableProps) {
  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'department', header: 'Department' },
      { accessorKey: 'role', header: 'Role' },
      { accessorKey: 'salary', header: 'Salary', cell: (info) => `$${info.getValue<number>().toLocaleString()}` },
      { accessorKey: 'projects', header: 'Projects' },
      { accessorKey: 'performanceRating', header: 'Rating' },
      { accessorFn: (row) => row.joinDate, id: 'joinDate', header: 'Join Date' },
      { accessorFn: (row) => row.lastReview, id: 'lastReview', header: 'Last Review' },
      { accessorFn: (row) => row.address.city, id: 'city', header: 'City' },
      { accessorFn: (row) => row.address.state, id: 'state', header: 'State' },
      { accessorFn: (row) => row.address.country, id: 'country', header: 'Country' },
      {
        accessorFn: (row) => row.skills.join(', '),
        id: 'skills',
        header: 'Skills',
      },
      {
        accessorFn: (row) => (row.isActive ? 'Active' : 'Inactive'),
        id: 'isActive',
        header: 'Status',
      },
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: true,
  })

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell key={header.id} sx={{ fontWeight: 700 }}>
                  {header.isPlaceholder ? null : (
                    <TableSortLabel
                      active={header.column.getIsSorted() !== false}
                      direction={header.column.getIsSorted() === 'desc' ? 'desc' : 'asc'}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} hover>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} sx={{ verticalAlign: 'top' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ py: 6 }}>
                <Typography align="center" color="text.secondary">
                  No results match the current filters.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

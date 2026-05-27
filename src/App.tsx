import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Chip, Container, Paper, Stack, Typography, Alert } from '@mui/material'
import { CSVLink } from 'react-csv'
import { Download, RefreshCcw } from 'lucide-react'
import FilterBuilder from './components/FilterBuilder'
import DataTable from './components/DataTable'
import employeesFallback from './data/employees'
import { filterFields } from './config/filterConfig'
import { filterEmployees, getFriendlyFilterLabel, hasActiveFilters } from './utils/filterUtils'
import type { FilterCondition, Employee } from './types'
import type { SortingState } from '@tanstack/react-table'
import './App.css'

const STORAGE_KEY = 'dynamic-filter-state'
const API_URL = import.meta.env.VITE_EMPLOYEE_API_URL ?? 'http://localhost:4001/api/employees'

const createEmptyCondition = (): FilterCondition => ({
  id: crypto.randomUUID(),
  fieldKey: '',
  operator: '',
  value: '',
  rangeValue: {},
})

function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filters, setFilters] = useState<FilterCondition[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return [createEmptyCondition()]
    }

    try {
      const parsed = JSON.parse(stored) as FilterCondition[]
      return parsed.length ? parsed : [createEmptyCondition()]
    } catch {
      return [createEmptyCondition()]
    }
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) {
          throw new Error('Mock server fetch failed')
        }
        const payload = await response.json()
        const list = Array.isArray(payload.employees) ? payload.employees : payload
        setEmployees(list)
        setWarning('Using mock JSON API from local server.')
      } catch {
        setEmployees(employeesFallback)
        setWarning('Mock server unavailable; using built-in dataset.')
      } finally {
        setLoading(false)
      }
    }

    loadEmployees()
  }, [])

  const filteredEmployees = useMemo(
    () => filterEmployees(employees, filters, filterFields),
    [employees, filters],
  )

  const activeFilterSummary = useMemo(() => {
    if (!hasActiveFilters(filters, filterFields)) {
      return ['No active filters']
    }
    return filters
      .filter((condition) => condition.fieldKey && condition.operator)
      .map((condition) => {
        const fieldLabel = getFriendlyFilterLabel(condition.fieldKey, filterFields)
        const matchValue = Array.isArray(condition.value)
          ? condition.value.join(', ')
          : typeof condition.value === 'boolean'
          ? condition.value
            ? 'True'
            : 'False'
          : condition.value
        return `${fieldLabel} ${condition.operator} ${matchValue}`
      })
  }, [filters])

  const handleConditionsChange = (nextConditions: FilterCondition[]) => setFilters(nextConditions)
  const handleAddCondition = () => setFilters((current) => [...current, createEmptyCondition()])
  const handleClearFilters = () => setFilters([createEmptyCondition()])
  const handleResetData = () => {
    setEmployees(employeesFallback)
    setWarning('Reverted to built-in dataset.')
  }

  const csvData = filteredEmployees.map((item) => ({
    Name: item.name,
    Email: item.email,
    Department: item.department,
    Role: item.role,
    Salary: item.salary,
    City: item.address.city,
    Active: item.isActive ? 'Active' : 'Inactive',
    Projects: item.projects,
    Rating: item.performanceRating,
    JoinDate: item.joinDate,
  }))

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredEmployees, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = 'filtered-employees.json'
    anchor.click()
    URL.revokeObjectURL(href)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dynamic Filter Component System
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Reusable filter builder configured from field definitions and applied to a local JSON dataset.
      </Typography>

      {warning ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          {warning}
        </Alert>
      ) : null}

      <FilterBuilder
        fields={filterFields}
        conditions={filters}
        onConditionsChange={handleConditionsChange}
        onAddCondition={handleAddCondition}
        onClearFilters={handleClearFilters}
      />

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1">Dataset summary</Typography>
            <Typography variant="body2" color="text.secondary">
              {employees.length} total records · {filteredEmployees.length} filtered records
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <CSVLink data={csvData} filename="filtered-employees.csv" style={{ textDecoration: 'none' }}>
              <Button variant="outlined" startIcon={<Download />}>
                Export CSV
              </Button>
            </CSVLink>
            <Button variant="outlined" startIcon={<Download />} onClick={handleExportJson}>
              Export JSON
            </Button>
            <Button variant="outlined" startIcon={<RefreshCcw />} onClick={handleResetData}>
              Reset data
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Stack sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {activeFilterSummary.map((summary, index) => (
          <Chip key={`${summary}-${index}`} label={summary} />
        ))}
      </Stack>

      {loading ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Loading employee data...</Typography>
        </Paper>
      ) : (
        <DataTable data={filteredEmployees} sorting={sorting} onSortingChange={setSorting} />
      )}
    </Container>
  )
}

export default App

import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material'
import { Plus, Trash2 } from 'lucide-react'
import type { FilterCondition, FilterFieldDefinition } from '../types'
import { operatorLabels, operatorOptionsByType } from '../config/filterConfig'

interface FilterBuilderProps {
  fields: FilterFieldDefinition[]
  conditions: FilterCondition[]
  onConditionsChange: (conditions: FilterCondition[]) => void
  onAddCondition: () => void
  onClearFilters: () => void
}

const getFieldByKey = (fields: FilterFieldDefinition[], key: string) => fields.find((field) => field.key === key)

export default function FilterBuilder({ fields, conditions, onConditionsChange, onAddCondition, onClearFilters }: FilterBuilderProps) {
  const updateCondition = (id: string, patch: Partial<FilterCondition>) => {
    onConditionsChange(
      conditions.map((condition) => (condition.id === id ? { ...condition, ...patch } : condition)),
    )
  }

  const handleFieldChange = (id: string, fieldKey: string) => {
    const selectedField = getFieldByKey(fields, fieldKey)
    const nextOperator = selectedField ? operatorOptionsByType[selectedField.type][0] : ''
    updateCondition(id, {
      fieldKey,
      operator: nextOperator,
      value: selectedField?.type === 'boolean' ? false : '',
      rangeValue: {},
    })
  }

  const handleOperatorChange = (id: string, operator: string) => {
    updateCondition(id, { operator: operator as FilterCondition['operator'], rangeValue: {} })
  }

  const handleValueChange = (id: string, value: FilterCondition['value']) => {
    updateCondition(id, { value })
  }

  const handleRangeChange = (id: string, rangeValue: FilterCondition['rangeValue']) => {
    updateCondition(id, { rangeValue })
  }

  const renderInputForField = (condition: FilterCondition) => {
    const selectedField = getFieldByKey(fields, condition.fieldKey)
    if (!selectedField) {
      return null
    }

    switch (selectedField.type) {
      case 'text':
      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            label={selectedField.type === 'number' ? 'Value' : 'Search text'}
            type={selectedField.type === 'number' ? 'number' : 'text'}
            value={condition.value as string}
            onChange={(event) => handleValueChange(condition.id, event.target.value)}
          />
        )
      case 'amount':
        return (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, width: '100%' }}>
            <TextField
              fullWidth
              size="small"
              label="Min amount"
              type="number"
              value={condition.rangeValue?.min ?? ''}
              onChange={(event) =>
                handleRangeChange(condition.id, {
                  ...condition.rangeValue,
                  min: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
            <TextField
              fullWidth
              size="small"
              label="Max amount"
              type="number"
              value={condition.rangeValue?.max ?? ''}
              onChange={(event) =>
                handleRangeChange(condition.id, {
                  ...condition.rangeValue,
                  max: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
          </Box>
        )
      case 'date':
        return (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, width: '100%' }}>
            <TextField
              fullWidth
              size="small"
              label="Start date"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={condition.rangeValue?.start ?? ''}
              onChange={(event) =>
                handleRangeChange(condition.id, {
                  ...condition.rangeValue,
                  start: event.target.value,
                })
              }
            />
            <TextField
              fullWidth
              size="small"
              label={condition.operator === 'before' ? 'Until' : 'End date'}
              type="date"
              value={condition.rangeValue?.end ?? ''}
              onChange={(event) =>
                handleRangeChange(condition.id, {
                  ...condition.rangeValue,
                  end: event.target.value,
                })
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        )
      case 'singleSelect':
        return (
          <FormControl fullWidth size="small">
            <InputLabel id={`value-label-${condition.id}`}>Select value</InputLabel>
            <Select
              labelId={`value-label-${condition.id}`}
              label="Select value"
              value={condition.value as string}
              onChange={(event) => handleValueChange(condition.id, event.target.value as string)}
            >
              {selectedField.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      case 'multiSelect':
        return (
          <Autocomplete<string, true, false, false>
            multiple
            freeSolo={false}
            options={selectedField.options ?? []}
            value={(condition.value as string[]) ?? []}
            onChange={(_, nextValue) => handleValueChange(condition.id, nextValue)}
            renderInput={(params) => <TextField {...params} label="Select values" size="small" />}
          />
        )
      case 'boolean':
        return (
          <FormControlLabel
            label="True / False"
            control={
              <Switch
                checked={Boolean(condition.value)}
                onChange={(event) => handleValueChange(condition.id, event.target.checked)}
              />
            }
          />
        )
      default:
        return null
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Dynamic Filter Builder</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<Plus />} onClick={onAddCondition}>
              Add filter
            </Button>
            <Button variant="outlined" color="error" startIcon={<Trash2 />} onClick={onClearFilters}>
              Clear all
            </Button>
          </Stack>
        </Box>

        {conditions.map((condition) => {
          const field = getFieldByKey(fields, condition.fieldKey)
          const operators = field ? operatorOptionsByType[field.type] : []
          const errorLabel = field ? undefined : 'Choose a field to configure this filter.'

          return (
            <Paper key={condition.id} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
                <FormControl fullWidth size="small">
                  <InputLabel id={`field-label-${condition.id}`}>Field</InputLabel>
                  <Select
                    labelId={`field-label-${condition.id}`}
                    value={condition.fieldKey}
                    label="Field"
                    onChange={(event) => handleFieldChange(condition.id, event.target.value as string)}
                  >
                    {fields.map((filterField) => (
                      <MenuItem key={filterField.key} value={filterField.key}>
                        {filterField.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id={`operator-label-${condition.id}`}>Operator</InputLabel>
                  <Select
                    labelId={`operator-label-${condition.id}`}
                    value={condition.operator}
                    label="Operator"
                    onChange={(event) => handleOperatorChange(condition.id, event.target.value as string)}
                    disabled={!field}
                  >
                    {operators.map((operator) => (
                      <MenuItem key={operator} value={operator}>
                        {operatorLabels[operator]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ flexGrow: 1 }}>{renderInputForField(condition)}</Box>

                <IconButton color="error" onClick={() => onConditionsChange(conditions.filter((item) => item.id !== condition.id))}>
                  <Trash2 />
                </IconButton>
              </Box>

              {errorLabel ? (
                <Typography color="error" variant="caption">
                  {errorLabel}
                </Typography>
              ) : null}
            </Paper>
          )
        })}
      </Stack>
    </Paper>
  )
}

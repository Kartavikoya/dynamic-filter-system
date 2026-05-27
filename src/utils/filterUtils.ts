import dayjs from 'dayjs'
import type { Employee, FilterCondition, FilterFieldDefinition } from '../types'

export function getValueAtPath<T extends object>(item: T, path: string): unknown {
  return path.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in value) {
      return (value as Record<string, unknown>)[segment]
    }
    return undefined
  }, item)
}

export function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function parseNumberValue(value: unknown): number | null {
  if (typeof value === 'number') {
    return value
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function isConditionValid(condition: FilterCondition): boolean {
  if (!condition.fieldKey || !condition.operator) {
    return false
  }

  if (condition.operator === 'between') {
    return Boolean(condition.rangeValue?.min !== undefined || condition.rangeValue?.max !== undefined || (condition.rangeValue?.start && condition.rangeValue?.end))
  }

  if (condition.operator === 'last30Days') {
    return true
  }

  if (condition.operator === 'is' || condition.operator === 'isNot') {
    return condition.value !== '' && condition.value !== undefined
  }

  return condition.value !== '' && condition.value !== undefined
}

export function validateCondition(condition: FilterCondition, field: FilterFieldDefinition): string | undefined {
  if (!condition.fieldKey) {
    return 'Choose a field to filter.'
  }

  if (!condition.operator) {
    return 'Choose an operator.'
  }

  switch (field.type) {
    case 'text':
      return typeof condition.value === 'string' && condition.value.trim() ? undefined : 'Enter a search phrase.'
    case 'number':
      return typeof condition.value === 'string' && condition.value.trim() && parseNumberValue(condition.value) !== null
        ? undefined
        : 'Enter a valid number.'
    case 'amount': {
      const min = condition.rangeValue?.min
      const max = condition.rangeValue?.max
      if (min === undefined || max === undefined) {
        return 'Enter both minimum and maximum amounts.'
      }
      return min <= max ? undefined : 'Minimum must be less than or equal to maximum.'
    }
    case 'date': {
      if (condition.operator === 'last30Days') {
        return undefined
      }
      const start = condition.rangeValue?.start
      const end = condition.rangeValue?.end
      if (!start || !end) {
        return 'Enter a valid date range.'
      }
      return dayjs(start).isValid() && dayjs(end).isValid() && !dayjs(start).isAfter(dayjs(end))
        ? undefined
        : 'Start date must be before or equal to end date.'
    }
    case 'singleSelect':
      return typeof condition.value === 'string' && condition.value ? undefined : 'Choose a value.'
    case 'multiSelect':
      return Array.isArray(condition.value) && condition.value.length > 0 ? undefined : 'Choose one or more values.'
    case 'boolean':
      return typeof condition.value === 'boolean' ? undefined : 'Set true or false.'
    default:
      return 'Invalid filter configuration.'
  }
}

export function filterEmployees(
  employees: Employee[],
  conditions: FilterCondition[],
  fields: FilterFieldDefinition[],
): Employee[] {
  const activeConditions = conditions.filter((condition) => isConditionValid(condition))

  if (activeConditions.length === 0) {
    return employees
  }

  const groups = activeConditions.reduce<Record<string, FilterCondition[]>>((acc, condition) => {
    if (!acc[condition.fieldKey]) {
      acc[condition.fieldKey] = []
    }
    acc[condition.fieldKey].push(condition)
    return acc
  }, {})

  return employees.filter((employee) =>
    Object.values(groups).every((group) =>
      group.some((condition) => {
        const field = fields.find((entry) => entry.key === condition.fieldKey)
        if (!field) {
          return false
        }
        const rawValue = getValueAtPath(employee, condition.fieldKey)

        switch (field.type) {
          case 'text': {
            const value = String(condition.value)
            const candidate = normalizeString(rawValue)
            switch (condition.operator) {
              case 'equals':
                return candidate === normalizeString(value)
              case 'contains':
                return candidate.includes(normalizeString(value))
              case 'startsWith':
                return candidate.startsWith(normalizeString(value))
              case 'endsWith':
                return candidate.endsWith(normalizeString(value))
              case 'notContains':
                return !candidate.includes(normalizeString(value))
              default:
                return false
            }
          }
          case 'number': {
            const numberValue = parseNumberValue(condition.value)
            const recordNumber = parseNumberValue(rawValue)
            if (numberValue === null || recordNumber === null) {
              return false
            }
            switch (condition.operator) {
              case 'equals':
                return recordNumber === numberValue
              case 'greaterThan':
                return recordNumber > numberValue
              case 'lessThan':
                return recordNumber < numberValue
              case 'greaterOrEqual':
                return recordNumber >= numberValue
              case 'lessOrEqual':
                return recordNumber <= numberValue
              default:
                return false
            }
          }
          case 'amount': {
            const min = condition.rangeValue?.min
            const max = condition.rangeValue?.max
            const recordNumber = parseNumberValue(rawValue)
            if (recordNumber === null || min === undefined || max === undefined) {
              return false
            }
            return recordNumber >= min && recordNumber <= max
          }
          case 'date': {
            const recordDate = dayjs(String(rawValue))
            if (!recordDate.isValid()) {
              return false
            }
            switch (condition.operator) {
              case 'between': {
                const start = dayjs(condition.rangeValue?.start)
                const end = dayjs(condition.rangeValue?.end)
                return start.isValid() && end.isValid() && !recordDate.isBefore(start) && !recordDate.isAfter(end)
              }
              case 'before': {
                const end = dayjs(condition.rangeValue?.end)
                return end.isValid() && recordDate.isBefore(end)
              }
              case 'after': {
                const start = dayjs(condition.rangeValue?.start)
                return start.isValid() && recordDate.isAfter(start)
              }
              case 'last30Days': {
                const threshold = dayjs().subtract(30, 'day')
                return recordDate.isAfter(threshold)
              }
              default:
                return false
            }
          }
          case 'singleSelect': {
            const expected = String(condition.value)
            if (typeof rawValue !== 'string') {
              return false
            }
            switch (condition.operator) {
              case 'is':
                return rawValue === expected
              case 'isNot':
                return rawValue !== expected
              default:
                return false
            }
          }
          case 'multiSelect': {
            const selection = Array.isArray(condition.value) ? condition.value : [String(condition.value)]
            if (!selection.length) {
              return false
            }
            if (Array.isArray(rawValue)) {
              const values = rawValue.map((item) => String(item).toLowerCase())
              switch (condition.operator) {
                case 'in':
                  return selection.some((value) => values.includes(String(value).toLowerCase()))
                case 'notIn':
                  return selection.every((value) => !values.includes(String(value).toLowerCase()))
                default:
                  return false
              }
            }
            if (typeof rawValue === 'string') {
              const recordText = rawValue.toLowerCase()
              switch (condition.operator) {
                case 'in':
                  return selection.some((value) => recordText.includes(String(value).toLowerCase()))
                case 'notIn':
                  return selection.every((value) => !recordText.includes(String(value).toLowerCase()))
                default:
                  return false
              }
            }
            return false
          }
          case 'boolean': {
            const active = Boolean(condition.value)
            if (typeof rawValue !== 'boolean') {
              return false
            }
            return rawValue === active
          }
          default:
            return false
        }
      }),
    ),
  )
}

export function getFriendlyFilterLabel(fieldKey: string, fields: FilterFieldDefinition[]): string {
  return fields.find((field) => field.key === fieldKey)?.label ?? fieldKey
}

export function hasActiveFilters(conditions: FilterCondition[], fields: FilterFieldDefinition[]): boolean {
  return conditions.some((condition) => isConditionValid(condition) && fields.some((field) => field.key === condition.fieldKey))
}

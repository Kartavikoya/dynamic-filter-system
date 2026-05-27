export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'amount'
  | 'singleSelect'
  | 'multiSelect'
  | 'boolean'

export type TextOperator =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'notContains'

export type NumberOperator =
  | 'equals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterOrEqual'
  | 'lessOrEqual'

export type DateOperator = 'between' | 'before' | 'after' | 'last30Days'
export type BooleanOperator = 'is'
export type SingleSelectOperator = 'is' | 'isNot'
export type MultiSelectOperator = 'in' | 'notIn'

export type FilterOperator =
  | TextOperator
  | NumberOperator
  | DateOperator
  | BooleanOperator
  | SingleSelectOperator
  | MultiSelectOperator

export type FilterValue = string | number | boolean | string[]

export type FilterRangeValue = {
  start?: string
  end?: string
  min?: number
  max?: number
}

export interface FilterCondition {
  id: string
  fieldKey: string
  operator: FilterOperator | ''
  value: FilterValue
  rangeValue?: FilterRangeValue
}

export interface FilterFieldDefinition {
  key: string
  label: string
  type: FieldType
  options?: string[]
}

export interface Employee {
  id: number
  name: string
  email: string
  department: string
  role: string
  salary: number
  joinDate: string
  isActive: boolean
  skills: string[]
  address: {
    city: string
    state: string
    country: string
  }
  projects: number
  lastReview: string
  performanceRating: number
}

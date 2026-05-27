import type { FieldType, FilterFieldDefinition, FilterOperator } from '../types'

export const filterFields: FilterFieldDefinition[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'department', label: 'Department', type: 'singleSelect', options: ['Engineering', 'Design', 'Product', 'People Operations', 'Finance', 'Customer Success'] },
  { key: 'role', label: 'Role', type: 'singleSelect', options: ['Frontend Developer', 'Backend Developer', 'UX Designer', 'Product Manager', 'HR Partner', 'Financial Analyst', 'Customer Success Manager'] },
  { key: 'salary', label: 'Salary', type: 'amount' },
  { key: 'projects', label: 'Active Projects', type: 'number' },
  { key: 'performanceRating', label: 'Performance Rating', type: 'number' },
  { key: 'joinDate', label: 'Join Date', type: 'date' },
  { key: 'lastReview', label: 'Last Review Date', type: 'date' },
  { key: 'isActive', label: 'Active', type: 'boolean' },
  { key: 'skills', label: 'Skills', type: 'multiSelect', options: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Figma', 'SQL', 'Python', 'Jest', 'Docker', 'Kubernetes'] },
  { key: 'address.city', label: 'City', type: 'singleSelect', options: ['San Francisco', 'New York', 'Austin', 'Seattle', 'Chicago', 'London', 'Toronto', 'Berlin'] }
]

export const operatorOptionsByType: Record<FieldType, FilterOperator[]> = {
  text: ['equals', 'contains', 'startsWith', 'endsWith', 'notContains'],
  number: ['equals', 'greaterThan', 'lessThan', 'greaterOrEqual', 'lessOrEqual'],
  amount: ['between'],
  date: ['between', 'before', 'after', 'last30Days'],
  singleSelect: ['is', 'isNot'],
  multiSelect: ['in', 'notIn'],
  boolean: ['is']
}

export const operatorLabels: Record<FilterOperator, string> = {
  equals: 'Equals',
  contains: 'Contains',
  startsWith: 'Starts With',
  endsWith: 'Ends With',
  notContains: 'Does Not Contain',
  greaterThan: 'Greater Than',
  lessThan: 'Less Than',
  greaterOrEqual: 'Greater Than or Equal',
  lessOrEqual: 'Less Than or Equal',
  between: 'Between',
  before: 'Before',
  after: 'After',
  last30Days: 'Last 30 Days',
  is: 'Is',
  isNot: 'Is Not',
  in: 'In',
  notIn: 'Not In'
}

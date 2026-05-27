import fs from 'fs'
import path from 'path'
import mock from 'mock-json-api'

const employeesPath = path.resolve('./mock-data/employees.json')
const employees = JSON.parse(fs.readFileSync(employeesPath, 'utf8'))

const api = mock({
  mockRoutes: [
    {
      name: 'getEmployees',
      mockRoute: '/api/employees',
      method: 'GET',
      testScope: 'success',
      jsonTemplate: JSON.stringify({ employees }),
    },
  ],
})

const server = api.createServer()
const port = process.env.MOCK_SERVER_PORT ?? 4001
server.listen(port, () => {
  console.log(`Mock JSON API running on http://localhost:${port}/api/employees`)
})

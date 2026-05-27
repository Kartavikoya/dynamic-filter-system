import mock from 'mock-json-api'
import employees from './mock-data/employees.json' assert { type: 'json' }

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

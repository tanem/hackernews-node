const { truncate } = require('../prisma/truncate')
const { prisma } = require('../prisma/client')
const { start: startServer } = require('../src/server')
const { stop: stopServer } = require('../src/server')

beforeAll(async () => {
  const { httpServerUrl, wsServerUrl } = await startServer()
  global.__HTTP_SERVER_URL__ = httpServerUrl
  global.__WS_SERVER_URL__ = wsServerUrl
  global.__PRISMA__ = prisma
})

afterAll(async () => {
  await stopServer()
})

afterEach(async () => {
  await truncate('test')
})

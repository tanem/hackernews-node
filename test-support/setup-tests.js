const truncateTestDB = require('../prisma/truncate-test-db')
const { prisma } = require('../prisma/client')
const { start: startServer } = require('../src/server')
const { stop: stopServer } = require('../src/server')

beforeAll(async () => {
  const { httpServerUrl, wsServerUrl } = await startServer()
  global.__HTTP_SERVER_URL__ = httpServerUrl
  global.__WS_SERVER_URL__ = wsServerUrl
  global.__PRISMA__ = prisma
})

beforeEach(async () => {
  // Clean the DB prior to running a test. To ensure this always occurs before
  // the next test executes, we use Jest's `--runInBand` option.
  await truncateTestDB()
})

afterAll(async () => {
  await stopServer()
})

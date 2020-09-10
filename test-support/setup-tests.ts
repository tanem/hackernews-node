import { prisma } from '../prisma/client'
import { truncate } from '../prisma/truncate'
import { start as startServer, stop as stopServer } from '../src/server'

declare global {
  module NodeJS {
    interface Global {
      __HTTP_SERVER_URL__: string
      __WS_SERVER_URL__: string
      __PRISMA__: typeof prisma
    }
  }
}

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

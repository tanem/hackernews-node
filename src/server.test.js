const request = require('supertest')
const server = require('./server').server
const prisma = require('./server').prisma

let httpServer

beforeAll(async () => {
  httpServer = await server.start()
})

afterAll(async () => {
  httpServer.close()
  await prisma.disconnect()
})

it('should return feed', async () => {
  const { body, status } = await request(httpServer).post('/').send({
    query: `
      {
        feed {
          count
          links {
            id
          }
        }
      }
    `,
  })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

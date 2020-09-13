import Chance from 'chance'
import path from 'path'
import request from 'supertest'

const chance = Chance(path.basename(__filename))

let httpServerUrl: typeof global.__HTTP_SERVER_URL__

beforeAll(() => {
  httpServerUrl = global.__HTTP_SERVER_URL__
})

const name = chance.first()
const email = chance.email()
const password = chance.word()

test('signup', async () => {
  const { body, status } = await request(httpServerUrl)
    .post('/')
    .send({
      query: `
      mutation {
        signup(
          name: "${name}"
          email: "${email}"
          password: "${password}"
        ) {
          token
          user {
            id
          }
        }
      }
    `,
    })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot({
    data: {
      signup: {
        token: expect.any(String),
        user: {
          id: expect.any(String),
        },
      },
    },
  })
})

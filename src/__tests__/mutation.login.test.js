const path = require('path')
const bcrypt = require('bcryptjs')
const chance = require('chance').Chance(path.basename(__filename))
const request = require('supertest')

let httpServerUrl
let prisma

beforeAll(async () => {
  httpServerUrl = global.__HTTP_SERVER_URL__
  prisma = global.__PRISMA__
})

const name = chance.first()
const email = chance.email()
const password = chance.word()

beforeEach(async () => {
  await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    },
  })
})

test('successful login', async () => {
  const { body, status } = await request(httpServerUrl)
    .post('/')
    .send({
      query: `
      mutation {
        login(
          email: "${email}"
          password: "${password}"
        ) {
          token
          user {
            email
            links {
              url
              description
            }
          }
        }
      }
    `,
    })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot({
    data: {
      login: {
        token: expect.any(String),
      },
    },
  })
})

test('user not found', async () => {
  const { body, status } = await request(httpServerUrl)
    .post('/')
    .send({
      query: `
      mutation {
        login(
          email: "uknown@example.com"
          password: "${password}"
        ) {
          token
          user {
            email
            links {
              url
              description
            }
          }
        }
      }
    `,
    })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

test('invalid password', async () => {
  const { body, status } = await request(httpServerUrl)
    .post('/')
    .send({
      query: `
      mutation {
        login(
          email: "${email}"
          password: "invalid"
        ) {
          token
          user {
            email
            links {
              url
              description
            }
          }
        }
      }
    `,
    })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

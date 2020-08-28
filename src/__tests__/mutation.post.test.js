const path = require('path')
const bcrypt = require('bcryptjs')
const chance = require('chance').Chance(path.basename(__filename))
const jwt = require('jsonwebtoken')
const { APP_SECRET } = require('../utils')
const request = require('supertest')

let httpServerUrl
let prisma
let token

beforeAll(async () => {
  httpServerUrl = global.__HTTP_SERVER_URL__
  prisma = global.__PRISMA__
})

const name = chance.first()
const email = chance.email()
const password = chance.word()

beforeEach(async () => {
  const { id: userId } = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    },
  })
  token = jwt.sign({ userId }, APP_SECRET)
})

test('successful', async () => {
  const { body, status } = await request(httpServerUrl)
    .post('/')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: `
      mutation {
        post(
          url: "${chance.url()}"
          description: "${chance.sentence({ words: 5 })}"
        ) {
          id
          description
          url
          postedBy {
            id
            name
          }
          votes {
            id
            user {
              id
              name
            }
          }
        }
      }
    `,
    })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

test('returns error if not authenticated', async () => {
  const { body, status } = await request(httpServerUrl)
    .post('/')
    .send({
      query: `
      mutation {
        post(
          url: "${chance.url()}"
          description: "${chance.sentence({ words: 5 })}"
        ) {
          id
          description
          url
          postedBy {
            id
            name
          }
          votes {
            id
            user {
              id
              name
            }
          }
        }
      }
    `,
    })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

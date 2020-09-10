import bcrypt from 'bcryptjs'
import Chance from 'chance'
import jwt from 'jsonwebtoken'
import path from 'path'
import request from 'supertest'
import { APP_SECRET } from '../utils'

const chance = Chance(path.basename(__filename))

let httpServerUrl: typeof global.__HTTP_SERVER_URL__
let prisma: typeof global.__PRISMA__
let token: string

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

import { Link, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import Chance from 'chance'
import jwt from 'jsonwebtoken'
import path from 'path'
import request from 'supertest'
import { APP_SECRET } from '../utils'

const chance = Chance(path.basename(__filename))

let httpServerUrl: typeof global.__HTTP_SERVER_URL__
let prisma: typeof global.__PRISMA__

beforeAll(async () => {
  httpServerUrl = global.__HTTP_SERVER_URL__
  prisma = global.__PRISMA__
})

const name = chance.first()
const email = chance.email()
const password = chance.word()
const description = chance.sentence({ words: 5 })
const url = chance.url()

let linkId: Link['id']
let token: string
let userId: User['id']

beforeEach(async () => {
  ;({ id: userId } = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    },
  }))
  ;({ id: linkId } = await prisma.link.create({
    data: {
      description,
      url,
      postedBy: {
        connect: { id: userId },
      },
    },
  }))
  token = jwt.sign({ userId }, APP_SECRET)
})

test('new vote', async () => {
  const { body, status } = await request(httpServerUrl)
    .post('/')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: `
        mutation {
          vote(linkId: "${linkId}") {
            id
            link {
              description
              id
              url
            }
            user {
              email
              id
              name
            }
          }
        }
      `,
    })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

test('duplicate vote', async () => {
  await prisma.vote.create({
    data: {
      link: {
        connect: { id: linkId },
      },
      user: {
        connect: { id: userId },
      },
    },
  })

  const { body, status } = await request(httpServerUrl)
    .post('/')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: `
        mutation {
          vote(linkId: "${linkId}") {
            id
          }
        }
      `,
    })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

test('not authenticated', async () => {
  const { body, status } = await request(httpServerUrl)
    .post('/')
    .send({
      query: `
        mutation {
          vote(linkId: "${linkId}") {
            id
            link {
              description
              id
              url
            }
            user {
              email
              id
              name
            }
          }
        }
      `,
    })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

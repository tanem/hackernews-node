const path = require('path')
const bcrypt = require('bcryptjs')
const chance = require('chance').Chance(path.basename(__filename))
const jwt = require('jsonwebtoken')
const { APP_SECRET } = require('../utils')
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
const description = chance.sentence({ words: 5 })
const url = chance.url()

let linkId
let token
let userId

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

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
const links = new Array(5).fill().map(() => ({
  description: chance.sentence({ words: 5 }),
  url: chance.url(),
}))

beforeEach(async () => {
  await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      links: {
        create: links,
      },
    },
  })
})

test('simple', async () => {
  const { body, status } = await request(httpServerUrl).post('/').send({
    query: `
      query {
        feed {
          count
          links {
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
      }
    `,
  })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

test('filter', async () => {
  const { body, status } = await request(httpServerUrl).post('/').send({
    query: `
      query {
        feed(filter: "mo") {
          count
          links {
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
      }
    `,
  })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

test('pagination', async () => {
  const { body, status } = await request(httpServerUrl).post('/').send({
    query: `
      query {
        feed(
          take: 3
          skip: 1
        ) {
          count
          links {
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
      }
    `,
  })

  expect(status).toBe(200)
  expect(body).toMatchSnapshot()
})

test('sorting', async () => {
  const { body, status } = await request(httpServerUrl).post('/').send({
    query: `
      query {
        feed(orderBy: { description: asc }) {
          count
          links {
            id
            description
            url
            postedBy {
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

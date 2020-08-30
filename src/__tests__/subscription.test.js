const path = require('path')
const bcrypt = require('bcryptjs')
const chance = require('chance').Chance(path.basename(__filename))
const jwt = require('jsonwebtoken')
const { APP_SECRET } = require('../utils')
const { SubscriptionClient } = require('subscriptions-transport-ws')
const request = require('supertest')

let httpServerUrl
let prisma
let wsServerUrl

beforeAll(async () => {
  httpServerUrl = global.__HTTP_SERVER_URL__
  prisma = global.__PRISMA__
  wsServerUrl = global.__WS_SERVER_URL__
})

const name = chance.first()
const email = chance.email()
const password = chance.word()
const linkOneDescription = chance.sentence({ words: 5 })
const linkOneUrl = chance.url()
const linkTwoDescription = chance.sentence({ words: 5 })
const linkTwoUrl = chance.url()

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
      description: linkOneDescription,
      url: linkOneUrl,
      postedBy: {
        connect: { id: userId },
      },
    },
  }))

  token = jwt.sign({ userId }, APP_SECRET)
})

test('new vote', (done) => {
  const client = new SubscriptionClient(wsServerUrl)

  client.onConnected(async () => {
    client
      .request({
        query: `
          subscription {
            newVote {
              id
              link {
                url
                description
              }
              user {
                name
                email
              }
            }
          }
        `,
      })
      .subscribe({
        next: (res) => {
          expect(res.data).toMatchSnapshot()
          done()
        },
      })

    await request(httpServerUrl)
      .post('/')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `
          mutation {
            vote(linkId: "${linkId}") {
              id
              link {
                description
                url
              }
              user {
                email
                name
              }
            }
          }
        `,
      })
  })
})

test('new link', (done) => {
  const client = new SubscriptionClient(wsServerUrl)

  client.onConnected(async () => {
    client
      .request({
        query: `
          subscription {
            newLink {
              id
              description
              url
              postedBy {
                id
                name
              }
            }
          }
        `,
      })
      .subscribe({
        next: (res) => {
          expect(res.data).toMatchSnapshot()
          done()
        },
      })

    await request(httpServerUrl)
      .post('/')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `
          mutation {
            post(
              url: "${linkTwoUrl}"
              description: "${linkTwoDescription}"
            ) {
              id
              description
              url
              postedBy {
                id
                name
              }
            }
          }
      `,
      })
  })
})

import { Link, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import Chance from 'chance'
import jwt from 'jsonwebtoken'
import path from 'path'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import request from 'supertest'
import { APP_SECRET } from '../utils'

const chance = Chance(path.basename(__filename))

let httpServerUrl: typeof global.__HTTP_SERVER_URL__
let prisma: typeof global.__PRISMA__
let wsServerUrl: typeof global.__WS_SERVER_URL__

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

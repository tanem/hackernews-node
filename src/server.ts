import { GraphQLServer } from 'graphql-yoga'
import { Server as HttpServer } from 'http'
import { AddressInfo } from 'net'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { prisma } from '../prisma/client'
import { createContext } from './context'
import * as Link from './resolvers/Link'
import * as Mutation from './resolvers/Mutation'
import * as Query from './resolvers/Query'
import * as Subscription from './resolvers/Subscription'
import * as User from './resolvers/User'
import * as Vote from './resolvers/Vote'

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers: {
    Query,
    Mutation,
    Subscription,
    User,
    Link,
    Vote,
  },
  context: createContext,
})

let httpServer: HttpServer

export const start = async () => {
  httpServer = await server.start()
  return {
    httpServerUrl: `http://localhost:${
      (httpServer.address() as AddressInfo).port
    }`,
    wsServerUrl: `ws://localhost:${
      ((server.subscriptionServer as SubscriptionServer).server.address() as AddressInfo)
        .port
    }`,
  }
}

export const stop = async () => {
  httpServer.close()
  await prisma.$disconnect()
}

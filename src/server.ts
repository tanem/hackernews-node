import { GraphQLServer } from 'graphql-yoga'
import { Server as HttpServer } from 'http'
import { AddressInfo } from 'net'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { prisma } from '../prisma/client'
import { createContext } from './context'
import { schema } from './schema'

const server = new GraphQLServer({
  context: createContext,
  schema,
})

let httpServer: HttpServer

export const start = async () => {
  httpServer = await server.start({ port: process.env.PORT ?? 4000 })
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

import { PrismaClient } from '@prisma/client'
import { PubSub } from 'graphql-yoga'
import { ContextParameters } from 'graphql-yoga/dist/types'
import { prisma } from '../prisma/client'

const pubsub = new PubSub()

export type Context = ContextParameters & {
  prisma: PrismaClient
  pubsub: PubSub
}

export const createContext = (params: ContextParameters): Context => ({
  ...params,
  prisma,
  pubsub,
})

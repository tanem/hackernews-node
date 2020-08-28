const { GraphQLServer } = require('graphql-yoga')
const { prisma } = require('../prisma/client')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const Subscription = require('./resolvers/Subscription')
const User = require('./resolvers/User')
const Link = require('./resolvers/Link')
const Vote = require('./resolvers/Vote')
const { PubSub } = require('graphql-yoga')

const pubsub = new PubSub()

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
  context: (request) => ({
    ...request,
    prisma,
    pubsub,
  }),
})

let httpServer

exports.start = async () => {
  httpServer = await server.start()
  return {
    httpServerUrl: `http://localhost:${httpServer.address().port}`,
    wsServerUrl: `ws://localhost:${
      server.subscriptionServer.wsServer.address().port
    }`,
  }
}

exports.stop = async () => {
  httpServer.close()
  await prisma.$disconnect()
}

import { idArg, mutationType, stringArg } from '@nexus/schema'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { APP_SECRET, getUserId } from '../utils'
import { AuthPayload } from './AuthPayload'
import { Link } from './Link'
import { Vote } from './Vote'

export const Mutation = mutationType({
  definition(t) {
    t.field('post', {
      type: Link,
      args: {
        description: stringArg({ required: true }),
        url: stringArg({ required: true }),
      },
      resolve(root, args, context) {
        const userId = getUserId(context)

        const newLink = context.prisma.link.create({
          data: {
            url: args.url,
            description: args.description,
            postedBy: { connect: { id: userId } },
          },
        })
        context.pubsub.publish('NEW_LINK', newLink)

        return newLink
      },
    })
    t.field('signup', {
      type: AuthPayload,
      nullable: true,
      args: {
        email: stringArg({ required: true }),
        name: stringArg({ required: true }),
        password: stringArg({ required: true }),
      },
      async resolve(root, args, context) {
        const password = await bcrypt.hash(args.password, 10)
        const user = await context.prisma.user.create({
          data: { ...args, password },
        })

        const token = jwt.sign({ userId: user.id }, APP_SECRET)

        return {
          token,
          user,
        }
      },
    })
    t.field('login', {
      type: AuthPayload,
      nullable: true,
      args: {
        email: stringArg({ required: true }),
        password: stringArg({ required: true }),
      },
      async resolve(root, args, context) {
        const user = await context.prisma.user.findOne({
          where: { email: args.email },
        })

        if (!user) {
          throw new Error('No such user found')
        }

        const valid = await bcrypt.compare(args.password, user.password)
        if (!valid) {
          throw new Error('Invalid password')
        }

        const token = jwt.sign({ userId: user.id }, APP_SECRET)

        return {
          token,
          user,
        }
      },
    })
    t.field('vote', {
      type: Vote,
      nullable: true,
      args: {
        linkId: idArg({ required: true }),
      },
      async resolve(root, args, context) {
        const userId = getUserId(context)
        const vote = await context.prisma.vote.findOne({
          where: {
            linkId_userId: {
              linkId: Number(args.linkId),
              userId: userId,
            },
          },
        })

        if (Boolean(vote)) {
          throw new Error(`Already voted for link: ${args.linkId}`)
        }

        const newVote = await context.prisma.vote.create({
          data: {
            user: { connect: { id: userId } },
            link: { connect: { id: Number(args.linkId) } },
          },
        })
        context.pubsub.publish('NEW_VOTE', newVote)

        return newVote
      },
    })
  },
})

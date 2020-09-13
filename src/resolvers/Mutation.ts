import { Link, User, Vote } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Context } from '../context'
import { APP_SECRET, getUserId } from '../utils'

type Args = {
  url: string
}
export const post = (_parent: unknown, args: Link, context: Context) => {
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
}

export const signup = async (
  _parent: unknown,
  args: User,
  context: Context
) => {
  const password = await bcrypt.hash(args.password, 10)
  const user = await context.prisma.user.create({
    data: { ...args, password },
  })

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}

export const login = async (_parent: unknown, args: User, context: Context) => {
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
}

export const vote = async (_parent: unknown, args: Vote, context: Context) => {
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
}

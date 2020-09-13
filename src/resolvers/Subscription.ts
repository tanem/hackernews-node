import { Link, Vote } from '@prisma/client'
import { Context } from '../context'

export const newLink = {
  subscribe: (_parent: unknown, _args: unknown, context: Context) =>
    context.pubsub.asyncIterator('NEW_LINK'),
  resolve: (payload: Link) => payload,
}

export const newVote = {
  subscribe: (_parent: unknown, _args: unknown, context: Context) =>
    context.pubsub.asyncIterator('NEW_VOTE'),
  resolve: (payload: Vote) => payload,
}

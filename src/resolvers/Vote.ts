import { Link, User } from '@prisma/client'
import { Context } from '../context'

export const link = (parent: Link, _args: unknown, context: Context) => {
  return context.prisma.vote.findOne({ where: { id: parent.id } }).link()
}

export const user = (parent: User, _args: unknown, context: Context) => {
  return context.prisma.vote.findOne({ where: { id: parent.id } }).user()
}

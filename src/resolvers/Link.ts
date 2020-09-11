import { Link } from '@prisma/client'
import { Context } from '../context'

export const postedBy = (parent: Link, _args: unknown, context: Context) => {
  return context.prisma.link.findOne({ where: { id: parent.id } }).postedBy()
}

export const votes = (parent: Link, _args: unknown, context: Context) => {
  return context.prisma.link.findOne({ where: { id: parent.id } }).votes()
}

import { Link } from '@prisma/client'
import { Context } from '../context'

export const links = (parent: Link, _args: unknown, context: Context) => {
  return context.prisma.user.findOne({ where: { id: parent.id } }).links()
}

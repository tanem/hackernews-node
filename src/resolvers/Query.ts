import { LinkOrderByInput } from '@prisma/client'
import { Context } from '../context'

export const feed = async (
  _parent: unknown,
  args: {
    filter: string
    orderBy: LinkOrderByInput
    skip: number
    take: number
  },
  context: Context
) => {
  const where = args.filter
    ? {
        OR: [
          { description: { contains: args.filter } },
          { url: { contains: args.filter } },
        ],
      }
    : {}

  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
  })

  const count = await context.prisma.link.count({ where })

  return {
    links,
    count,
  }
}

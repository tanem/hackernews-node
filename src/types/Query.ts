import { arg, intArg, queryType, stringArg } from '@nexus/schema'
import { isEmpty, mapValues } from 'lodash'
import { Feed } from './Feed'
import { LinkOrderByInput } from './LinkOrderByInput'

export const Query = queryType({
  definition(t) {
    t.field('feed', {
      type: Feed,
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({
          type: LinkOrderByInput,
        }),
      },
      async resolve(root, args, context) {
        const where = args.filter
          ? {
              OR: [
                { description: { contains: args.filter } },
                { url: { contains: args.filter } },
              ],
            }
          : undefined

        const links = await context.prisma.link.findMany({
          where,
          skip: args.skip ?? undefined,
          take: args.take ?? undefined,
          orderBy: isEmpty(args.orderBy)
            ? undefined
            : mapValues(args.orderBy, (v) => v ?? undefined),
        })

        const count = await context.prisma.link.count({ where })

        return {
          links,
          count,
        }
      },
    })
  },
})

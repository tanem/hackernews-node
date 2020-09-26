import { objectType } from '@nexus/schema'
import { Link } from './Link'
import { User } from './User'

export const Vote = objectType({
  name: 'Vote',
  definition(t) {
    t.int('id')
    t.field('link', {
      type: Link,
      async resolve(root, args, context) {
        const link = await context.prisma.vote
          .findOne({
            where: {
              id: root.id,
            },
          })
          .link()

        if (link === null) {
          throw new Error(`No link found for vote with id of "${root.id}"`)
        }

        return link
      },
    })
    t.field('user', {
      type: User,
      async resolve(root, args, context) {
        const user = await context.prisma.vote
          .findOne({ where: { id: root.id } })
          .user()

        if (user === null) {
          throw new Error(`No user found for vote with id of "${root.id}"`)
        }

        return user
      },
    })
  },
})

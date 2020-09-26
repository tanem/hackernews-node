import { objectType } from '@nexus/schema'
import { User } from './User'
import { Vote } from './Vote'

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.int('id')
    t.string('description')
    t.string('url')
    t.field('postedBy', {
      type: User,
      nullable: true,
      resolve(root, args, context) {
        return context.prisma.link
          .findOne({ where: { id: root.id } })
          .postedBy()
      },
    })
    t.list.field('votes', {
      type: Vote,
      resolve(root, args, context) {
        return context.prisma.link.findOne({ where: { id: root.id } }).votes()
      },
    })
  },
})

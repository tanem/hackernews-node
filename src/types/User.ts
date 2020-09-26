import { objectType } from '@nexus/schema'
import { Link } from './Link'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.int('id')
    t.string('name')
    t.string('email')
    t.list.field('links', {
      type: Link,
      resolve(root, args, context) {
        return context.prisma.user.findOne({ where: { id: root.id } }).links()
      },
    })
  },
})

import { objectType } from '@nexus/schema'
import { Link } from './Link'

export const Feed = objectType({
  name: 'Feed',
  definition(t) {
    t.int('count')
    t.list.field('links', {
      type: Link,
    })
  },
})

import { inputObjectType } from '@nexus/schema'
import { Sort } from './Sort'

export const LinkOrderByInput = inputObjectType({
  name: 'LinkOrderByInput',
  definition(t) {
    t.field('createdAt', {
      type: Sort,
      // nullable: true,
    })
    t.field('description', {
      type: Sort,
      // nullable: true,
    })
    t.field('url', {
      type: Sort,
      // nullable: true,
    })
  },
})

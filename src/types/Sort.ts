import { enumType } from '@nexus/schema'

export const Sort = enumType({
  name: 'Sort',
  members: ['asc', 'desc'],
})

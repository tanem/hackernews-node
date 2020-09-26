import { subscriptionType } from '@nexus/schema'
import { Link } from './Link'
import { Vote } from './Vote'

export const Subscription = subscriptionType({
  definition(t) {
    t.field('newLink', {
      type: Link,
      nullable: true,
      resolve(payload) {
        return payload
      },
      subscribe(root, args, context) {
        return context.pubsub.asyncIterator('NEW_LINK')
      },
    })
    t.field('newVote', {
      type: Vote,
      nullable: true,
      resolve(payload) {
        return payload
      },
      subscribe(root, args, context) {
        return context.pubsub.asyncIterator('NEW_VOTE')
      },
    })
  },
})

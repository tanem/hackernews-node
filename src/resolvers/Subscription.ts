export const newLink = {
  subscribe: (_parent, _args, context) =>
    context.pubsub.asyncIterator('NEW_LINK'),
  resolve: (payload) => payload,
}

export const newVote = {
  subscribe: (_parent, _args, context) =>
    context.pubsub.asyncIterator('NEW_VOTE'),
  resolve: (payload) => payload,
}

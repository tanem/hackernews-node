const newLink = {
  subscribe: (_parent, _args, context) =>
    context.pubsub.asyncIterator('NEW_LINK'),
  resolve: (payload) => payload,
}

const newVote = {
  subscribe: (_parent, _args, context) =>
    context.pubsub.asyncIterator('NEW_VOTE'),
  resolve: (payload) => payload,
}

module.exports = {
  newLink,
  newVote,
}

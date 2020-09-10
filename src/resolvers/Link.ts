export const postedBy = (parent, _args, context) =>
  context.prisma.link.findOne({ where: { id: parent.id } }).postedBy()

export const votes = (parent, _args, context) => {
  return context.prisma.link.findOne({ where: { id: parent.id } }).votes()
}

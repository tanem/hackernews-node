export const link = (parent, args, context) => {
  return context.prisma.vote.findOne({ where: { id: parent.id } }).link()
}

export const user = (parent, args, context) => {
  return context.prisma.vote.findOne({ where: { id: parent.id } }).user()
}

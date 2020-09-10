export const links = (parent, args, context) => {
  return context.prisma.user.findOne({ where: { id: parent.id } }).links()
}

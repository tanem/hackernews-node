const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

exports.truncate = async (dbName) => {
  try {
    const query = `SELECT name FROM ${dbName}.sqlite_master WHERE type = "table";`
    const rawTables = await prisma.$queryRaw(query)

    await Promise.all(
      rawTables
        .map(({ name }) => name)
        .filter((table) => !['_Migration', 'sqlite_sequence'].includes(table))
        .map(async (table) => {
          await prisma.$executeRaw(`DELETE FROM ${table};`)
          await prisma.$executeRaw(
            `DELETE FROM sqlite_sequence WHERE name = "${table}";`
          )
        })
    )
  } catch (error) {
    console.log(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

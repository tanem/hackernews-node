const { prisma } = require('../prisma/client')
const path = require('path')
const chance = require('chance').Chance(path.basename(__filename))
const bcrypt = require('bcryptjs')

const createUser = ({ name, email, password }) =>
  prisma.user.create({
    data: {
      name,
      email,
      password: bcrypt.hashSync(password, 10),
    },
  })

const createLink = ({ description, url, userId }) =>
  prisma.link.create({
    data: {
      description,
      url,
      postedBy: {
        connect: { id: userId },
      },
    },
  })

const createVote = ({ linkId, userId }) =>
  prisma.vote.create({
    data: {
      link: {
        connect: { id: linkId },
      },
      user: {
        connect: { id: userId },
      },
    },
  })

;(async () => {
  try {
    let users = []
    for (const _value of new Array(2).fill()) {
      const user = await createUser({
        name: chance.first(),
        email: chance.email(),
        password: chance.word(),
      })
      users.push(user)
    }

    let links = []
    for (const user of users) {
      for (const _value of new Array(2).fill()) {
        const link = await createLink({
          description: chance.sentence({ words: 5 }),
          url: chance.url(),
          userId: user.id,
        })
        links.push(link)
      }
    }

    for (const user of users) {
      for (const link of links) {
        await createVote({ linkId: link.id, userId: user.id })
      }
    }
  } catch (error) {
    console.log(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('123456', 10)

  await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin',
      password,
      role: 'ADMIN'
    }
  })

  console.log('Seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Database setup complete - ready for data entry")

  console.log("✅ Database setup complete - ready for data entry")
}

main()
  .catch((e) => {
    console.error("❌ Setup failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


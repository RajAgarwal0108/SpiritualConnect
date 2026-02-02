const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, email: true, name: true }
    });
    const total = await prisma.user.count();
    console.log("Sample users:", users);
    console.log("Total users:", total);
  } catch (error) {
    console.error("DB check failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();

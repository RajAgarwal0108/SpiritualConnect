
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { id: 1 } });
  if (user) {
    await prisma.user.update({
      where: { id: 1 },
      data: { isGuide: true, guideStatus: 'APPROVED', guideTitle: 'Senior Spiritual Guide', guideBio: 'An experienced guide in the community.' }
    });
    console.log('User 1 updated to a Guide.');
  } else {
      console.log('User 1 not found.');
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

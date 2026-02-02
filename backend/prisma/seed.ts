import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@spiritualconnect.com";
  // Check if admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Super Admin",
        role: "ADMIN",
        profile: {
          create: {
            bio: "Guardian of the SpiritualConnect platform.",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`,
            avatarType: "library"
          }
        }
      }
    });
    console.log("Admin user created:", admin.email);
  } else {
    console.log("Admin user already exists. Initializing avatar if missing...");
    await prisma.profile.update({
      where: { userId: existingAdmin.id },
      data: {
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`,
        avatarType: "library"
      }
    });
  }

  // Create Communities
  const communities = [
    { name: "🧘 Yoga", description: "Body, mind, and spirit union through asanas and awareness." },
    { name: "📖 Bhagavad Gita", description: "Exploring the timeless wisdom of the Song of God." },
    { name: "🌿 Satvic Food", description: "Nourishing the soul with pure, life-giving nutrition." },
    { name: "🧠 Health & Mindfulness", description: "Cultivating presence and holistic well-being." },
    { name: "🕉️ Meditation", description: "Diving into the silence within." },
    { name: "🌱 Ayurveda", description: "The ancient science of life and longevity." }
  ];

  for (const c of communities) {
    await prisma.community.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        description: c.description,
        memberCount: 0
      }
    });
  }
  console.log("Communities seeded.");

  // Fetch a community for posts
  const yogaComm = await prisma.community.findUnique({ where: { name: "🧘 Yoga" } });

  // Create 5 diverse users
  const demoUsers = [
    { email: "arjuna@vibes.com", name: "Warrior Arjuna", bio: "Finding balance between action and detachment.", interest: "Dharma" },
    { email: "mirabai@bhakti.com", name: "Mira Devotee", bio: "Lost in the melody of divine love.", interest: "Bhakti" },
    { email: "socrates@wisdom.com", name: "Socrative Soul", bio: "The unexamined life is not worth living.", interest: "Philosophy" },
    { email: "gandhi@peace.com", name: "Mahatma G", bio: "Be the change you wish to see.", interest: "Non-Violence" },
    { email: "rumi@poetry.com", name: "Rumi Heart", bio: "Let the beauty of what you love be what you do.", interest: "Poetry" }
  ];

  for (const u of demoUsers) {
    const existing = await prisma.user.findUnique({ 
      where: { email: u.email },
      include: { profile: true }
    });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("user123", 10);
      await prisma.user.create({
        data: {
          email: u.email,
          password: hashedPassword,
          name: u.name,
          role: "USER",
          profile: {
            create: {
              bio: u.bio,
              interests: [u.interest],
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name.replace(/\s+/g, '')}`,
              avatarType: "library"
            }
          },
          posts: {
            create: [
              { 
                content: `Today I realized that ${u.bio}`, 
                status: "PUBLISHED",
                communityId: yogaComm!.id
              },
              { 
                content: `Does anyone else feel that ${u.interest} is the key to happiness?`, 
                status: "PUBLISHED",
                communityId: yogaComm!.id
              }
            ]
          }
        }
      });
    }
  }
  console.log("Diverse demo users and community posts created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

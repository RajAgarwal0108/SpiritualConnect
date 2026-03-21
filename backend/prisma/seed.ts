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

  // Add community memberships for demo users
  for (const u of demoUsers) {
    const user = await prisma.user.findUnique({ where: { email: u.email } });
    if (user && yogaComm) {
      await prisma.communityMembership.upsert({
        where: { userId_communityId: { userId: user.id, communityId: yogaComm.id } },
        update: {},
        create: { userId: user.id, communityId: yogaComm.id, role: "MEMBER" }
      });
    }
  }

  // Create sample blogs
  const blogSamples = [
    {
      title: "Journey of Dharma",
      excerpt: "Reflections on right action and inner duty.",
      content: "An extended reflection inspired by the Bhagavad Gita on performing duty without attachment.",
      category: "Philosophy",
      readTime: "6 min",
      coverImage: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe"
    },
    {
      title: "The Song of Devotion",
      excerpt: "Cultivating a heart that sings for the Beloved.",
      content: "Practical practices to deepen bhakti and bring more tenderness into life.",
      category: "Devotion",
      readTime: "4 min",
      coverImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
    }
  ];

  // Attach blogs to demo users (if present)
  const arjuna = await prisma.user.findUnique({ where: { email: "arjuna@vibes.com" } });
  const mirabai = await prisma.user.findUnique({ where: { email: "mirabai@bhakti.com" } });

  const sample0 = blogSamples[0];
  const sample1 = blogSamples[1];

  if (arjuna && sample0) {
    const exists = await prisma.blog.findFirst({ where: { title: sample0.title, authorId: arjuna.id } });
    if (!exists) {
      const blog = await prisma.blog.create({
        data: {
          title: sample0.title,
          excerpt: sample0.excerpt,
          content: sample0.content,
          category: sample0.category,
          readTime: sample0.readTime,
          coverImage: sample0.coverImage,
          authorId: arjuna.id
        }
      });
      await prisma.blogComment.createMany({
        data: [
          { content: "This really helped me refocus my priorities.", blogId: blog.id, authorId: arjuna.id },
        ]
      });
    }
  }

  if (mirabai && sample1) {
    const exists = await prisma.blog.findFirst({ where: { title: sample1.title, authorId: mirabai.id } });
    if (!exists) {
      const blog = await prisma.blog.create({
        data: {
          title: sample1.title,
          excerpt: sample1.excerpt,
          content: sample1.content,
          category: sample1.category,
          readTime: sample1.readTime,
          coverImage: sample1.coverImage,
          authorId: mirabai.id
        }
      });
      await prisma.blogComment.createMany({
        data: [
          { content: "A gentle reminder to open the heart daily.", blogId: blog.id, authorId: mirabai.id }
        ]
      });
    }
  }

  // Create sample courses with modules and lessons
  const courseExists = await prisma.course.findFirst({ where: { title: "Foundations of Presence" } });
  if (!courseExists) {
    const course = await prisma.course.create({
      data: {
        title: "Foundations of Presence",
        description: "A gentle course on building daily presence through breath, body, and simple rituals.",
        instructor: "Sacred Guide",
        price: "Free",
        duration: "2 weeks",
        thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        modules: {
          create: [
            {
              title: "Breath & Awareness",
              order: 1,
              lessons: {
                create: [
                  { title: "Intro to Breathwork", content: "Foundational breathing practices.", order: 1 },
                  { title: "Daily 5-minute Practice", content: "Short routine to anchor your day.", order: 2 }
                ]
              }
            },
            {
              title: "Embodied Rituals",
              order: 2,
              lessons: {
                create: [
                  { title: "Morning Ritual", content: "A simple sequence to greet the day.", order: 1 },
                  { title: "Evening Reflection", content: "A short journaling prompt.", order: 2 }
                ]
              }
            }
          ]
        }
      }
    });
    console.log("Sample course created:", course.title);
  }

  console.log("Additional blogs, comments, courses, and memberships seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

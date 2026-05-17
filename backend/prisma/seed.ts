import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const seedTag = "SC2026";
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

  const communities = [
    { name: "🧘 Yoga", description: "Body, mind, and spirit union through asanas and awareness." },
    { name: "📖 Bhagavad Gita", description: "Exploring the timeless wisdom of the Song of God." },
    { name: "🌿 Satvic Food", description: "Nourishing the soul with pure, life-giving nutrition." },
    { name: "🧠 Health & Mindfulness", description: "Cultivating presence and holistic well-being." },
    { name: "🕉️ Meditation", description: "Diving into the silence within." },
    { name: "🌱 Ayurveda", description: "The ancient science of life and longevity." },
    { name: "🌊 Breathwork", description: "Learning to ride the breath like a gentle tide." },
    { name: "🔥 Inner Fire", description: "Cultivating courage, focus, and sacred discipline." },
    { name: "🌸 Devotion", description: "Practices of love, surrender, and remembering." },
    { name: "🧭 Purpose", description: "Listening for vocation and living with intention." },
    { name: "🕊️ Compassion", description: "Meeting the world with empathy and wise action." },
    { name: "🌙 Dreamwork", description: "Exploring symbols and messages from the night mind." }
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

  const demoUsers = [
    { email: "arjuna@vibes.com", name: "Warrior Arjuna", bio: "Finding balance between action and detachment.", interest: "Dharma" },
    { email: "mirabai@bhakti.com", name: "Mira Devotee", bio: "Lost in the melody of divine love.", interest: "Bhakti" },
    { email: "socrates@wisdom.com", name: "Socrative Soul", bio: "The unexamined life is not worth living.", interest: "Philosophy" },
    { email: "gandhi@peace.com", name: "Mahatma G", bio: "Be the change you wish to see.", interest: "Non-Violence" },
    { email: "rumi@poetry.com", name: "Rumi Heart", bio: "Let the beauty of what you love be what you do.", interest: "Poetry" },
    { email: "tagore@dawn.com", name: "Tagore Dawn", bio: "I slept and dreamt that life was joy.", interest: "Song" },
    { email: "maya@stillness.com", name: "Maya Still", bio: "Silence is my first teacher.", interest: "Meditation" },
    { email: "leo@breath.com", name: "Leo Breath", bio: "I count my breaths as blessings.", interest: "Breathwork" },
    { email: "zara@ritual.com", name: "Zara Ritual", bio: "Simple rituals, profound shifts.", interest: "Ritual" },
    { email: "dev@kindness.com", name: "Dev Kind", bio: "Compassion is my north star.", interest: "Compassion" },
    { email: "anjali@moon.com", name: "Anjali Moon", bio: "I journal by moonlight and listen.", interest: "Dreamwork" },
    { email: "luca@stillwater.com", name: "Luca Stillwater", bio: "I practice soft attention.", interest: "Mindfulness" },
    { email: "neel@pulse.com", name: "Neel Pulse", bio: "The heart is a drum that remembers.", interest: "Heart" },
    { email: "priya@earth.com", name: "Priya Earth", bio: "Living close to nature restores me.", interest: "Ayurveda" },
    { email: "sana@light.com", name: "Sana Light", bio: "I seek the clear flame within.", interest: "Inner Fire" },
    { email: "tomas@path.com", name: "Tomas Path", bio: "Purpose is a practice, not a destination.", interest: "Purpose" },
    { email: "aisling@dawn.com", name: "Aisling Dawn", bio: "I meet each day as a pilgrim.", interest: "Devotion" },
    { email: "noah@river.com", name: "Noah River", bio: "Flow is my teacher.", interest: "Yoga" }
  ];

  const guideProfiles = [
    { email: "guide.isha@spiritual.com", name: "Isha Raina", bio: "Guiding seekers through breath and inner quiet.", interest: "Meditation", title: "Meditation Guide" },
    { email: "guide.kiran@spiritual.com", name: "Kiran Sol", bio: "Helping people align with purposeful living.", interest: "Purpose", title: "Purpose Coach" },
    { email: "guide.dev@spiritual.com", name: "Devika Rai", bio: "Compassion practices for a tender heart.", interest: "Compassion", title: "Compassion Mentor" },
    { email: "guide.arya@spiritual.com", name: "Arya Sen", bio: "Ancient wisdom made simple and grounded.", interest: "Dharma", title: "Wisdom Guide" },
    { email: "guide.nadia@spiritual.com", name: "Nadia Moon", bio: "Holding space for grief, growth, and grace.", interest: "Healing", title: "Grief & Healing Guide" },
    { email: "guide.rishi@spiritual.com", name: "Rishi Prakash", bio: "Breathwork and mantra for the modern seeker.", interest: "Breathwork", title: "Breathwork Facilitator" },
    { email: "guide.kali@spiritual.com", name: "Kali Amrit", bio: "Helping sensitive souls find their grounded power.", interest: "Inner Fire", title: "Empowerment Coach" },
    { email: "guide.surya@spiritual.com", name: "Surya Devi", bio: "Yoga philosophy and daily sadhana guidance.", interest: "Yoga", title: "Yoga & Philosophy Mentor" },
    { email: "guide.anand@spiritual.com", name: "Anand Veer", bio: "Mindfulness-based emotional resilience coaching.", interest: "Mindfulness", title: "Mindfulness Coach" },
    { email: "guide.meera@spiritual.com", name: "Meera Chand", bio: "Devotional path guidance through song and silence.", interest: "Devotion", title: "Bhakti Guide" }
  ];

  const allProfiles = [...demoUsers, ...guideProfiles];
  for (const u of allProfiles) {
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
          isGuide: Boolean("title" in u),
          guideStatus: "title" in u ? "APPROVED" : "NONE",
          guideTitle: "title" in u ? u.title : null,
          guideBio: "title" in u ? u.bio : null,
          phoneNumber: "title" in u ? "+1-555-010" + (Math.floor(Math.random() * 8) + 1) : null,
          profile: {
            create: {
              bio: u.bio,
              interests: [u.interest],
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name.replace(/\s+/g, "")}`,
              avatarType: "library"
            }
          }
        }
      });
    }
  }

  const communityRecords = await prisma.community.findMany({
    where: { name: { in: communities.map((c) => c.name) } }
  });

  const users = await prisma.user.findMany({
    where: { email: { in: allProfiles.map((u) => u.email) } },
    include: { profile: true }
  });

  const userByEmail = new Map(users.map((u) => [u.email, u]));
  const userList = users;

  const communitiesByName = new Map(communityRecords.map((c) => [c.name, c]));
  const communityList = communities.map((c) => communitiesByName.get(c.name)!).filter(Boolean);

  for (const [userIndex, user] of userList.entries()) {
    const membershipTargets = [
      communityList[userIndex % communityList.length],
      communityList[(userIndex + 3) % communityList.length],
      communityList[(userIndex + 6) % communityList.length]
    ];
    for (const community of membershipTargets) {
      await prisma.communityMembership.upsert({
        where: { userId_communityId: { userId: user.id, communityId: community.id } },
        update: {},
        create: { userId: user.id, communityId: community.id, role: "MEMBER" }
      });
    }
  }

  for (const community of communityList) {
    const count = await prisma.communityMembership.count({ where: { communityId: community.id } });
    await prisma.community.update({
      where: { id: community.id },
      data: { memberCount: count }
    });
  }

  const postThemes = [
    "a quiet breath before the day begins",
    "the moment I chose presence over hurry",
    "a small ritual that changed my week",
    "a question I keep returning to",
    "how kindness softened a hard moment",
    "learning to listen without fixing"
  ];

  for (const [communityIndex, community] of communityList.entries()) {
    for (let i = 0; i < 8; i += 1) {
      const author = userList[(communityIndex + i) % userList.length];
      const content = `${seedTag} ${community.name} reflection ${i + 1}: ${postThemes[i % postThemes.length]}.`;
      const exists = await prisma.post.findFirst({ where: { content, authorId: author.id, communityId: community.id } });
      if (!exists) {
        await prisma.post.create({
          data: {
            content,
            status: "PUBLISHED",
            communityId: community.id,
            authorId: author.id
          }
        });
      }
    }
  }

  const threadTopics = [
    "Opening practice",
    "Gentle accountability",
    "Difficult emotions",
    "Daily ritual",
    "Sacred boundaries"
  ];

  for (const [communityIndex, community] of communityList.entries()) {
    for (let i = 0; i < 5; i += 1) {
      const author = userList[(communityIndex + i + 2) % userList.length];
      const title = `${seedTag} ${community.name} Thread ${i + 1}: ${threadTopics[i % threadTopics.length]}`;
      const body = `I am exploring ${threadTopics[i % threadTopics.length].toLowerCase()} in this circle. What practices help you stay steady?`;
      const tags = [community.name.replace(/[^a-zA-Z]/g, ""), threadTopics[i % threadTopics.length].split(" ")[0].toLowerCase()]
        .filter(Boolean)
        .slice(0, 3);

      const existingThread = await prisma.thread.findFirst({
        where: { title, communityId: community.id }
      });

      const thread = existingThread
        ? existingThread
        : await prisma.thread.create({
            data: {
              title,
              body,
              tags,
              authorId: author.id,
              communityId: community.id,
              lastActivityAt: new Date()
            }
          });

      for (let r = 0; r < 3; r += 1) {
        const replier = userList[(communityIndex + i + r + 5) % userList.length];
        const replyBody = `${seedTag} reply ${r + 1}: I return to the breath, then listen to what feels true.`;
        const replyExists = await prisma.threadReply.findFirst({
          where: { body: replyBody, threadId: thread.id, authorId: replier.id }
        });
        if (!replyExists) {
          await prisma.threadReply.create({
            data: {
              body: replyBody,
              replyType: r % 2 === 0 ? "BLESSING" : "PRACTICE",
              authorId: replier.id,
              threadId: thread.id
            }
          });
        }
      }
    }
  }

  const blogSamples = [
    {
      title: "Rituals That Hold Me",
      excerpt: "Small practices that keep my spirit steady.",
      content: "Here are three rituals I return to when life is loud. They are simple, repeatable, and deeply kind.",
      category: "Practice",
      readTime: "5 min",
      coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
    },
    {
      title: "Listening for the Quiet Yes",
      excerpt: "How to sense the subtle alignment within.",
      content: "Alignment is not a shout. It is a quiet yes that arrives when you are willing to be still.",
      category: "Mindfulness",
      readTime: "6 min",
      coverImage: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe"
    },
    {
      title: "Devotion in Daily Life",
      excerpt: "Where devotion meets the ordinary.",
      content: "Devotion is not only in temples. It is in how we wash a cup, answer a message, and honor our limits.",
      category: "Devotion",
      readTime: "4 min",
      coverImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
    },
    {
      title: "The Anatomy of a Pause",
      excerpt: "Why the pause is a spiritual practice.",
      content: "Pauses interrupt the momentum of fear and invite clarity to return. Here is how I practice them.",
      category: "Reflection",
      readTime: "5 min",
      coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e"
    },
    {
      title: "Soft Strength",
      excerpt: "The courage to be gentle.",
      content: "Gentleness is not weakness. It is the strength to meet life without armor.",
      category: "Compassion",
      readTime: "4 min",
      coverImage: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d"
    }
  ];

  for (const [index, sample] of blogSamples.entries()) {
    const author = userList[index % userList.length];
    const title = `${seedTag} ${sample.title}`;
    const exists = await prisma.blog.findFirst({ where: { title, authorId: author.id } });
    if (!exists) {
      const blog = await prisma.blog.create({
        data: {
          title,
          excerpt: sample.excerpt,
          content: sample.content,
          category: sample.category,
          readTime: sample.readTime,
          coverImage: sample.coverImage,
          authorId: author.id
        }
      });
      await prisma.blogComment.createMany({
        data: [
          { content: `${seedTag} This felt like a gentle bell to return to myself.`, blogId: blog.id, authorId: author.id },
          { content: `${seedTag} Thank you for naming what I could not.`, blogId: blog.id, authorId: userList[(index + 2) % userList.length].id }
        ]
      });
    }
  }

  const guides = guideProfiles
    .map((g) => userByEmail.get(g.email))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const seekers = demoUsers
    .map((u) => userByEmail.get(u.email))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  for (const [guideIndex, guide] of guides.entries()) {
    for (let i = 0; i < 3; i += 1) {
      const seeker = seekers[(guideIndex + i) % seekers.length];
      const sessionExists = await prisma.guidanceSession.findUnique({
        where: { userId_guideId: { userId: seeker.id, guideId: guide.id } }
      });
      if (!sessionExists) {
        const session = await prisma.guidanceSession.create({
          data: {
            userId: seeker.id,
            guideId: guide.id,
            status: i % 2 === 0 ? "ACCEPTED" : "COMPLETED",
            mood: "open and curious",
            goal: "Create a steady morning ritual",
            summary: i % 2 === 0 ? null : "We crafted a simple breath and journaling practice."
          }
        });

        await prisma.guidanceMessage.createMany({
          data: [
            {
              sessionId: session.id,
              senderId: seeker.id,
              content: `${seedTag} I am looking for a practice that feels gentle and consistent.`,
              type: "TEXT"
            },
            {
              sessionId: session.id,
              senderId: guide.id,
              content: `${seedTag} Let's begin with three minutes of breath and a short intention.`,
              type: "TEXT"
            },
            {
              sessionId: session.id,
              senderId: guide.id,
              content: `${seedTag} Would you like a prompt for reflective journaling?`,
              type: "QUESTION",
              metadata: { question: "What kind of day do you want to cultivate?", category: "Reflection" }
            }
          ]
        });
      }
    }
  }

  // Additional guidance sessions with richer variety
  const seekersCopy = [...seekers];
  for (const [guideIndex, guide] of guides.entries()) {
    for (let i = 0; i < 2; i += 1) {
      const seekerIdx = (guideIndex * 3 + i + 7) % seekersCopy.length;
      const seeker = seekersCopy[seekerIdx];
      const sessionExists = await prisma.guidanceSession.findUnique({
        where: { userId_guideId: { userId: seeker.id, guideId: guide.id } }
      });
      if (!sessionExists) {
        const statuses: ("PENDING" | "ACCEPTED" | "COMPLETED")[] = ["PENDING", "ACCEPTED", "COMPLETED"];
        const status = statuses[i % 3];
        const moods = ["anxious but hopeful", "seeking clarity", "grateful and open", "struggling with purpose", "peaceful", "healing slowly"];
        const goals = ["Navigating a life transition", "Healing from loss", "Finding daily discipline", "Understanding my purpose", "Managing anxiety", "Deepening my meditation practice"];
        const summaries: (string | null)[] = [
          null, null,
          "We identified three key practices to ground during uncertainty.",
          "Established a morning routine with breathwork and journaling.",
          "Explored the root of the anxiety and found a mantra that resonates.",
          "Created a personalized meditation roadmap."
        ];
        const session = await prisma.guidanceSession.create({
          data: {
            userId: seeker.id,
            guideId: guide.id,
            status,
            mood: moods[(guideIndex + i) % moods.length],
            goal: goals[(guideIndex * 2 + i) % goals.length],
            summary: status === "COMPLETED" ? summaries[(guideIndex + i) % summaries.length] : null
          }
        });

        const msgPayload: { senderId: number; content: string; type: string; metadata?: Record<string, unknown> }[] = [
          {
            senderId: seeker.id,
            content: `${seedTag} Hi, I could really use some support with ${goals[(guideIndex * 2 + i) % goals.length].toLowerCase()}.`,
            type: "TEXT"
          },
          {
            senderId: guide.id,
            content: `${seedTag} Thank you for reaching out. Let's start by understanding where you feel this most in your body.`,
            type: "TEXT"
          },
          {
            senderId: guide.id,
            content: `${seedTag} Here is a gentle practice to try before our next reflection.`,
            type: "ROUTINE",
            metadata: { title: "Morning Grounding Ritual", steps: ["Three deep breaths", "Set one intention", "Place hand on heart", "Whisper a gratitude"], duration: "5 min", focus: "Grounding" }
          }
        ];

        if (status !== "PENDING") {
          msgPayload.push({
            senderId: seeker.id,
            content: `${seedTag} I tried the practice and it helped me feel more centered. Thank you.`,
            type: "TEXT"
          });
          msgPayload.push({
            senderId: guide.id,
            content: `${seedTag} That is wonderful. Let me offer you a reflection for the week ahead.`,
            type: "QUESTION",
            metadata: { question: "What would it look like to meet this week with softness instead of force?", category: "Reflection" }
          });
        }

        if (status === "COMPLETED") {
          msgPayload.push({
            senderId: seeker.id,
            content: `${seedTag} I feel more grounded than when I started. Thank you for your guidance.`,
            type: "TEXT"
          });
          msgPayload.push({
            senderId: guide.id,
            content: `${seedTag} You did the work. Carry this gentle awareness with you always.`,
            type: "TEXT"
          });
        }

        await prisma.guidanceMessage.createMany({
          data: msgPayload.map((m) => ({
            sessionId: session.id,
            senderId: m.senderId,
            content: m.content,
            type: m.type,
            metadata: m.metadata
          }))
        });
      }
    }
  }

  for (let i = 0; i < userList.length; i += 1) {
    const follower = userList[i];
    const following = userList[(i + 1) % userList.length];
    if (follower.id !== following.id) {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: follower.id, followingId: following.id } },
        update: {},
        create: { followerId: follower.id, followingId: following.id }
      });
    }
  }

  const seededPosts = await prisma.post.findMany({
    where: { content: { startsWith: seedTag } },
    take: 100
  });

  for (const [index, post] of seededPosts.entries()) {
    const commenter = userList[index % userList.length];
    const commentBody = `${seedTag} This landed softly for me. Thank you for sharing.`;
    const commentExists = await prisma.comment.findFirst({
      where: { content: commentBody, postId: post.id, authorId: commenter.id }
    });
    if (!commentExists) {
      const comment = await prisma.comment.create({
        data: { content: commentBody, postId: post.id, authorId: commenter.id }
      });
      await prisma.comment.create({
        data: {
          content: `${seedTag} I feel this too.`,
          postId: post.id,
          authorId: userList[(index + 2) % userList.length].id,
          parentId: comment.id
        }
      });
    }

    await prisma.like.upsert({
      where: { userId_postId: { userId: commenter.id, postId: post.id } },
      update: {},
      create: { userId: commenter.id, postId: post.id }
    });

    await prisma.bookmark.upsert({
      where: { userId_postId: { userId: commenter.id, postId: post.id } },
      update: {},
      create: { userId: commenter.id, postId: post.id }
    });
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

  console.log("Medium demo content seeded across communities, users, threads, blogs, and guidance sessions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

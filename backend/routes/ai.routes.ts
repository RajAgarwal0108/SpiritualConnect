import express from "express";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper: Search website content (posts, blogs, courses)
async function searchWebsiteContent(query: string) {
  try {
    // Search posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: query, mode: "insensitive" } },
        ]
      },
      include: {
        author: { select: { name: true } },
        community: { select: { name: true } }
      },
      take: 5,
    });

    // Search users/profiles for bio matches
    const profiles = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
        ]
      },
      include: { profile: true },
      take: 5,
    });

    return {
      posts: posts.map((post: any) => ({
        type: "post",
        title: post.content.substring(0, 100),
        author: post.author.name,
        community: post.community?.name,
        link: `/posts/${post.id}`,
        content: post.content,
      })),
      profiles: profiles.map((profile: any) => ({
        type: "profile",
        title: profile.name,
        bio: profile.profile?.bio,
        link: `/profile/${profile.id}`,
      })),
    };
  } catch (error) {
    console.error("Error searching website content:", error);
    return { posts: [], profiles: [] };
  }
}

// Main AI query endpoint using Gemini
router.post("/query", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "test_gemini_api_key") {
      return res.status(500).json({ 
        error: "Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.",
        hint: "Get your free API key from https://makersuite.google.com/app/apikey"
      });
    }

    // Search website content
    const websiteContent = await searchWebsiteContent(question);

    // Build prompt for Gemini
    const prompt = `You are the Vedic Oracle - a wise spiritual guide knowledgeable about yoga, meditation, dharma, karma, Buddhism, Taoism, Stoicism, Hindu philosophy, and all major spiritual traditions and practices.

User's Spiritual Question: "${question}"

Please provide a comprehensive, authentic spiritual response that includes:

1. **Main Teaching**: A detailed explanation grounded in actual spiritual traditions
2. **Relevant Practices**: Specific yoga practices, meditation techniques, or spiritual exercises if applicable
3. **Philosophical Context**: Reference relevant spiritual texts or philosophies (Bhagavad Gita, Upanishads, Yoga Sutras, Buddhist teachings, etc.)
4. **Practical Guidance**: Actionable steps the seeker can take in their daily life
5. **Deeper Reflection**: A contemplative insight for personal reflection

Your response should be:
- Authentic and deeply rooted in actual spiritual teachings
- Clear, accessible, and inspiring to modern spiritual seekers
- Respectful of different traditions while drawing from universal wisdom
- Practical yet spiritually profound
- Warm and compassionate in tone

Format your answer as a flowing, wisdom-filled response suitable for a spiritual seeker.`;

    // Call Gemini API
    let geminiResponse = "";
    try {
      // Use gemini-2.5-flash model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      geminiResponse = response.text();
    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError);
      console.error("Error message:", apiError.message);
      console.error("Error status:", apiError.status);
      
      // Provide helpful error message
      if (apiError.message.includes("404") || apiError.message.includes("not found")) {
        geminiResponse = `🔮 **The Oracle is temporarily unavailable**\n\nThe Gemini API key may be invalid or expired. Please update your GEMINI_API_KEY in the .env file.\n\nGet a new free API key from: https://makersuite.google.com/app/apikey\n\nIn the meantime, explore the community content below for guidance.`;
      } else if (apiError.message.includes("API key")) {
        geminiResponse = `🔮 **API Key Issue**\n\nPlease check your GEMINI_API_KEY in the .env file and ensure it's valid.\n\nGet a free API key from: https://makersuite.google.com/app/apikey`;
      } else {
        geminiResponse = `🔮 **The Oracle is reflecting deeply**\n\nI'm currently unable to provide a personalized response. Please check the community content below, or try again in a moment.`;
      }
    }

    const combinedResults = {
      spiritualTexts: [],
      websiteContent,
      answer: geminiResponse,
    };

    res.json(combinedResults);
  } catch (error: any) {
    console.error("AI Query Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to process query with Gemini API",
      details: process.env.NODE_ENV === "development" ? error.toString() : undefined
    });
  }
});

export default router;

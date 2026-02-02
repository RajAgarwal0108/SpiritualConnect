# AI Oracle Setup Guide

## Prerequisites

1. **Get Gemini API Key**:
   - Visit: https://ai.google.dev/
   - Click "Get API Key"
   - Create a new API key for your project
   - Copy the key

2. **Install Dependencies**:
   ```bash
   cd backend
   bun install
   ```

3. **Configure Environment**:
   - Open `backend/.env` (create if it doesn't exist)
   - Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```

4. **Start Backend**:
   ```bash
   cd backend
   bun run dev
   ```

5. **Start Frontend** (in another terminal):
   ```bash
   cd frontend
   bun run dev
   ```

6. **Visit AI Assistant**:
   - Go to: http://localhost:3000/ai-assistant
   - Ask any spiritual question

## Features

✅ **Gemini-Powered Responses**: Intelligent AI using Google's Gemini API
✅ **Multiple Traditions**: Knowledge of Vedas, Buddhism, Taoism, Stoicism, Yoga
✅ **Website Search**: Links to posts, blogs, profiles on your site
✅ **Detailed Guidance**: Practical steps and spiritual insights
✅ **Conversational**: Natural, flowing responses

## Example Queries

- "What is karma and how does it affect my life?"
- "How do I start a meditation practice?"
- "Explain the concept of dharma from Hindu philosophy"
- "What are the benefits of yoga?"
- "How can I find inner peace?"
- "Teach me about Buddhist enlightenment"

## Troubleshooting

**API Key Issues**:
- Verify the key is correct in `.env`
- Check that it's not expired
- Ensure proper formatting (no extra spaces)

**Still not working?**:
- Check backend console for errors: `bun run dev`
- Verify Gemini API is accessible
- Ensure dotenv package is installed: `bun install dotenv`

That's it! Your Vedic Oracle is now powered by Gemini AI.

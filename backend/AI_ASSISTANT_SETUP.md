# 🔮 AI Assistant (Vedic Oracle) Setup Guide

## Issue: AI Assistant Not Working

The AI Assistant (Vedic Oracle) requires a valid Google Gemini API key to function.

## Current Status

❌ **The Gemini API key is either invalid or expired**

Error: `models/gemini-pro is not found for API version v1`

This means the API key in your `.env` file needs to be updated.

## How to Fix

### Step 1: Get a New Gemini API Key

1. Visit: **https://makersuite.google.com/app/apikey** (or https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the generated API key

### Step 2: Update Your .env File

Open `/backend/.env` and update the `GEMINI_API_KEY`:

```bash
GEMINI_API_KEY=your_new_api_key_here
```

### Step 3: Restart the Backend Server

```bash
cd backend
bun run dev
```

### Step 4: Test the AI Assistant

```bash
# Test with curl
curl -X POST http://localhost:3001/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is karma?"}'
```

Or visit: http://localhost:3000/ai-assistant

## Alternative: Free Tier Limits

If you're hitting API limits, consider:

1. **Use a different Google account** to get a new free tier API key
2. **Implement rate limiting** in the frontend to prevent excessive API calls
3. **Cache responses** for common questions
4. **Use a different AI provider** (OpenAI, Anthropic, etc.)

## Features When Working

When properly configured, the AI Assistant provides:

- ✨ Spiritual guidance from Vedic Oracle
- 📚 Searches sacred texts and philosophies
- 🌐 Searches community posts and profiles
- 🧘 Meditation and yoga practice recommendations
- 💭 Philosophical insights from various traditions

## Current Fallback Behavior

Without a valid API key, the AI assistant will:
- Still search your local database for relevant posts and profiles
- Display a helpful error message
- Suggest getting a new API key

## Supported Models

The AI assistant attempts to use these models in order:
1. `gemini-1.5-pro` (latest, most capable)
2. `gemini-pro` (fallback, widely available)

## Environment Variables

```bash
# Required for AI Assistant
GEMINI_API_KEY=your_api_key_here

# Other environment variables
POSTGRES_USER=spiritual_user
POSTGRES_PASSWORD=spiritual_password
POSTGRES_DB=spiritual_db
DATABASE_URL="postgresql://spiritual_user:spiritual_password@localhost:5432/spiritual_db?schema=public"
JWT_SECRET=your_jwt_secret
PORT=3001
STORAGE_TYPE=local
```

## Troubleshooting

### Error: "API key not configured"
- Check that GEMINI_API_KEY is set in `.env`
- Restart the backend server after updating `.env`

### Error: "404 Not Found"
- API key is invalid or expired
- Get a new API key from Google AI Studio

### Error: "429 Too Many Requests"
- You've hit the free tier limit
- Wait a few minutes or use a different API key

### No Error But No Response
- Check backend console logs for detailed errors
- Verify database connection is working
- Check that the backend server is running on port 3001

## Testing

Run the test suite to verify everything is configured correctly:

```bash
cd backend
bun test routes/__tests__/admin.routes.test.ts
```

## Documentation

- Google AI Studio: https://aistudio.google.com
- Gemini API Docs: https://ai.google.dev/docs
- Get API Key: https://makersuite.google.com/app/apikey

---

**Need Help?** Check the backend console logs for detailed error messages.

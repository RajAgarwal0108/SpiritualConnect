#!/bin/bash

echo "🧪 Testing AI Assistant with Gemini 2.5 Flash"
echo "================================================"
echo ""

# Test 1: Simple question
echo "📝 Test 1: Asking 'What is karma?'"
echo "---"
curl -s -X POST http://localhost:3001/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is karma?"}' | \
  jq -r '.answer' | head -c 500
echo ""
echo ""

# Test 2: Meditation question  
echo "📝 Test 2: Asking about meditation"
echo "---"
curl -s -X POST http://localhost:3001/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I start meditating?"}' | \
  jq -r '.answer' | head -c 500
echo ""
echo ""

echo "✅ Testing complete!"
echo ""
echo "💡 To see full responses, visit: http://localhost:3000/ai-assistant"

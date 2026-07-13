import axios from 'axios';
import { ModelProvider, Message } from '../store/useAppStore';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || 'MISSING_KEY';
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || 'MISSING_KEY';

/**
 * OpenRouter Unified Generation Utility
 */
export const generateResponse = async (
  model: ModelProvider,
  messages: Message[]
): Promise<string> => {
  if (GROQ_API_KEY === 'MISSING_KEY' || OPENROUTER_API_KEY === 'MISSING_KEY') {
      return "Configuration Error: API Keys are missing in the environment.";
  }

  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || "";

  try {
    // 1. Specialized IMAGE Generation (via OpenRouter Tools)
    if (model.category === 'image') {
       const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model.routingKey || 'openai/gpt-4o', // Fallback to a capable model
          messages: [{ role: 'user', content: lastUserMsg }],
          tools: [{ "type": "openrouter:image_generation" }]
       }, {
          headers: {
             'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
             'Content-Type': 'application/json'
          }
       });

       // OpenRouter returns the image URL in the content if successful
       const content = response.data.choices[0].message.content;
       return content.includes('http') ? `![Generated Image](${content})` : content;
    }

    // 2. Specialized VIDEO Generation (via OpenRouter /videos)
    if (model.category === 'video') {
       const response = await axios.post('https://openrouter.ai/api/v1/videos', {
          model: model.routingKey || 'google/veo-3.1-lite',
          prompt: lastUserMsg,
          duration: 4,
          resolution: "720p",
          aspect_ratio: "16:9"
       }, {
          headers: {
             'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
             'Content-Type': 'application/json'
          }
       });

       const job = response.data;
       return `🎥 **VIDEO JOB SUBMITTED**\n\n**Job ID**: ${job.id}\n**Status**: ${job.status}\n**Model**: ${model.name}\n\n*Video synthesis is asynchronous. You will be notified in the SmartGen Suite upon completion.*`;
    }

    // 3. TEXT / CODING Generation (Groq/OpenRouter)
    if (model.routingKey && (model.routingKey.includes('llama') || model.routingKey.includes('gemma') || model.routingKey.includes('mistral'))) {
       const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: model.routingKey,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
       }, {
          headers: {
             'Authorization': `Bearer ${GROQ_API_KEY}`,
             'Content-Type': 'application/json'
          }
       });
       return response.data.choices[0].message.content;
    } else {
       const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model.routingKey || 'openai/gpt-3.5-turbo',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
       }, {
          headers: {
             'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
             'Content-Type': 'application/json',
             'HTTP-Referer': 'https://ai-spatial-console.app',
             'X-Title': 'AI Spatial Console',
          }
       });
       return response.data.choices[0].message.content;
    }
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    return "Error: Could not reach the model server. Check your connectivity and API keys.";
  }
};

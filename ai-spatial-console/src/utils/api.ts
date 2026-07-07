import axios from 'axios';
import { ModelProvider, Message } from '../store/useAppStore';

// Safety: API keys should be provided via secure environment variables (.env)
// Never hardcode secrets in source code.
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || 'MISSING_KEY';
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || 'MISSING_KEY';

export const generateResponse = async (
  model: ModelProvider,
  messages: Message[]
): Promise<string> => {
  if (GROQ_API_KEY === 'MISSING_KEY' || OPENROUTER_API_KEY === 'MISSING_KEY') {
      return "Configuration Error: API Keys are missing in the environment.";
  }

  // Format messages for standard ChatCompletion API
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  try {
    if (model.routingKey && (model.routingKey.includes('llama') || model.routingKey.includes('gemma') || model.routingKey.includes('mistral'))) {
       const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: model.routingKey,
          messages: formattedMessages,
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
          messages: formattedMessages,
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
  } catch (error) {
    console.error('API Error:', error);
    return "Error: Could not reach the model server. Please try again.";
  }
};

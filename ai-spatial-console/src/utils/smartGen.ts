import { useAppStore } from '../store/useAppStore';
import { generateResponse } from './api';

const SYSTEM_PROMPT = `LOGICAL FRAMEWORK:
1. Micro window (8KB). Noise = subjective context that doesn't lead to action.
2. Pattern = foundational meaning (Memories, Tasks, Reminders).
3. If input contains a commitment or important detail, classify it.

Return ONLY a JSON object: {"type": "memory"|"task"|"reminder", "desc": "short summary"} or "NOISE".`;

export const processSmartGen = async (modelId: string, msgId: string, content: string) => {
   const { updateMessageEvent, availableModels, isSmartGenEnabled } = useAppStore.getState();

   if (!isSmartGenEnabled) return;

   try {
      const classifier = availableModels.find(m => m.id === 'llama-3-8b') || availableModels[0];
      const res = await generateResponse(classifier, [
         { role: 'system', content: SYSTEM_PROMPT, id: 'sys', timestamp: Date.now() },
         { role: 'user', content, id: 'user', timestamp: Date.now() }
      ]);

      if (res.includes('{')) {
         const match = res.match(/\{.*\}/);
         if (match) {
            const event = JSON.parse(match[0]);
            updateMessageEvent(modelId, msgId, { type: event.type, description: event.desc });
         }
      }
   } catch (e) {
      console.log('SmartGen classification failed');
   }
};

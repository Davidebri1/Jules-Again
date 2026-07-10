sed -i 's/activeModelIds: string\[\];/activeModelIdsByCategory: Record<ModelCategory, string\[\]>;/g' ai-spatial-console/src/store/useAppStore.ts
sed -i "s/activeModelIds: \['gpt-4o', 'claude-3-5-sonnet', 'gemini-1-5-pro', 'llama-3-8b'\],/activeModelIdsByCategory: { general: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1-5-pro', 'llama-3-8b'], image: [], video: [], audio: [], coding: [] },/g" ai-spatial-console/src/store/useAppStore.ts
sed -i "s/activeModelIds: \[\]/activeModelIdsByCategory: { general: [], image: [], video: [], audio: [], coding: [] }/g" ai-spatial-console/src/store/useAppStore.ts

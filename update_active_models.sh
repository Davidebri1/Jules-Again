sed -i 's/activeModelIds: string\[\]/activeModelIdsByCategory: Record<ModelCategory, string\[\]>/g' ai-spatial-console/src/store/useAppStore.ts

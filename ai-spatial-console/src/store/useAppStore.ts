import { create } from 'zustand';

export type GridLayout = '1x1' | '2x2' | '3x3';

export interface ModelProvider {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'other';
  tier: 'free' | 'pro' | 'elite';
  category: 'general' | 'image' | 'video' | 'music' | 'coding';
  description?: string;
}

export interface AppState {
  activeLayout: GridLayout;
  setActiveLayout: (layout: GridLayout) => void;
  activeModels: ModelProvider[];
  addActiveModel: (model: ModelProvider) => void;
  removeActiveModel: (modelId: string) => void;
  clearActiveModels: () => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeLayout: '2x2',
  setActiveLayout: (layout) => set({ activeLayout: layout }),
  activeModels: [
    { id: 'gpt-4o', name: 'ChatGPT', provider: 'openai', tier: 'pro', category: 'general' },
    { id: 'claude-3.5-sonnet', name: 'Claude', provider: 'anthropic', tier: 'pro', category: 'general' },
  ], // Start with some defaults
  addActiveModel: (model) =>
    set((state) => ({ activeModels: [...state.activeModels, model] })),
  removeActiveModel: (id) =>
    set((state) => ({
      activeModels: state.activeModels.filter((m) => m.id !== id),
    })),
  clearActiveModels: () => set({ activeModels: [] }),
  selectedTab: 'general',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
}));

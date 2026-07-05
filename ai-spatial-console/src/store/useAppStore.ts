import { create } from 'zustand';

export type GridLayout = '1x1' | '2x2' | '3x3';
export type ModelCategory = 'general' | 'image' | 'video' | 'music' | 'coding';

export interface ModelProvider {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'other';
  tier: 'free' | 'pro' | 'elite';
  category: ModelCategory;
  description?: string;
}

export interface AppState {
  activeLayout: GridLayout;
  setActiveLayout: (layout: GridLayout) => void;
  activeModels: ModelProvider[];
  addActiveModel: (model: ModelProvider) => void;
  removeActiveModel: (modelId: string) => void;
  clearActiveModels: () => void;
  selectedTab: ModelCategory;
  setSelectedTab: (tab: ModelCategory) => void;
  focusedModelId: string | null;
  setFocusedModelId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeLayout: '2x2',
  setActiveLayout: (layout) => set({ activeLayout: layout }),
  activeModels: [
    { id: 'gpt-4o', name: 'ChatGPT', provider: 'openai', tier: 'pro', category: 'general', description: 'Advanced reasoning and generation.' },
    { id: 'claude-3.5-sonnet', name: 'Claude', provider: 'anthropic', tier: 'pro', category: 'general', description: 'Expert coding and writing.' },
    { id: 'gemini-1.5-pro', name: 'Gemini', provider: 'google', tier: 'pro', category: 'general', description: 'Multimodal capabilities.' },
  ],
  addActiveModel: (model) =>
    set((state) => ({ activeModels: [...state.activeModels, model] })),
  removeActiveModel: (id) =>
    set((state) => ({
      activeModels: state.activeModels.filter((m) => m.id !== id),
    })),
  clearActiveModels: () => set({ activeModels: [] }),
  selectedTab: 'general',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  focusedModelId: null,
  setFocusedModelId: (id) => set({ focusedModelId: id }),
}));

import { create } from 'zustand';

export type GridLayout = '1x1' | '2x2' | '3x3';
export type ModelCategory = 'general' | 'image' | 'video' | 'music' | 'coding';
export type ModelTier = 'free' | 'pro' | 'elite';

export interface ModelProvider {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'meta' | 'mistral' | 'other';
  tier: ModelTier;
  category: ModelCategory;
  description: string;
  routingKey?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface AppState {
  // Layout & Core UI
  activeLayout: GridLayout;
  setActiveLayout: (layout: GridLayout) => void;
  currentThemeId: string;
  setCurrentThemeId: (id: string) => void;

  // Models
  availableModels: ModelProvider[];
  activeModelIds: string[];
  toggleActiveModel: (modelId: string) => void;
  selectedTab: ModelCategory;
  setSelectedTab: (tab: ModelCategory) => void;
  focusedModelId: string | null;
  setFocusedModelId: (id: string | null) => void;

  // Conversations
  conversations: Record<string, Conversation>;
  addMessage: (modelId: string, role: 'user' | 'assistant', content: string) => void;
  clearConversation: (modelId: string) => void;

  // Drawers & Panels
  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
  isConsensusOpen: boolean;
  setConsensusOpen: (isOpen: boolean) => void;
  isSmartGenOpen: boolean;
  setSmartGenOpen: (isOpen: boolean) => void;
}

const INITIAL_MODELS: ModelProvider[] = [
  // GENERAL
  { id: 'llama-3-8b', name: 'LLaMA 3 (8B)', provider: 'meta', tier: 'free', category: 'general', description: 'Fast, capable general tasks.', routingKey: 'llama3-8b-8192' },
  { id: 'gemma-7b', name: 'Gemma 7B', provider: 'google', tier: 'free', category: 'general', description: 'Google lightweight model.', routingKey: 'gemma-7b-it' },
  { id: 'mistral-7b', name: 'Mistral 7B', provider: 'mistral', tier: 'free', category: 'general', description: 'Solid foundational model.', routingKey: 'mistralai/mistral-7b-instruct:free' },
  { id: 'zephyr-7b', name: 'Zephyr 7B', provider: 'other', tier: 'free', category: 'general', description: 'Helpful assistant.', routingKey: 'huggingfaceh4/zephyr-7b-beta:free' },
  { id: 'phi-3-mini', name: 'Phi-3 Mini', provider: 'other', tier: 'free', category: 'general', description: 'Microsoft small model.', routingKey: 'microsoft/phi-3-mini-128k-instruct:free' },
  { id: 'openchat-3.5', name: 'OpenChat 3.5', provider: 'other', tier: 'free', category: 'general', description: 'Open source chat model.', routingKey: 'openchat/openchat-7b:free' },

  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', tier: 'pro', category: 'general', description: 'OpenAI flagship model.', routingKey: 'openai/gpt-4o' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', tier: 'pro', category: 'general', description: 'Anthropic expert model.', routingKey: 'anthropic/claude-3.5-sonnet' },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'google', tier: 'pro', category: 'general', description: 'Google multimodal expert.', routingKey: 'google/gemini-1.5-pro' },
  { id: 'grok-1-5', name: 'Grok 1.5', provider: 'xai', tier: 'pro', category: 'general', description: 'xAI advanced model.', routingKey: 'x-ai/grok-2' },

  // IMAGE
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'openai', tier: 'elite', category: 'image', description: 'Premium image generation.' },
  { id: 'flux-schnell', name: 'Flux Schnell', provider: 'other', tier: 'pro', category: 'image', description: 'Fast image generation.' },

  // CODING
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', tier: 'elite', category: 'coding', description: 'Complex code synthesis.', routingKey: 'anthropic/claude-3-opus' },
  { id: 'wizardcoder', name: 'WizardCoder', provider: 'other', tier: 'pro', category: 'coding', description: 'Code specific model.' },
];

export const useAppStore = create<AppState>((set) => ({
  activeLayout: '2x2',
  setActiveLayout: (layout) => set({ activeLayout: layout }),
  currentThemeId: 'dark-obsidian',
  setCurrentThemeId: (id) => set({ currentThemeId: id }),

  availableModels: INITIAL_MODELS,
  activeModelIds: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1-5-pro', 'llama-3-8b'],
  toggleActiveModel: (id) => set((state) => {
    if (state.activeModelIds.includes(id)) {
      return { activeModelIds: state.activeModelIds.filter(m => m !== id) };
    }
    return { activeModelIds: [...state.activeModelIds, id] };
  }),

  selectedTab: 'general',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  focusedModelId: null,
  setFocusedModelId: (id) => set({ focusedModelId: id }),

  conversations: {},
  addMessage: (modelId, role, content) => set((state) => {
    const convo = state.conversations[modelId] || { id: modelId, title: 'New Conversation', messages: [], updatedAt: Date.now() };
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role,
      content,
      timestamp: Date.now()
    };
    return {
      conversations: {
        ...state.conversations,
        [modelId]: {
          ...convo,
          messages: [...convo.messages, newMessage],
          updatedAt: Date.now()
        }
      }
    };
  }),
  clearConversation: (modelId) => set((state) => ({
    conversations: {
      ...state.conversations,
      [modelId]: { id: modelId, title: 'New Conversation', messages: [], updatedAt: Date.now() }
    }
  })),

  isSettingsOpen: false,
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  isConsensusOpen: false,
  setConsensusOpen: (isOpen) => set({ isConsensusOpen: isOpen }),
  isSmartGenOpen: false,
  setSmartGenOpen: (isOpen) => set({ isSmartGenOpen: isOpen }),
}));

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GridLayout = '1x1' | '2x2' | '3x3';
export type ModelCategory = 'general' | 'image' | 'video' | 'audio' | 'coding';
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
  modelId: string;
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface AppState {
  // Layout & Core UI (Persisted)
  activeLayout: GridLayout;
  setActiveLayout: (layout: GridLayout) => void;
  currentThemeId: string;
  setCurrentThemeId: (id: string) => void;

  // Models (Partially persisted, e.g., active models)
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
  isHistoryOpen: boolean;
  setHistoryOpen: (isOpen: boolean) => void;
  archivedConversations: Conversation[];
  archiveConversation: (modelId: string) => void;
  isUpgradeOpen: boolean;
  setUpgradeOpen: (isOpen: boolean) => void;
  setSmartGenOpen: (isOpen: boolean) => void;
}

const INITIAL_MODELS: ModelProvider[] = [
  // ================= GENERAL =================
  // Free (Minimum 6 required)
  { id: 'llama-3-8b', name: 'LLaMA 3 8B', provider: 'meta', tier: 'free', category: 'general', description: 'Fast, capable general tasks.', routingKey: 'llama3-8b-8192' },
  { id: 'gemma-7b', name: 'Gemma 7B', provider: 'google', tier: 'free', category: 'general', description: 'Google lightweight model.', routingKey: 'gemma-7b-it' },
  { id: 'mistral-7b', name: 'Mistral 7B', provider: 'mistral', tier: 'free', category: 'general', description: 'Solid foundational model.', routingKey: 'mistralai/mistral-7b-instruct:free' },
  { id: 'zephyr-7b', name: 'Zephyr 7B', provider: 'other', tier: 'free', category: 'general', description: 'Helpful assistant.', routingKey: 'huggingfaceh4/zephyr-7b-beta:free' },
  { id: 'phi-3-mini', name: 'Phi-3 Mini', provider: 'other', tier: 'free', category: 'general', description: 'Microsoft small model.', routingKey: 'microsoft/phi-3-mini-128k-instruct:free' },
  { id: 'openchat-3.5', name: 'OpenChat 3.5', provider: 'other', tier: 'free', category: 'general', description: 'Open source chat model.', routingKey: 'openchat/openchat-7b:free' },
  // Pro/Elite
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', tier: 'pro', category: 'general', description: 'OpenAI flagship model.', routingKey: 'openai/gpt-4o' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', tier: 'pro', category: 'general', description: 'Anthropic expert model.', routingKey: 'anthropic/claude-3.5-sonnet' },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'google', tier: 'pro', category: 'general', description: 'Google multimodal expert.', routingKey: 'google/gemini-1.5-pro' },
  { id: 'grok-1-5', name: 'Grok 1.5', provider: 'xai', tier: 'pro', category: 'general', description: 'xAI advanced model.', routingKey: 'x-ai/grok-2' },

  // ================= IMAGE (Minimum 6 required) =================
  { id: 'flux-schnell', name: 'Flux Schnell', provider: 'other', tier: 'pro', category: 'image', description: 'Fast image generation.', routingKey: 'black-forest-labs/flux-schnell' },
  { id: 'flux-pro', name: 'Flux Pro', provider: 'other', tier: 'elite', category: 'image', description: 'Premium Flux model.', routingKey: 'black-forest-labs/flux-pro' },
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'openai', tier: 'elite', category: 'image', description: 'OpenAI Premium image generation.' },
  { id: 'midjourney-v6', name: 'Midjourney v6', provider: 'other', tier: 'elite', category: 'image', description: 'Highly artistic generations.' },
  { id: 'sdxl', name: 'SDXL', provider: 'other', tier: 'pro', category: 'image', description: 'Stable Diffusion XL.', routingKey: 'stability-ai/sdxl' },
  { id: 'ideogram', name: 'Ideogram', provider: 'other', tier: 'pro', category: 'image', description: 'Excellent at text rendering.' },

  // ================= VIDEO (Minimum 6 required) =================
  { id: 'sora', name: 'Sora', provider: 'openai', tier: 'elite', category: 'video', description: 'OpenAI video generation.' },
  { id: 'runway-gen3', name: 'Runway Gen-3', provider: 'other', tier: 'elite', category: 'video', description: 'High fidelity video synthesis.' },
  { id: 'kling', name: 'Kling AI', provider: 'other', tier: 'elite', category: 'video', description: 'Advanced physics video.' },
  { id: 'luma-dream-machine', name: 'Luma Dream', provider: 'other', tier: 'pro', category: 'video', description: 'Fast video generation.' },
  { id: 'haiper-v1', name: 'Haiper V1', provider: 'other', tier: 'pro', category: 'video', description: 'Creative video models.' },
  { id: 'pika-labs', name: 'Pika', provider: 'other', tier: 'pro', category: 'video', description: 'Animation and video.' },

  // ================= AUDIO (Minimum 6 required) =================
  { id: 'suno-v3', name: 'Suno v3', provider: 'other', tier: 'elite', category: 'audio', description: 'Full song generation.' },
  { id: 'udio', name: 'Udio', provider: 'other', tier: 'elite', category: 'audio', description: 'High fidelity music tracks.' },
  { id: 'elevenlabs', name: 'ElevenLabs', provider: 'other', tier: 'pro', category: 'audio', description: 'Premium voice synthesis.' },
  { id: 'stable-audio', name: 'Stable Audio', provider: 'other', tier: 'pro', category: 'audio', description: 'Instrumentals and SFX.' },
  { id: 'musicgen', name: 'MusicGen', provider: 'meta', tier: 'pro', category: 'audio', description: 'Meta audio synthesis.' },
  { id: 'openai-tts', name: 'OpenAI TTS', provider: 'openai', tier: 'pro', category: 'audio', description: 'Text to speech.' },

  // ================= CODING (Minimum 6 required) =================
  { id: 'claude-3-5-sonnet-code', name: 'Claude Sonnet', provider: 'anthropic', tier: 'pro', category: 'coding', description: 'Industry leading code logic.', routingKey: 'anthropic/claude-3.5-sonnet' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', tier: 'elite', category: 'coding', description: 'Complex code synthesis.', routingKey: 'anthropic/claude-3-opus' },
  { id: 'gpt-4o-code', name: 'GPT-4o', provider: 'openai', tier: 'pro', category: 'coding', description: 'Strong multi-file reasoning.', routingKey: 'openai/gpt-4o' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'other', tier: 'pro', category: 'coding', description: 'Specialized coding model.', routingKey: 'deepseek/deepseek-coder' },
  { id: 'wizardcoder', name: 'WizardCoder', provider: 'other', tier: 'pro', category: 'coding', description: 'Open weights code model.' },
  { id: 'phind-codellama', name: 'Phind CodeLlama', provider: 'other', tier: 'pro', category: 'coding', description: 'Search and code.' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Default state
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
        // Logic to trigger upgrade page if trying to use locked models
        // Mocking user as 'free' tier for now.
        const model = state.availableModels.find(m => m.id === id);
        if (model && (model.tier === 'pro' || model.tier === 'elite')) {
           // User is not upgraded, trigger upgrade modal instead of adding
           return { isUpgradeOpen: true };
        }
        return { activeModelIds: [...state.activeModelIds, id] };
      }),

      selectedTab: 'general',
      setSelectedTab: (tab) => set({ selectedTab: tab }),

      focusedModelId: null,
      setFocusedModelId: (id) => set({ focusedModelId: id }),

      conversations: {},
      addMessage: (modelId, role, content) => set((state) => {
        const convo = state.conversations[modelId] || { id: modelId, modelId, title: 'New Conversation', messages: [], updatedAt: Date.now() };
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
          [modelId]: { id: modelId, modelId, title: 'New Conversation', messages: [], updatedAt: Date.now() }
        }
      })),

      isSettingsOpen: false,
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      isConsensusOpen: false,
      setConsensusOpen: (isOpen) => set({ isConsensusOpen: isOpen }),
      isSmartGenOpen: false,
      isHistoryOpen: false,
      setHistoryOpen: (isOpen) => set({ isHistoryOpen: isOpen }),
      archivedConversations: [],
      archiveConversation: (modelId) => set((state) => {
        const convo = state.conversations[modelId];
        if (!convo || convo.messages.length === 0) return state;
        return {
          archivedConversations: [convo, ...state.archivedConversations],
          conversations: {
            ...state.conversations,
            [modelId]: { id: modelId, modelId, title: "New Conversation", messages: [], updatedAt: Date.now() }
          }
        };
      }),
      setSmartGenOpen: (isOpen) => set({ isSmartGenOpen: isOpen }),
      isUpgradeOpen: false,
      setUpgradeOpen: (isOpen) => set({ isUpgradeOpen: isOpen }),
    }),
    {
      name: 'spatial-console-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
      // We only want to persist certain things
      partialize: (state) => ({
        activeLayout: state.activeLayout,
        currentThemeId: state.currentThemeId,
        activeModelIds: state.activeModelIds, archivedConversations: state.archivedConversations,
        conversations: state.conversations,
      }),
    }
  )
);

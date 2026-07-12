import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ModelCategory = 'general' | 'image' | 'video' | 'music' | 'coding';
export type UserTier = 'free' | 'pro' | 'elite';
export type ModelTier = 'free' | 'pro' | 'elite';
export type GridLayout = '1x1' | '2x2' | '3x3';

export interface ModelProvider {
  id: string;
  name: string;
  provider: string;
  tier: ModelTier;
  category: ModelCategory;
  description: string;
  routingKey?: string;
  baseCreditCost: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  smartGenEvent?: {
    type: 'memory' | 'task' | 'reminder' | 'artifact';
    description: string;
  };
}

export interface Conversation {
  id: string;
  modelId: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface StoredFile {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
  category: 'uploaded' | 'generated' | 'collection';
}

interface AppState {
  userProfile: {
    tier: UserTier;
    credits: number;
    messageCount: number;
    lastDailyReset: number;
  };
  checkAndResetDaily: () => void;
  deductMessage: () => boolean;
  deductCredits: (amount: number) => boolean;
  refundCredits: (amount: number) => void;
  setUserTier: (tier: UserTier) => void;

  activeLayout: GridLayout;
  setActiveLayout: (layout: GridLayout) => void;

  themes: { id: string; name: string; uri: any; type: 'image' | 'video' }[];
  currentThemeId: string;
  setCurrentThemeId: (id: string) => void;
  addTheme: (theme: any) => void;

  availableModels: ModelProvider[];
  activeModelIdsByTab: Record<ModelCategory, string[]>;
  toggleActiveModel: (id: string) => void;

  selectedTab: ModelCategory;
  setSelectedTab: (tab: ModelCategory) => void;

  focusedModelId: string | null;
  setFocusedModelId: (id: string | null) => void;

  conversations: Record<string, Conversation>;
  addMessage: (modelId: string, role: 'user' | 'assistant', content: string) => string;
  updateMessageEvent: (modelId: string, msgId: string, event: Message['smartGenEvent']) => void;
  clearConversation: (modelId: string) => void;

  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
  isConsensusOpen: boolean;
  setConsensusOpen: (isOpen: boolean) => void;
  isSmartGenOpen: boolean;
  setSmartGenOpen: (isOpen: boolean) => void;
  isHistoryOpen: boolean;
  setHistoryOpen: (isOpen: boolean) => void;
  archivedConversations: Conversation[];
  archiveConversation: (modelId: string) => void;

  isUpgradeOpen: boolean;
  setUpgradeOpen: (isOpen: boolean) => void;
  isMarketplaceOpen: boolean;
  setMarketplaceOpen: (isOpen: boolean) => void;
  marketCategory: string;
  setMarketCategory: (cat: string) => void;

  pendingContextFiles: StoredFile[];
  pendingSourceFile: StoredFile | null;
  addContextFile: (file: StoredFile) => void;
  removeContextFile: (id: string) => void;
  setSourceFile: (file: StoredFile | null) => void;
  clearPendingAttachments: () => void;
  starredFiles: string[];
  toggleStarFile: (id: string) => void;
  isFileManagerOpen: boolean;
  setFileManagerOpen: (isOpen: boolean) => void;

  isAuthOpen: boolean;
  setAuthOpen: (isOpen: boolean) => void;
  isAuthenticated: boolean;
  setAuthenticated: (isAuth: boolean) => void;
  isPrivateMode: boolean;
  setPrivateMode: (isPrivate: boolean) => void;
  isSmartGenEnabled: boolean;
  setSmartGenEnabled: (enabled: boolean) => void;
  accountId: string | null;
  login: (accountId: string) => void;
  logout: () => void;

  files: StoredFile[];
  setFiles: (update: StoredFile[] | ((prev: StoredFile[]) => StoredFile[])) => void;
}

const INITIAL_MODELS: ModelProvider[] = [
  // ================= GENERAL =================
  { id: 'llama-3-8b', name: 'LLaMA 3.1 8B', provider: 'meta', tier: 'free', category: 'general', description: 'Fast, capable general tasks.', routingKey: 'llama-3.1-8b-instant', baseCreditCost: 0 },
  { id: 'gemma-7b', name: 'Gemma 7B', provider: 'google', tier: 'free', category: 'general', description: 'Google lightweight model.', routingKey: 'gemma-7b-it', baseCreditCost: 0 },
  { id: 'mistral-7b', name: 'Mistral 7B', provider: 'mistral', tier: 'free', category: 'general', description: 'Solid foundational model.', routingKey: 'mistralai/mistral-7b-instruct:free', baseCreditCost: 0 },
  { id: 'zephyr-7b', name: 'Zephyr 7B', provider: 'other', tier: 'free', category: 'general', description: 'Helpful assistant.', routingKey: 'huggingfaceh4/zephyr-7b-beta:free', baseCreditCost: 0 },
  { id: 'phi-3-mini', name: 'Phi-3 Mini', provider: 'other', tier: 'free', category: 'general', description: 'Microsoft small model.', routingKey: 'microsoft/phi-3-mini-128k-instruct:free', baseCreditCost: 0 },
  { id: 'openchat-3.5', name: 'OpenChat 3.5', provider: 'other', tier: 'free', category: 'general', description: 'Open source chat model.', routingKey: 'openchat/openchat-7b:free', baseCreditCost: 0 },
  { id: 'gpt-4o', name: 'GPT-4o (via OpenRouter)', provider: 'openai', tier: 'pro', category: 'general', description: 'OpenAI flagship model.', routingKey: 'openai/gpt-4o', baseCreditCost: 0 },
  { id: 'claude-3-5-sonnet-gen', name: 'Claude 3.5 (via OpenRouter)', provider: 'anthropic', tier: 'pro', category: 'general', description: 'Anthropic expert model.', routingKey: 'anthropic/claude-3.5-sonnet', baseCreditCost: 0 },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'google', tier: 'pro', category: 'general', description: 'Google multimodal expert.', routingKey: 'google/gemini-1.5-pro', baseCreditCost: 0 },
  { id: 'grok-1-5', name: 'Grok 1.5', provider: 'xai', tier: 'pro', category: 'general', description: 'xAI advanced model.', routingKey: 'x-ai/grok-2', baseCreditCost: 0 },

  // ================= IMAGE =================
  { id: 'flux-schnell', name: 'Flux Schnell', provider: 'other', tier: 'pro', category: 'image', description: 'Fast image generation.', routingKey: 'black-forest-labs/flux-schnell', baseCreditCost: 5 },
  { id: 'sdxl', name: 'SDXL', provider: 'other', tier: 'pro', category: 'image', description: 'Stable Diffusion XL.', routingKey: 'stability-ai/sdxl', baseCreditCost: 5 },
  { id: 'ideogram', name: 'Ideogram', provider: 'other', tier: 'pro', category: 'image', description: 'Typography focused images.', baseCreditCost: 5 },
  { id: 'flux-pro', name: 'Flux Pro', provider: 'other', tier: 'elite', category: 'image', description: 'Premium Flux model.', routingKey: 'black-forest-labs/flux-pro', baseCreditCost: 15 },
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'openai', tier: 'elite', category: 'image', description: 'OpenAI Premium image.', baseCreditCost: 20 },
  { id: 'midjourney-v6', name: 'Midjourney v6', provider: 'other', tier: 'elite', category: 'image', description: 'Artistic high fidelity.', baseCreditCost: 25 },

  // ================= VIDEO =================
  { id: 'luma-dream-machine', name: 'Luma Dream', provider: 'other', tier: 'pro', category: 'video', description: 'Fast video generation.', baseCreditCost: 30 },
  { id: 'haiper-v1', name: 'Haiper V1', provider: 'other', tier: 'pro', category: 'video', description: 'Creative video synthesis.', baseCreditCost: 30 },
  { id: 'pika', name: 'Pika', provider: 'other', tier: 'pro', category: 'video', description: 'Animation specialist.', baseCreditCost: 30 },
  { id: 'sora', name: 'Sora', provider: 'openai', tier: 'elite', category: 'video', description: 'OpenAI video generation.', baseCreditCost: 100 },
  { id: 'runway-gen3', name: 'Runway Gen-3', provider: 'other', tier: 'elite', category: 'video', description: 'High fidelity video synthesis.', baseCreditCost: 100 },
  { id: 'kling-ai', name: 'Kling AI', provider: 'other', tier: 'elite', category: 'video', description: 'Advanced physics video.', baseCreditCost: 100 },

  // ================= MUSIC =================
  { id: 'elevenlabs', name: 'ElevenLabs', provider: 'other', tier: 'pro', category: 'music', description: 'Premium voice synthesis.', baseCreditCost: 10 },
  { id: 'musicgen', name: 'MusicGen', provider: 'meta', tier: 'pro', category: 'music', description: 'Meta music foundation.', baseCreditCost: 10 },
  { id: 'openai-tts', name: 'OpenAI TTS', provider: 'openai', tier: 'pro', category: 'music', description: 'Natural speech synthesis.', baseCreditCost: 5 },
  { id: 'suno-v3', name: 'Suno v3', provider: 'other', tier: 'elite', category: 'music', description: 'Full song generation.', baseCreditCost: 50 },
  { id: 'udio', name: 'Udio', provider: 'other', tier: 'elite', category: 'music', description: 'High fidelity music tracks.', baseCreditCost: 60 },
  { id: 'stable-audio', name: 'Stable Audio', provider: 'other', tier: 'elite', category: 'music', description: 'High quality audio clips.', baseCreditCost: 40 },

  // ================= CODING =================
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'other', tier: 'pro', category: 'coding', description: 'Specialized coding model.', routingKey: 'deepseek/deepseek-coder', baseCreditCost: 5 },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 (via OpenRouter)', provider: 'anthropic', tier: 'pro', category: 'coding', description: 'Anthropic coding expert.', routingKey: 'anthropic/claude-3.5-sonnet', baseCreditCost: 5 },
  { id: 'gpt-4o-coding', name: 'GPT-4o (via OpenRouter) (Coding)', provider: 'openai', tier: 'pro', category: 'coding', description: 'OpenAI reasoning model.', routingKey: 'openai/gpt-4o', baseCreditCost: 5 },
  { id: 'phind-codellama', name: 'Phind CodeLlama', provider: 'other', tier: 'pro', category: 'coding', description: 'Search-focused coding.', baseCreditCost: 5 },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', tier: 'elite', category: 'coding', description: 'Complex code synthesis.', routingKey: 'anthropic/claude-3-opus', baseCreditCost: 20 },
  { id: 'wizardcoder', name: 'WizardCoder', provider: 'other', tier: 'elite', category: 'coding', description: 'Advanced instruction following.', baseCreditCost: 15 },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userProfile: { tier: 'free', credits: 150, messageCount: 0, lastDailyReset: Date.now() },

      checkAndResetDaily: () => {
         const { userProfile } = get();
         const now = Date.now();
         const oneDay = 24 * 60 * 60 * 1000;
         if (now - userProfile.lastDailyReset > oneDay) {
            let dailyCredits = 0;
            if (userProfile.tier === 'pro') dailyCredits = 500;
            if (userProfile.tier === 'elite') dailyCredits = 2000;

            set({ userProfile: {
               ...userProfile,
               messageCount: 0,
               credits: userProfile.credits + dailyCredits,
               lastDailyReset: now
            }});
         }
      },

      deductMessage: () => {
         const { userProfile } = get();
         if (userProfile.tier !== 'free') return true;
         if (userProfile.messageCount < 10) {
            set({ userProfile: { ...userProfile, messageCount: userProfile.messageCount + 1 } });
            return true;
         }
         return false;
      },

      deductCredits: (amount) => {
         const { userProfile } = get();
         if (userProfile.credits >= amount) {
            set({ userProfile: { ...userProfile, credits: userProfile.credits - amount } });
            return true;
         }
         return false;
      },

      refundCredits: (amount) => {
         set((state) => ({ userProfile: { ...state.userProfile, credits: state.userProfile.credits + amount } }));
      },

      setUserTier: (tier) => {
         let initialCredits = 150;
         if (tier === 'pro') initialCredits = 1000;
         if (tier === 'elite') initialCredits = 5000;
         set({ userProfile: { tier, credits: initialCredits, messageCount: 0, lastDailyReset: Date.now() } });
      },

      activeLayout: '2x2',
      setActiveLayout: (layout) => set({ activeLayout: layout }),

      themes: [
        { id: 'dark-obsidian', name: 'Obsidian', uri: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2940&auto=format&fit=crop', type: 'image' },
        { id: 'slate-frost', name: 'Slate Frost', uri: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop', type: 'image' },
        { id: 'neon-dusk', name: 'Neon Dusk', uri: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2940&auto=format&fit=crop', type: 'image' },
        { id: 'alley3', name: 'Alley 3', uri: require('../../assets/themes/alley3.jpg'), type: 'image' },
        { id: 'alley4', name: 'Alley 4', uri: require('../../assets/themes/alley4.jpg'), type: 'image' },
        { id: 'blade', name: 'Blade', uri: require('../../assets/themes/blade.jpg'), type: 'image' },
        { id: 'cabin', name: 'Cabin', uri: require('../../assets/themes/cabin.jpg'), type: 'image' },
        { id: 'deck', name: 'Deck', uri: require('../../assets/themes/deck.jpg'), type: 'image' },
        { id: 'dunehall', name: 'Dune Hall', uri: require('../../assets/themes/dunehall.jpg'), type: 'image' },
        { id: 'garden', name: 'Garden', uri: require('../../assets/themes/garden.jpg'), type: 'image' },
        { id: 'neoncity', name: 'Neon City', uri: require('../../assets/themes/neoncity.jpg'), type: 'image' },
        { id: 'observatory', name: 'Observatory', uri: require('../../assets/themes/observatory.jpg'), type: 'image' },
        { id: 'ocean', name: 'Ocean', uri: require('../../assets/themes/ocean.jpg'), type: 'image' },
        { id: 'rainfall', name: 'Rainfall', uri: require('../../assets/themes/rainfall.jpg'), type: 'image' },
        { id: 'sanctuary', name: 'Sanctuary', uri: require('../../assets/themes/sanctuary.jpg'), type: 'image' },
        { id: 'starbridge', name: 'Starbridge', uri: require('../../assets/themes/starbridge.jpg'), type: 'image' },
        { id: 'transit', name: 'Transit', uri: require('../../assets/themes/transit.jpg'), type: 'image' },
        { id: 'twilight', name: 'Twilight', uri: require('../../assets/themes/twilight.jpg'), type: 'image' },
        { id: 'twinsuns', name: 'Twin Suns', uri: require('../../assets/themes/twinsuns.jpg'), type: 'image' },
      ],
      currentThemeId: 'dark-obsidian',
      setCurrentThemeId: (id) => set({ currentThemeId: id }),
      addTheme: (theme) => set((state) => ({ themes: [...state.themes, theme] })),

      availableModels: INITIAL_MODELS,
      activeModelIdsByTab: { general: ['gpt-4o'], image: [], video: [], music: [], coding: [] },

      toggleActiveModel: (id) => set((state) => {
        const { selectedTab, activeModelIdsByTab, userProfile } = state;
        const currentActive = activeModelIdsByTab[selectedTab];

        if (currentActive.includes(id)) {
          return { activeModelIdsByTab: { ...activeModelIdsByTab, [selectedTab]: currentActive.filter(m => m !== id) } };
        }

        const model = state.availableModels.find(m => m.id === id);
        if (selectedTab !== 'general' && userProfile.tier === 'free') {
           return { isUpgradeOpen: true };
        }

        if (model) {
           if (model.tier === 'elite' && userProfile.tier !== 'elite') return { isUpgradeOpen: true };
           if (model.tier === 'pro' && userProfile.tier === 'free') return { isUpgradeOpen: true };
        }

        return { activeModelIdsByTab: { ...activeModelIdsByTab, [selectedTab]: [...currentActive, id] } };
      }),

      selectedTab: 'general',
      setSelectedTab: (tab) => set({ selectedTab: tab }),

      focusedModelId: null,
      setFocusedModelId: (id) => set({ focusedModelId: id }),

      conversations: {},
      addMessage: (modelId, role, content) => {
        const newId = Math.random().toString(36).substring(7);
        set((state) => {
            const convo = state.conversations[modelId] || { id: modelId, modelId, title: 'New Conversation', messages: [], updatedAt: Date.now() };
            const newMessage: Message = { id: newId, role, content, timestamp: Date.now() };
            return {
                conversations: {
                    ...state.conversations,
                    [modelId]: { ...convo, messages: [...convo.messages, newMessage], updatedAt: Date.now() }
                }
            };
        });
        return newId;
      },
      updateMessageEvent: (modelId: string, msgId: string, event: Message['smartGenEvent']) => set((state) => {
         const convo = state.conversations[modelId];
         if (!convo) return state;
         const updatedMessages = convo.messages.map(m => m.id === msgId ? { ...m, smartGenEvent: event } : m);
         return { conversations: { ...state.conversations, [modelId]: { ...convo, messages: updatedMessages } } };
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
      isMarketplaceOpen: false,
      setMarketplaceOpen: (isOpen) => set({ isMarketplaceOpen: isOpen }),
      marketCategory: 'All',
      setMarketCategory: (cat) => set({ marketCategory: cat }),

      pendingContextFiles: [],
      pendingSourceFile: null,
      addContextFile: (file) => set((state) => ({ pendingContextFiles: state.pendingContextFiles.find(f => f.id === file.id) ? state.pendingContextFiles : [...state.pendingContextFiles, file] })),
      removeContextFile: (id) => set((state) => ({ pendingContextFiles: state.pendingContextFiles.filter(f => f.id !== id) })),
      setSourceFile: (file) => set({ pendingSourceFile: file }),
      clearPendingAttachments: () => set({ pendingContextFiles: [], pendingSourceFile: null }),
      starredFiles: [],
      toggleStarFile: (id) => set((state) => ({ starredFiles: state.starredFiles.includes(id) ? state.starredFiles.filter(fid => fid !== id) : [...state.starredFiles, id] })),
      isFileManagerOpen: false,
      setFileManagerOpen: (isOpen) => set({ isFileManagerOpen: isOpen }),
      isAuthOpen: false,
      setAuthOpen: (isOpen) => set({ isAuthOpen: isOpen }),
      isAuthenticated: false,
      setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
      isPrivateMode: false,
      isSmartGenEnabled: false,
      setSmartGenEnabled: (enabled) => set({ isSmartGenEnabled: enabled }),
      setPrivateMode: (isPrivate) => set({ isPrivateMode: isPrivate }),
      accountId: null,
      login: (accountId) => set({ isAuthenticated: true, accountId }),
      logout: () => set({
         isAuthenticated: false,
         accountId: null,
         userProfile: { tier: 'free', credits: 150, messageCount: 0, lastDailyReset: Date.now() },
         activeModelIdsByTab: { general: [], image: [], video: [], music: [], coding: [] },
         conversations: {},
         archivedConversations: [],
         pendingContextFiles: [],
         pendingSourceFile: null,
         files: [],
         starredFiles: []
      }),
      files: [],
      setFiles: (update) => set((state) => ({
         files: typeof update === 'function' ? update(state.files) : update
      })),
    }),
    {
      name: 'spatial-console-storage-rev2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userProfile: state.userProfile,
        accountId: state.accountId,
        activeLayout: state.activeLayout,
        currentThemeId: state.currentThemeId,
        isPrivateMode: state.isPrivateMode,
        isSmartGenEnabled: state.isSmartGenEnabled,
        files: state.isPrivateMode ? [] : state.files,
        starredFiles: state.starredFiles,
        activeModelIdsByTab: state.activeModelIdsByTab,
        archivedConversations: state.isPrivateMode ? [] : state.archivedConversations,
        conversations: state.isPrivateMode ? {} : state.conversations,
      }),
    }
  )
);

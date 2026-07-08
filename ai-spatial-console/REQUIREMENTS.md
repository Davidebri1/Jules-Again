# Spatial AI Console - Comprehensive Requirements

## Core Architecture
- **Framework**: React Native with Expo.
- **Rendering**: Hybrid architecture using `@react-three/fiber` and `@react-three/drei` for 3D spatial elements, and standard React Native components for 2D overlays (text, inputs).
- **State Management**: Zustand, integrated with `AsyncStorage` for persistence.
- **Styling**: AAA premium aesthetic, tactile intelligence, PBR materials, glassmorphism (`BlurView`), and physical light refraction simulation (`meshPhysicalMaterial`). No desktop hover states; touch-native first.

## Global State & Persistence
- Application state must persist account-wide (row selection, layouts, global settings).
- Context windows must be kept extremely small (1KB - 8KB max) to process data to meaning or noise without hoarding context, adhering strictly to the Logical Framework.

## Features & UI Components

### 1. Main Dashboard & Spatial Canvas (`App.tsx`, `ChatDashboard.tsx`, `GridOverlay.tsx`)
- **Background**: Dynamic background supporting images and live videos (via `expo-av`).
- **3D Canvas**: Renders physical, glowing cards for each active AI model in the background. Uses gyroscope data to affect lighting and physics-based animations (springs, mass, damping).
- **Grid System**: Users can toggle between 1x1, 2x2, and 3x3 layouts using the top navigation bar.
- **Model Tray**: An expanding tray (using FlexWrap, NOT a horizontal scrolling ticker) categorized by tabs (General, Image, Video, Audio, Coding).
- **Action Row**: Contains universal input bar, global send button, and "Collide" button to trigger the Consensus Engine.

### 2. Physical Cards (`PhysicalCard.tsx`)
- Renders as a 3D `RoundedBox` with a `meshPhysicalMaterial` for a translucent, refractive glass effect.
- Color-coded based on model provider (e.g., OpenAI = Green, Google = Blue).
- Displays model name, tier, and a truncated preview of the latest chat message.

### 3. Model Interactions (`CardDetailView.tsx`)
- When a physical card is tapped, it expands into a detailed view for direct interaction with that specific model.
- Contains the cognitive alignment filter that processes incoming data strictly according to the Natural Law framework.

### 4. Custom Themes & Settings (`SettingsPanel.tsx`)
- **Themes**: Allows switching between preset themes (Obsidian, Slate Frost, Neon Dusk).
- **Custom Uploads**: Users can upload custom images or videos via `expo-image-picker`.
- **Premium Gating**: Custom live video wallpapers are restricted to 'Pro' and 'Elite' tier users.
- Includes functional stubs for "Login/Register" (opens Auth), "Privacy & Security", and "View Plans" (opens Upgrade page).

### 5. Marketplace (`MarketplaceView.tsx`)
- A grid-based view to discover prompts, images, video, audio, and code snippets.
- Background must be a solid dark color to prevent UI clash.
- Categories (`All`, `General`, `Image`, `Video`, `Audio`, `Coding`) sync seamlessly with the main dashboard's active tab.
- Displays realistic mock artifacts with functional (stubbed) interaction buttons.

### 6. Consensus Engine (`ConsensusDrawer.tsx`)
- Triggered by the "Collide" button.
- Evaluates disagreement and consensus among the currently active models.
- Displays the synthesized consensus text in blue (`#4285F4`) without unnecessary headers.
- Dynamically maps dissenting models away from a "Consensus Center" node.

### 7. Ancillary Overlays
- **SmartGen Suite (`SmartGenSuiteView.tsx`)**: Tools for generating structured assets.
- **File Manager (`FileManagerView.tsx`)**: To manage context files and attachments.
- **Auth Overlay (`AuthOverlay.tsx`)**: Standard authentication UI.
- **Upgrade Page (`UpgradePage.tsx`)**: Subscription tier selection (Free, Pro, Elite).
- **History Drawer (`HistoryDrawer.tsx`)**: Access past conversations and generations.

## AI Models & Tiers
The application must offer at least 6 models per category:
- **General** (Includes at least 6 Free models: LLaMA 3.1 8B, Gemma 7B, Mistral 7B, Zephyr 7B, Phi-3 Mini, OpenChat 3.5. Pro/Elite: GPT-4o, Claude 3.5 Sonnet, etc.)
- **Image** (Flux Schnell, Flux Pro, DALL-E 3, Midjourney v6, SDXL, Ideogram)
- **Video** (Sora, Runway Gen-3, Kling AI, Luma Dream Machine, Haiper V1, Pika)
- **Audio** (Suno v3, Udio, ElevenLabs, Stable Audio, MusicGen, OpenAI TTS)
- **Coding** (Claude Sonnet, Claude 3 Opus, GPT-4o, DeepSeek Coder, WizardCoder, Phind CodeLlama)

## Security & Best Practices
- API keys must be securely loaded via environment variables (e.g., `EXPO_PUBLIC_GROQ_API_KEY`).
- No web app or PWA terminology; must be treated as a true native mobile app.

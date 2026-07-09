# Spatial Console - Basic Requirements

## App Purpose
Industry-Leading multi chat app to enhance the average user's day to day life by providing them an opportunity to quickly validate and quickly generate information. Must dethrone industry leaders with AAA premium 3D design and features.

## 3D Spatial Guidelines
* **Materiality:** Cards are physical objects with thickness. Use PBR materials (Brushed Metal, Matte Silicone, Frosted Glass).
* **Light & Shadow:** The UI reacts to a virtual directional light source (device gyroscope). Refractions shift based on tilt.
* **Depth Hierarchy:** Z-depth ranking. Active closer, idle pushed into bokeh.
* **Interaction:** Physics-based (mass, friction, damping). No linear animations.

## Core Views
1. **Global View (Grid View):**
   * Configurable viewport (1x1, 2x2, 3x3) horizontal scrolling.
   * Model Selector Tray: Color coded tabs (General, Image, Video, Music, Coding).
   * Tiers: Free, Pro, Elite.
   * Premium send box, new conversation, projects/tasks, search.
   * Collide/Consensus Engine button.

2. **Card Detail View (Exploded View):**
   * Premium message box (markdown, voice, upload, private).
   * Smart Gen Tools slide-out (Memories, Projects, Tasks, Reminders, Artifacts).
   * Local history navigation.

## Smart Gen Suite
* Auto-generated contextual tools.
* Editable, deletable, filterable.
* Include: Memories, Projects, Tasks, Reminders, Artifacts.

## The Consensus Drawer (Collide)
* Computes agreement fraction across models.
* Oversized metric (e.g. 9/12).
* Color-coded result.
* Spatial mapping of dissenting views based on agreement level.

## Aesthetics
* No clipart, no flat design, no "web app" utility feel.
* Theme switcher featuring premium illustrations full-bleed (no cropping).
* Fluid, subtle, physical animations.

## Market Offerings & Gating
* **Model Offerings:** Must encompass 'general', 'image', 'video', 'audio', and 'coding' categories, each containing at least 6 models.
* **Free Tier Rules:** The 'general' category must specifically include at least 6 free models.
* **Premium Assets:** Live video wallpapers and certain themes must be gated behind Pro or Elite subscriptions.

## Subscription Tiers & Credits
* **Free:** Access to basic models, standard UI, standard backgrounds. Limited messages.
* **Pro:** Access to advanced models, premium themes (including video), increased limits.
* **Elite:** Access to cutting-edge models (e.g. video generation, complex reasoning) and top-tier capabilities.

## Technical Architecture & State
* **Paradigm:** True native mobile app (no PWA or web app paradigms).
* **State Management:** Application state (row selection, layouts, global settings) must persist account-wide using Zustand's persist middleware integrated with AsyncStorage.
* **Security:** API keys must be securely loaded via environment variables (e.g., EXPO_PUBLIC_GROQ_API_KEY).

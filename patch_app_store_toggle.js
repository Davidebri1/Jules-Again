const fs = require('fs');
let content = fs.readFileSync('ai-spatial-console/src/store/useAppStore.ts', 'utf8');

const searchToggle = `      toggleActiveModel: (id) => set((state) => {
        if (state.activeModelIdsByCategory.includes(id)) {
          return { activeModelIdsByCategory: state.activeModelIdsByCategory.filter(m => m !== id) };
        }
        const model = state.availableModels.find(m => m.id === id);
        const userTier = state.userProfile.tier;

        // Enforce Monetization Gating
        if (model) {
           if (model.tier === 'elite' && userTier !== 'elite') {
              return { isUpgradeOpen: true };
           }
           if (model.tier === 'pro' && userTier === 'free') {
              return { isUpgradeOpen: true };
           }
        }
        return { activeModelIdsByCategory: [...state.activeModelIdsByCategory, id] };
      }),`;

const searchToggleFallback = `      toggleActiveModel: (id) => set((state) => {
        if (state.activeModelIds.includes(id)) {
          return { activeModelIds: state.activeModelIds.filter(m => m !== id) };
        }
        const model = state.availableModels.find(m => m.id === id);
        const userTier = state.userProfile.tier;

        // Enforce Monetization Gating
        if (model) {
           if (model.tier === 'elite' && userTier !== 'elite') {
              return { isUpgradeOpen: true };
           }
           if (model.tier === 'pro' && userTier === 'free') {
              return { isUpgradeOpen: true };
           }
        }
        return { activeModelIds: [...state.activeModelIds, id] };
      }),`;

const replaceToggle = `      toggleActiveModel: (id) => set((state) => {
        const cat = state.selectedTab;
        const currentActive = state.activeModelIdsByCategory[cat] || [];
        if (currentActive.includes(id)) {
          return { activeModelIdsByCategory: { ...state.activeModelIdsByCategory, [cat]: currentActive.filter(m => m !== id) } };
        }
        const model = state.availableModels.find(m => m.id === id);
        const userTier = state.userProfile.tier;

        // Enforce Monetization Gating
        if (model) {
           if (model.tier === 'elite' && userTier !== 'elite') {
              return { isUpgradeOpen: true };
           }
           if (model.tier === 'pro' && userTier === 'free') {
              return { isUpgradeOpen: true };
           }
        }
        return { activeModelIdsByCategory: { ...state.activeModelIdsByCategory, [cat]: [...currentActive, id] } };
      }),`;

if (content.includes(searchToggleFallback)) {
    content = content.replace(searchToggleFallback, replaceToggle);
    console.log("Replaced using fallback search");
} else if (content.includes(searchToggle)) {
    content = content.replace(searchToggle, replaceToggle);
    console.log("Replaced using exact search");
} else {
    // Try regex replace
    content = content.replace(/toggleActiveModel: \(id\) => set\(\(state\) => \{[\s\S]*?return \{ activeModelIds(?:ByCategory)?: \[\.\.\.state\.activeModelIds(?:ByCategory)?, id\] \};\n      \}\),/m, replaceToggle);
    console.log("Regex replace triggered.");
}

// Fix persist storage logic
content = content.replace(/activeModelIds: state\.activeModelIds/g, 'activeModelIdsByCategory: state.activeModelIdsByCategory');

fs.writeFileSync('ai-spatial-console/src/store/useAppStore.ts', content);

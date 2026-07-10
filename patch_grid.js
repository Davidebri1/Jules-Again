const fs = require('fs');
let content = fs.readFileSync('ai-spatial-console/src/components/GridOverlay.tsx', 'utf8');

content = content.replace(/activeModelIds,/g, 'activeModelIdsByCategory,');
content = content.replace(/activeModelIds\.length/g, '(activeModelIdsByCategory[selectedTab] || []).length');
content = content.replace(/activeModelIds\n/g, '(activeModelIdsByCategory[selectedTab] || [])\n');
content = content.replace(/const activeModels = activeModelIds/g, 'const activeModels = (activeModelIdsByCategory[selectedTab] || [])');
content = content.replace(/const isActive = activeModelIds\.includes/g, 'const isActive = (activeModelIdsByCategory[selectedTab] || []).includes');
content = content.replace(/activeModelIds\.forEach/g, '(activeModelIdsByCategory[selectedTab] || []).forEach');
content = content.replace(/activeModelIds\./g, '(activeModelIdsByCategory[selectedTab] || []).');

fs.writeFileSync('ai-spatial-console/src/components/GridOverlay.tsx', content);

let chatContent = fs.readFileSync('ai-spatial-console/src/components/ChatDashboard.tsx', 'utf8');
chatContent = chatContent.replace(/state\.activeModelIds/g, '(state.activeModelIdsByCategory[state.selectedTab] || [])');
fs.writeFileSync('ai-spatial-console/src/components/ChatDashboard.tsx', chatContent);

let consensusContent = fs.readFileSync('ai-spatial-console/src/components/ConsensusDrawer.tsx', 'utf8');
consensusContent = consensusContent.replace(/activeModelIds, /g, 'activeModelIdsByCategory, selectedTab, ');
consensusContent = consensusContent.replace(/activeModelIds\./g, '(activeModelIdsByCategory[selectedTab] || []).');
consensusContent = consensusContent.replace(/\[activeModelIds,/g, '[activeModelIdsByCategory, selectedTab,');
fs.writeFileSync('ai-spatial-console/src/components/ConsensusDrawer.tsx', consensusContent);

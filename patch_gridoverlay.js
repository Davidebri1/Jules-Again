const fs = require('fs');
const file = '/app/ai-spatial-console/src/components/GridOverlay.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update active style to use soft glowing colors based on tier or provider
content = content.replace(
  `                 let borderColor = 'rgba(255,255,255,0.3)';
                 if (model.tier === 'pro') borderColor = '#4285F4'; // Blue for pro
                 if (model.tier === 'elite') borderColor = '#d97757'; // Orange for elite
                 if (model.provider === 'openai') borderColor = '#10a37f'; // OpenAI Green override`,
  `              let borderColor = "rgba(255,255,255,0.3)";
              let bgColor = "rgba(0,0,0,0.3)";
              if (isActive) {
                if (model.tier === "pro") { bgColor = "rgba(66, 133, 244, 0.4)"; borderColor = "#4285F4"; }
                else if (model.tier === "elite") { bgColor = "rgba(217, 119, 87, 0.4)"; borderColor = "#d97757"; }
                else { bgColor = "rgba(16, 163, 127, 0.4)"; borderColor = "#10a37f"; }
              }`
);

content = content.replace(
  `backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',`,
  `backgroundColor: isActive ? bgColor : "rgba(0,0,0,0.3)",`
);

content = content.replace(
  `{model.name.substring(0, 8).toUpperCase()}`,
  `{model.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`
);

fs.writeFileSync(file, content);

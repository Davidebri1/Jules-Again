const fs = require('fs');
const file = '/app/ai-spatial-console/src/components/PhysicalCard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change card orientation to vertical
content = content.replace(`args={[3, 4, 0.2]} // Width, height, depth`, `args={[2.5, 4.5, 0.2]} // Vertical orientation`);

fs.writeFileSync(file, content);

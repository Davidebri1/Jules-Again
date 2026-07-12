const fs = require('fs');
let content = fs.readFileSync('ai-spatial-console/src/components/PhysicalCard.tsx', 'utf8');

content = content.replace(/import { RoundedBox, Text, MeshTransmissionMaterial } from '@react-three\/drei';/g, "import { RoundedBox, Text, MeshTransmissionMaterial, Html } from '@react-three/drei';");

const stateSearch = `  const [pressed, setPressed] = useState(false);`;
const stateReplace = `  const [pressed, setPressed] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);`;

content = content.replace(stateSearch, stateReplace);

const replaceHtml = `      {/* Embedded Text */}
      <Text
        position={[0, 1.5, 0.11]} // Slightly in front of the card
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
      >
        {model.name}
        <meshStandardMaterial attach="material" color="#ffffff" roughness={0.5} metalness={0.5} />
      </Text>

      {/* Description Html Overlay */}
      <Html position={[0, 1.1, 0.11]} transform center>
         <div
           style={{
             color: '#dddddd',
             fontSize: '10px',
             fontFamily: 'sans-serif',
             background: 'rgba(0,0,0,0.5)',
             padding: '4px 8px',
             borderRadius: '8px',
             cursor: 'pointer',
             maxWidth: '120px',
             textAlign: 'center',
             whiteSpace: isDescExpanded ? 'normal' : 'nowrap',
             overflow: isDescExpanded ? 'visible' : 'hidden',
             textOverflow: isDescExpanded ? 'clip' : 'ellipsis',
             userSelect: 'none'
           }}
           onPointerDown={(e) => { e.stopPropagation(); setIsDescExpanded(!isDescExpanded); }}
         >
           {model.description}
         </div>
      </Html>

      <Text
        position={[0, 0.7, 0.11]}`;

content = content.replace(/      \{\/\* Embedded Text \*\/\}([\s\S]*?)      <Text\n        position=\{\[0, 1\.1, 0\.11\]\}/m, replaceHtml);

fs.writeFileSync('ai-spatial-console/src/components/PhysicalCard.tsx', content);

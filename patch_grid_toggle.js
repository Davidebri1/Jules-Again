const fs = require('fs');
let content = fs.readFileSync('ai-spatial-console/src/components/GridOverlay.tsx', 'utf8');

const importSearch = `  Clock,
  Globe,
  Mic,
  Send,`;

const importReplace = `  Clock,
  Globe,
  Mic,
  Send,
  Grid,`;

content = content.replace(importSearch, importReplace);

const stateSearch = `  const [isRecording, setIsRecording] = useState(false);`;
const stateReplace = `  const [isRecording, setIsRecording] = useState(false);
  const [isGridTrayOpen, setIsGridTrayOpen] = useState(false);`;

content = content.replace(stateSearch, stateReplace);


const gridSearch = `        <View style={styles.gridSelector}>
          {(["1x1", "2x2", "3x3"] as GridLayout[]).map((layout, i) => (
            <TouchableOpacity
              key={layout}
              style={[
                styles.gridButton,
                activeLayout === layout && styles.gridButtonActive,
              ]}
              onPress={() => handleLayoutChange(layout)}
            >
              <Text style={styles.gridButtonText}>
                {i === 0 ? "1x1" : i === 1 ? "2x2" : "3x3"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>`;

const gridReplace = `        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsGridTrayOpen(!isGridTrayOpen)}
          >
            <Grid color={isGridTrayOpen ? "#4285F4" : "#fff"} size={20} />
          </TouchableOpacity>
          {isGridTrayOpen && (
            <View style={[styles.gridSelector, { marginLeft: 8 }]}>
              {(["1x1", "2x2", "3x3"] as GridLayout[]).map((layout, i) => (
                <TouchableOpacity
                  key={layout}
                  style={[
                    styles.gridButton,
                    activeLayout === layout && styles.gridButtonActive,
                  ]}
                  onPress={() => {
                      handleLayoutChange(layout);
                      setIsGridTrayOpen(false);
                  }}
                >
                  <Text style={styles.gridButtonText}>
                    {i === 0 ? "1" : i === 1 ? "2" : "3"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>`;

content = content.replace(gridSearch, gridReplace);

fs.writeFileSync('ai-spatial-console/src/components/GridOverlay.tsx', content);

const fs = require('fs');

const filesToUpdate = [
    '/app/ai-spatial-console/src/components/GridOverlay.tsx',
    '/app/ai-spatial-console/src/components/CardDetailView.tsx',
    '/app/ai-spatial-console/src/components/FileManagerView.tsx'
];

for (const file of filesToUpdate) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove the import statement
    content = content.replace(/import \* as MediaLibrary from 'expo-media-library';\n?/g, '');

    // Remove usage of MediaLibrary.requestPermissionsAsync()
    content = content.replace(/const \{ status \} = await MediaLibrary\.requestPermissionsAsync\(\);/g, '');
    content = content.replace(/if \(status !== 'granted'\) \{\n\s*alert\('Sorry, we need camera roll permissions to make this work!'\);\n\s*return;\n\s*\}/g, '');

    // Look for save functions or other usages to neuter/comment out
    content = content.replace(/const asset = await MediaLibrary\.createAssetAsync\(uri\);/g, '// asset creation removed for web compatibility');
    content = content.replace(/await MediaLibrary\.createAlbumAsync\('AiSpatialConsole', asset, false\);/g, '// album creation removed for web compatibility');

    fs.writeFileSync(file, content);
}
console.log("Updated files to remove expo-media-library.");

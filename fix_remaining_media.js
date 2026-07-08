const fs = require('fs');

const filesToUpdate = [
    '/app/ai-spatial-console/src/components/CardDetailView.tsx',
    '/app/ai-spatial-console/src/components/FileManagerView.tsx'
];

for (const file of filesToUpdate) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove remaining save usages
    content = content.replace(/await MediaLibrary\.saveToLibraryAsync\([^)]+\);/g, '/* MediaLibrary save removed */');

    fs.writeFileSync(file, content);
}
console.log("Updated files to remove remaining MediaLibrary usages.");

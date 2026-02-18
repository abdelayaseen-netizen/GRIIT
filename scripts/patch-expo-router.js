const fs = require('fs');
const path = require('path');

const patches = [
  {
    file: 'node_modules/expo-router/build/views/Navigator.js',
    search: /React\.use\(exports\.NavigatorContext\)/g,
    replace: 'React.useContext(exports.NavigatorContext)',
  },
  {
    file: 'node_modules/expo-router/build/fork/useLinking.js',
    search: /React\.use\(serverLocationContext_1\.ServerContext\)/g,
    replace: 'React.useContext(serverLocationContext_1.ServerContext)',
  },
];

for (const patch of patches) {
  const filePath = path.resolve(__dirname, '..', patch.file);
  if (!fs.existsSync(filePath)) {
    console.log(`[patch] Skipping ${patch.file} (not found)`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(patch.search, patch.replace);
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`[patch] Patched ${patch.file}`);
  } else {
    console.log(`[patch] ${patch.file} already patched`);
  }
}

console.log('[patch] expo-router React.use() -> React.useContext() complete');

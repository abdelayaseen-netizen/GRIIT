const fs = require('fs');
const path = require('path');
const modulesDir = path.resolve(__dirname, '..', 'node_modules', 'expo-router', 'build');

function patchDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchDir(full);
    } else if (entry.name.endsWith('.js')) {
      let content = fs.readFileSync(full, 'utf8');
      let updated = content;
      updated = updated.replace(/\(0, react_1\.use\)\(/g, '(0, react_1.useContext)(');
      updated = updated.replace(/React\.use\((?!State|Effect|Memo|Callback|Ref|Context|Reducer|Id|LayoutEffect|InsertionEffect|ImperativeHandle|DebugValue|SyncExternalStore|Transition|DeferredValue|Optimistic|ActionState|Formstatus)/g, 'React.useContext(');
      if (content !== updated) {
        fs.writeFileSync(full, updated, 'utf8');
        console.log(`[patch] Patched ${path.relative(modulesDir, full)}`);
      }
    }
  }
}

patchDir(modulesDir);
console.log('[patch] expo-router React.use() -> React.useContext() complete');

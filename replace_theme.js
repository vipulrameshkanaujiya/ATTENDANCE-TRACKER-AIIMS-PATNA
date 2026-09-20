const fs = require('fs');
const path = require('path');

const replacements = [
  { old: /bg-indigo-600/g, new: 'bg-accent' },
  { old: /bg-indigo-500/g, new: 'bg-accent' },
  { old: /hover:bg-indigo-700/g, new: 'hover:bg-accent-hover' },
  { old: /text-indigo-600/g, new: 'text-accent-text' },
  { old: /text-indigo-400/g, new: 'text-accent' },
  { old: /border-indigo-500/g, new: 'border-accent' },
  { old: /bg-indigo-50/g, new: 'bg-accent-soft' },
  { old: /dark:bg-indigo-950/g, new: 'dark:bg-accent-soft' },
  { old: /ring-indigo-500/g, new: 'ring-accent' },
  { old: /from-indigo-500/g, new: 'from-accent' },
  { old: /to-violet-600/g, new: 'to-accent-hover' },
  { old: /bg-slate-50\b(?!(\/|%))/g, new: 'bg-bg' },
  { old: /bg-white dark:bg-slate-900/g, new: 'bg-bg-elevated' },
  { old: /bg-slate-100 dark:bg-slate-800/g, new: 'bg-bg-subtle' },
  { old: /border-slate-200 dark:border-slate-800/g, new: 'border-border' },
  { old: /text-slate-900 dark:text-slate-100/g, new: 'text-text' },
  { old: /text-slate-500 dark:text-slate-400/g, new: 'text-text-muted' },
  { old: /text-slate-400 dark:text-slate-500/g, new: 'text-text-faint' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        processDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { old, new: replacement } of replacements) {
        content = content.replace(old, replacement);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
console.log('Done!');

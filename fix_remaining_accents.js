const fs = require('fs');
const path = require('path');

const rules = [
  // General Info/Note banners
  { pattern: /bg-blue-50(?!(\/|\||-))/g, replace: 'bg-accent-soft' },
  { pattern: /bg-blue-50\//g, replace: 'bg-accent-soft/' },
  { pattern: /border-blue-200/g, replace: 'border-accent/30' },
  { pattern: /text-blue-900/g, replace: 'text-accent-text' },
  { pattern: /text-blue-800/g, replace: 'text-accent-text' },
  { pattern: /text-blue-700/g, replace: 'text-accent-text' },
  { pattern: /text-blue-600/g, replace: 'text-accent' },
  { pattern: /text-blue-500/g, replace: 'text-accent' },
  
  // Indigo references (for HelpPageClient, SplashScreen, etc)
  { pattern: /bg-indigo-500/g, replace: 'bg-accent' },
  { pattern: /bg-indigo-400/g, replace: 'bg-accent' },
  { pattern: /bg-indigo-700/g, replace: 'bg-accent-hover' },
  { pattern: /text-indigo-[34567]00(\/\d+)?/g, replace: 'text-accent-text' },
  { pattern: /border-indigo-[23456789]00(\/\d+)?/g, replace: 'border-accent/30' },
  
  // Focus rings
  { pattern: /focus:ring-blue-500/g, replace: 'focus:ring-accent' },
  { pattern: /focus:border-blue-500/g, replace: 'focus:border-accent' },
  { pattern: /focus:ring-indigo-500/g, replace: 'focus:ring-accent' },
  
  // Selection rings
  { pattern: /border-blue-500 ring-2 ring-blue-500\/20/g, replace: 'border-accent ring-2 ring-accent/20' },
  
  // Splash Screen glow
  { pattern: /bg-violet-[456]00\/\d+/g, replace: 'bg-accent/10' },
  { pattern: /from-indigo-[4567]00/g, replace: 'from-accent' },
  { pattern: /to-violet-[4567]00/g, replace: 'to-accent-hover' },
  { pattern: /from-slate-950 via-slate-900 to-indigo-950/g, replace: 'from-[#0F0C09] via-[#1A1510] to-[#241C14]' },

  // Pink heart
  { pattern: /text-pink-[456]00/g, replace: 'text-accent' },
  { pattern: /fill-pink-[456]00/g, replace: 'fill-accent' },
  { pattern: /bg-pink-100/g, replace: 'bg-accent-soft' },
  { pattern: /border-pink-200\/60/g, replace: 'border-accent/20' },
  { pattern: /from-pink-50\/60 via-white to-rose-50\/40/g, replace: 'from-accent-soft/60 via-bg-elevated to-accent-soft/40' },
  
  // Also any bg-blue-600 / hover
  { pattern: /bg-blue-600 hover:bg-blue-700/g, replace: 'bg-accent hover:bg-accent-hover' },
  { pattern: /bg-blue-600/g, replace: 'bg-accent' },
  { pattern: /hover:bg-blue-700/g, replace: 'hover:bg-accent-hover' }
];

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      processDirectory(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      rules.forEach(rule => {
        content = content.replace(rule.pattern, rule.replace);
      });
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDirectory(path.join(process.cwd(), 'app'));
processDirectory(path.join(process.cwd(), 'components'));
console.log('Theme replacements complete.');

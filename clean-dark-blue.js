const fs = require('fs');
const path = require('path');

const rules = [
  // Backgrounds
  { pattern: /dark:bg-slate-950/g, replace: 'dark:bg-[#0F0C09]' },
  { pattern: /dark:bg-slate-900/g, replace: 'dark:bg-[#1A1510]' },
  { pattern: /dark:bg-slate-800/g, replace: 'dark:bg-[#241C14]' },
  { pattern: /dark:bg-slate-700/g, replace: 'dark:bg-[#2E2418]' },
  { pattern: /dark:bg-gray-[789]00/g, replace: 'dark:bg-[#1A1510]' },
  { pattern: /dark:bg-zinc-[789]00/g, replace: 'dark:bg-[#1A1510]' },
  { pattern: /dark:bg-neutral-[789]00/g, replace: 'dark:bg-[#1A1510]' },
  { pattern: /dark:bg-blue-900\/\d+/g, replace: 'dark:bg-accent/10' },
  { pattern: /dark:bg-indigo-900\/\d+/g, replace: 'dark:bg-accent/10' },
  { pattern: /dark:bg-blue-950/g, replace: 'dark:bg-[#241C14]' },
  { pattern: /dark:bg-indigo-950/g, replace: 'dark:bg-[#241C14]' },

  // Text
  { pattern: /dark:text-slate-100/g, replace: 'dark:text-[#F5F1EB]' },
  { pattern: /dark:text-slate-200/g, replace: 'dark:text-[#F5F1EB]' },
  { pattern: /dark:text-slate-300/g, replace: 'dark:text-[#A89E92]' },
  { pattern: /dark:text-slate-400/g, replace: 'dark:text-[#A89E92]' },
  { pattern: /dark:text-slate-500/g, replace: 'dark:text-[#756B60]' },
  { pattern: /dark:text-gray-[1-4]00/g, replace: 'dark:text-[#A89E92]' },
  { pattern: /dark:text-blue-[1-4]00/g, replace: 'dark:text-accent-text' },
  { pattern: /dark:text-indigo-[1-4]00/g, replace: 'dark:text-accent-text' },

  // Borders
  { pattern: /dark:border-slate-700/g, replace: 'dark:border-[#2A2018]' },
  { pattern: /dark:border-slate-800/g, replace: 'dark:border-[#2A2018]' },
  { pattern: /dark:border-slate-600/g, replace: 'dark:border-[#3A2E22]' },
  { pattern: /dark:border-gray-[67]00/g, replace: 'dark:border-[#2A2018]' },
  { pattern: /dark:border-blue-[7-9]00/g, replace: 'dark:border-accent/30' },
  { pattern: /dark:border-indigo-[7-9]00/g, replace: 'dark:border-accent/30' },

  // Hover states
  { pattern: /dark:hover:bg-slate-800/g, replace: 'dark:hover:bg-[#241C14]' },
  { pattern: /dark:hover:bg-slate-700/g, replace: 'dark:hover:bg-[#2E2418]' },
  { pattern: /dark:hover:text-slate-100/g, replace: 'dark:hover:text-[#F5F1EB]' },
  { pattern: /dark:hover:text-slate-200/g, replace: 'dark:hover:text-[#F5F1EB]' },
  { pattern: /dark:hover:bg-blue-900\/\d+/g, replace: 'dark:hover:bg-accent/20' },
  { pattern: /dark:hover:bg-indigo-900\/\d+/g, replace: 'dark:hover:bg-accent/20' },

  // Ring
  { pattern: /dark:ring-slate-[67]00/g, replace: 'dark:ring-[#2A2018]' },
  { pattern: /dark:ring-blue-[5-7]00/g, replace: 'dark:ring-accent/40' },
  { pattern: /dark:ring-indigo-[5-7]00/g, replace: 'dark:ring-accent/40' },

  // Divide
  { pattern: /dark:divide-slate-[78]00/g, replace: 'dark:divide-[#2A2018]' },
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git', '.vercel'].includes(entry.name)) continue;
      walk(full);
    } else if (entry.isFile() && (full.endsWith('.tsx') || full.endsWith('.ts'))) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const rule of rules) {
        const before = content;
        content = content.replace(rule.pattern, rule.replace);
        if (content !== before) changed = true;
      }
      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        console.log('Updated:', full);
      }
    }
  }
}

walk('app');
walk('components');
console.log('✅ Dark mode blue/slate cleanup complete.');

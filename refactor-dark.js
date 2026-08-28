const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function findAndReplace(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const replacements = [
        { regex: /bg-slate-900/g, replacement: 'bg-white dark:bg-slate-900' },
        { regex: /bg-slate-800/g, replacement: 'bg-slate-50 dark:bg-slate-800' },
        { regex: /bg-slate-950/g, replacement: 'bg-slate-100 dark:bg-slate-950' },
        { regex: /text-slate-200/g, replacement: 'text-slate-800 dark:text-slate-200' },
        { regex: /text-slate-300/g, replacement: 'text-slate-700 dark:text-slate-300' },
        { regex: /text-slate-400/g, replacement: 'text-slate-500 dark:text-slate-400' },
        { regex: /border-slate-700/g, replacement: 'border-slate-200 dark:border-slate-700' },
        { regex: /border-slate-600/g, replacement: 'border-slate-300 dark:border-slate-600' },
        { regex: /border-slate-800/g, replacement: 'border-slate-200 dark:border-slate-800' },
        { regex: /border-white\\/10/g, replacement: 'border-slate-200 dark:border-white/10' },
        { regex: /bg-\\[#0f172a\\]/g, replacement: 'bg-slate-50 dark:bg-[#0f172a]' },
      ];

      let modified = false;
      for (const { regex, replacement } of replacements) {
        const safeRegex = new RegExp(`(?<![:a-zA-Z-])${regex.source}(?![a-zA-Z0-9-])`, 'g');
        if (safeRegex.test(content)) {
          content = content.replace(safeRegex, replacement);
          modified = true;
        }
      }

      const textWhiteRegex = /(?<![:a-zA-Z-])text-white(?![a-zA-Z0-9-])/g;
      if (textWhiteRegex.test(content)) {
          content = content.replace(textWhiteRegex, 'text-slate-900 dark:text-white');
          modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

findAndReplace(directoryPath);
console.log('Refactoring complete!');

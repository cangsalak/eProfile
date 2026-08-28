import os
import re

directory_path = 'src'

def fix_white_text(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                full_path = os.path.join(root, file)
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # If a line contains bg-primary, bg-rose, bg-emerald, bg-sky, bg-indigo, bg-gradient
                # and also contains text-slate-900 dark:text-white, we might want to revert that specific text-slate-900 dark:text-white to text-white.
                
                lines = content.split('\n')
                modified = False
                for i in range(len(lines)):
                    line = lines[i]
                    if 'text-slate-900 dark:text-white' in line:
                        if re.search(r'bg-(primary|rose|emerald|sky|indigo|amber|blue|green|red|purple|gradient)-', line) or 'from-primary' in line or 'badge' in line.lower():
                            lines[i] = line.replace('text-slate-900 dark:text-white', 'text-white')
                            modified = True
                
                if modified:
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write('\n'.join(lines))
                    print(f'Fixed: {full_path}')

fix_white_text(directory_path)
print('Fix complete!')

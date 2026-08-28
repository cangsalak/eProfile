import os
import re

directory_path = 'src'

replacements = [
    (re.compile(r'(?<![:a-zA-Z-])bg-slate-900(?![a-zA-Z0-9-])'), 'bg-white dark:bg-slate-900'),
    (re.compile(r'(?<![:a-zA-Z-])bg-slate-800(?![a-zA-Z0-9-])'), 'bg-slate-50 dark:bg-slate-800'),
    (re.compile(r'(?<![:a-zA-Z-])bg-slate-950(?![a-zA-Z0-9-])'), 'bg-slate-100 dark:bg-slate-950'),
    (re.compile(r'(?<![:a-zA-Z-])text-slate-200(?![a-zA-Z0-9-])'), 'text-slate-800 dark:text-slate-200'),
    (re.compile(r'(?<![:a-zA-Z-])text-slate-300(?![a-zA-Z0-9-])'), 'text-slate-700 dark:text-slate-300'),
    (re.compile(r'(?<![:a-zA-Z-])text-slate-400(?![a-zA-Z0-9-])'), 'text-slate-500 dark:text-slate-400'),
    (re.compile(r'(?<![:a-zA-Z-])border-slate-700(?![a-zA-Z0-9-])'), 'border-slate-200 dark:border-slate-700'),
    (re.compile(r'(?<![:a-zA-Z-])border-slate-600(?![a-zA-Z0-9-])'), 'border-slate-300 dark:border-slate-600'),
    (re.compile(r'(?<![:a-zA-Z-])border-slate-800(?![a-zA-Z0-9-])'), 'border-slate-200 dark:border-slate-800'),
    (re.compile(r'(?<![:a-zA-Z-])border-white/10(?![a-zA-Z0-9-])'), 'border-slate-200 dark:border-white/10'),
    (re.compile(r'(?<![:a-zA-Z-])bg-\[\#0f172a\](?![a-zA-Z0-9-])'), 'bg-slate-50 dark:bg-[#0f172a]'),
    (re.compile(r'(?<![:a-zA-Z-])text-white(?![a-zA-Z0-9-])'), 'text-slate-900 dark:text-white'),
]

def find_and_replace(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                full_path = os.path.join(root, file)
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                modified = False
                for regex, replacement in replacements:
                    if regex.search(content):
                        content = regex.sub(replacement, content)
                        modified = True
                        
                if modified:
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f'Updated: {full_path}')

find_and_replace(directory_path)
print('Refactoring complete!')

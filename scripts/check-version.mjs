import fs from 'node:fs';
import process from 'node:process';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const versionSource = fs.readFileSync('src/lib/version.ts', 'utf8');
const match = versionSource.match(/APP_VERSION\s*=\s*'([^']+)'/);

if (!match) {
  console.error('ERROR: APP_VERSION not found in src/lib/version.ts');
  process.exit(1);
}

const packageVersion = packageJson.version;
const sourceVersion = match[1];

if (packageVersion !== sourceVersion) {
  console.error(`ERROR: Version mismatch: package.json=${packageVersion}, version.ts=${sourceVersion}`);
  process.exit(1);
}

console.log(`eProfile version OK: v${packageVersion}`);

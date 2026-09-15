/**
 * CLI entry point for schema merging.
 * Usage: npm run db:merge
 * Or:    ts-node --compiler-options '{"module":"CommonJS"}' scripts/merge-schemas.ts
 */

// Must use require (not import) for CommonJS compatibility with ts-node
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mergeSchemas } = require('../src/modules/core/lib/schema-merger');

const result = mergeSchemas();

console.log('\n📦 Schema merge complete:');
console.log(`   Base:    prisma/_base.prisma`);
for (const s of result.moduleSchemas) {
  console.log(`   Module:  ${s}`);
}
console.log(`   Output:  prisma/schema.prisma (${result.mergedCount} module schemas merged)\n`);

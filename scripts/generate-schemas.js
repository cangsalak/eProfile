const fs = require('fs');
const path = require('path');

const baseSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const baseSchema = fs.readFileSync(baseSchemaPath, 'utf8');

// Generate MySQL Schema
let mysqlSchema = baseSchema
  .replace(/provider\s*=\s*"sqlite"/, 'provider = "mysql"')
  .replace(/generator client {/, 'generator client {\n  output = "../src/generated/mysql-client"');

// In MySQL, VARCHAR defaults to 191 chars. Text/JSON fields require @db.Text or @db.LongText.
const mysqlTextReplacements = [
  { target: /value\s+String\n/g, repl: 'value String @db.LongText\n' },
  { target: /permissions\s+String\s+@default\("\[\]"\)/g, repl: 'permissions String @default("[]") @db.Text' },
  { target: /details\s+String\?\n/g, repl: 'details String? @db.LongText\n' },
  { target: /content\s+String\n/g, repl: 'content String @db.LongText\n' },
  { target: /skills\s+String\s+@default\("\[\]"\)/g, repl: 'skills String @default("[]") @db.Text' },
  { target: /education\s+String\s+@default\(""\)/g, repl: 'education String @default("") @db.Text' },
  { target: /experience\s+String\s+@default\(""\)/g, repl: 'experience String @default("") @db.Text' },
  { target: /royalDecorations\s+String\s+@default\(""\)/g, repl: 'royalDecorations String @default("") @db.Text' },
  { target: /trainingHistory\s+String\s+@default\(""\)/g, repl: 'trainingHistory String @default("") @db.Text' },
  { target: /coverPhoto\s+String\s+@default\(""\)/g, repl: 'coverPhoto String @default("") @db.Text' },
  { target: /subDepartments\s+String\s+@default\("\[\]"\)/g, repl: 'subDepartments String @default("[]") @db.Text' },
];

mysqlTextReplacements.forEach(({ target, repl }) => {
  mysqlSchema = mysqlSchema.replace(target, repl);
});

fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'schema.mysql.prisma'), mysqlSchema);

// Generate PostgreSQL Schema
const postgresSchema = baseSchema
  .replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"')
  .replace(/generator client {/, 'generator client {\n  output = "../src/generated/postgres-client"');

fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'schema.postgresql.prisma'), postgresSchema);

console.log('✔ Multi-database schemas (schema.mysql.prisma & schema.postgresql.prisma) synchronized successfully.');

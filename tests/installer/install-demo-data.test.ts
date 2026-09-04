import { strict as assert } from 'assert';
import { prisma } from '../../src/lib/prisma';
import { seedDemoDataset } from '../../src/lib/installer/sample-data';

export async function runInstallDemoDataTests() {
  console.log('--- Running Installer & Demo Dataset Seeder Tests (v1.3.0) ---');

  // 1. Run seedDemoDataset directly
  await seedDemoDataset(prisma);

  // 2. Verify Departments & Sub-departments exist
  const depts = await prisma.department.findMany();
  assert.ok(depts.length >= 4, `Expected at least 4 departments, found ${depts.length}`);
  const totalSubDepts = depts.reduce((acc, d) => {
    try {
      const parsed = JSON.parse(d.subDepartments || '[]');
      return acc + parsed.length;
    } catch {
      return acc;
    }
  }, 0);
  assert.ok(totalSubDepts >= 8, `Expected at least 8 sub-departments, found ${totalSubDepts}`);
  console.log(`✔ Demo Departments (${depts.length}) & Sub-departments (${totalSubDepts}) created successfully`);

  // 3. Verify Demo Personnel covering 5 personnel types
  const demoPersonnel = await prisma.personnel.findMany({
    where: { id: { startsWith: 'DEMO_' } },
  });
  assert.ok(demoPersonnel.length >= 9, `Expected at least 9 demo personnel, found ${demoPersonnel.length}`);
  
  const types = new Set(demoPersonnel.map(p => p.personnelType));
  assert.ok(types.has('นายทหารสัญญาบัตร'), 'Must include นายทหารสัญญาบัตร');
  assert.ok(types.has('นายทหารประทวน'), 'Must include นายทหารประทวน');
  assert.ok(types.has('พนักงานราชการ'), 'Must include พนักงานราชการ');
  assert.ok(types.has('ลูกจ้าง'), 'Must include ลูกจ้าง');
  assert.ok(types.has('ทหารกองประจำการ'), 'Must include ทหารกองประจำการ');
  console.log(`✔ Demo Personnel (${demoPersonnel.length}) across all 5 personnel types verified`);

  // 4. Verify Demo Leaves, Vehicles, Posts, Events & Documents
  const leaves = await prisma.leaveRecord.findMany({
    where: { personnelId: { startsWith: 'DEMO_' } },
  });
  assert.ok(leaves.length >= 3, `Expected at least 3 leaves, found ${leaves.length}`);
  console.log(`✔ Demo Leave Records (${leaves.length}) verified`);

  const vehicles = await prisma.vehicle.findMany({
    where: { personnelId: { startsWith: 'DEMO_' } },
  });
  assert.ok(vehicles.length >= 4, `Expected at least 4 vehicles, found ${vehicles.length}`);
  console.log(`✔ Demo Vehicles (${vehicles.length}) verified`);

  const posts = await prisma.post.findMany({
    where: { authorId: { startsWith: 'DEMO_' } },
  });
  assert.ok(posts.length >= 3, `Expected at least 3 posts, found ${posts.length}`);
  console.log(`✔ Demo News Posts (${posts.length}) verified`);

  const events = await prisma.calendarEvent.findMany({
    where: { title: { contains: 'ประจำ' } },
  });
  assert.ok(events.length >= 2, `Expected at least 2 events, found ${events.length}`);
  console.log(`✔ Demo Calendar Events (${events.length}) verified`);

  const docs = await prisma.personnelDocument.findMany({
    where: { personnelId: { startsWith: 'DEMO_' } },
  });
  assert.ok(docs.length >= 2, `Expected at least 2 documents, found ${docs.length}`);
  console.log(`✔ Demo Personnel Documents (${docs.length}) verified`);

  // 5. Cleanup all created demo test records
  await prisma.personnelDocument.deleteMany({
    where: { personnelId: { startsWith: 'DEMO_' } },
  });
  await prisma.calendarEvent.deleteMany({
    where: { title: { contains: 'ประจำ' } },
  });
  await prisma.post.deleteMany({
    where: { authorId: { startsWith: 'DEMO_' } },
  });
  await prisma.vehicle.deleteMany({
    where: { personnelId: { startsWith: 'DEMO_' } },
  });
  await prisma.leaveRecord.deleteMany({
    where: { personnelId: { startsWith: 'DEMO_' } },
  });
  await prisma.personnel.deleteMany({
    where: { id: { startsWith: 'DEMO_' } },
  });

  console.log('✔ Demo Dataset Test cleanup completed successfully');
}

if (require.main === module) {
  runInstallDemoDataTests()
    .then(() => console.log('\nAll demo data installer tests passed!'))
    .catch((err) => {
      console.error('Demo data installer test failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

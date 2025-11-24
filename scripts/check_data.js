const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, createdAt: true }
  });
  
  console.log("Current Projects in DB:");
  projects.forEach(p => {
      console.log(`- [${p.createdAt.toISOString()}] ${p.name} (${p.id})`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

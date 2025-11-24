const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up E2E test data...");

  const deletedProjects = await prisma.project.deleteMany({
    where: {
      OR: [
        { name: { startsWith: 'E2E Project' } },
        { name: { startsWith: 'E2E Case Project' } }
      ]
    }
  });
  
  console.log(`Deleted ${deletedProjects.count} projects.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

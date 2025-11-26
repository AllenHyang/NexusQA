import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PROJECTS = [
  {
    name: 'E-Commerce Platform',
    description: 'Main storefront and admin panel for the e-commerce solution.',
    repositoryUrl: 'https://github.com/company/ecommerce-main',
  },
  {
    name: 'Mobile App (iOS/Android)',
    description: 'Consumer facing mobile application.',
    repositoryUrl: 'https://github.com/company/mobile-app',
  },
  {
    name: 'Payment Gateway Service',
    description: 'Backend service handling payment processing.',
    repositoryUrl: 'https://github.com/company/payment-service',
  }
];

const USERS = [
  {
    id: 'user-sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    role: 'ADMIN',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random'
  },
  {
    id: 'user-john',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'TESTER',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
  }
];

const SUITES = [
  'Authentication',
  'User Profile',
  'Product Catalog',
  'Checkout Process',
  'Admin Dashboard',
  'API Integration',
  'Performance Tests'
];

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const STATUSES = ['UNTESTED', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'];
const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Start seeding ...');

  // Cleanup
  await prisma.testRun.deleteMany();
  await prisma.testPlan.deleteMany();
  await prisma.executionRecord.deleteMany();
  await prisma.testStep.deleteMany();
  await prisma.defectComment.deleteMany(); // Add DefectComment cleanup
  await prisma.defect.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.testSuite.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany(); // Cleanup Users

  // Seed Users
  for (const userData of USERS) {
    await prisma.user.create({ data: userData });
    console.log(`Created user: ${userData.name}`);
  }

  const sarah = USERS.find(u => u.name === 'Sarah Jenkins')!;
  const john = USERS.find(u => u.name === 'John Doe')!;

  for (const projectData of PROJECTS) {
    const project = await prisma.project.create({
      data: {
        ...projectData,
        coverImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(projectData.name)}&background=random`,
      }
    });
    console.log(`Created project: ${project.name}`);

    // Create Suites
    const suites = [];
    for (const suiteName of SUITES) {
      const suite = await prisma.testSuite.create({
        data: {
          name: suiteName,
          projectId: project.id,
        }
      });
      suites.push(suite);
      
      // Create Sub-suites for some
      if (Math.random() > 0.5) {
          const subSuite = await prisma.testSuite.create({
              data: {
                  name: `${suiteName} - Advanced`,
                  projectId: project.id,
                  parentId: suite.id
              }
          });
          suites.push(subSuite);
      }
    }

    // Create Test Cases
    const testCases = [];
    for (let i = 0; i < 20; i++) {
      const suite = randomItem(suites);
      const testCase = await prisma.testCase.create({
        data: {
          title: `Verify ${suite.name} functionality - Scenario ${i + 1}`,
          description: 'Detailed description of the test scenario...',
          preconditions: 'User must be logged in.',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          priority: randomItem(PRIORITIES) as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: randomItem(STATUSES) as any,
          projectId: project.id,
          suiteId: suite.id,
          authorId: sarah.id, // Use seeded user ID
          assignedToId: randomItem([sarah.id, john.id]), // Assign to a seeded user
          steps: {
            create: [
              { action: 'Navigate to page', expected: 'Page loads successfully', order: 1 },
              { action: 'Click button', expected: 'Modal opens', order: 2 },
              { action: 'Submit form', expected: 'Success message appears', order: 3 },
            ]
          }
        }
      });
      testCases.push(testCase);

      // Create Execution History
      for (let j = 0; j < 3; j++) {
          await prisma.executionRecord.create({
              data: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  status: randomItem(STATUSES) as any,
                  executedBy: randomItem([sarah.name, john.name]), // Use seeded user names
                  testCaseId: testCase.id,
                  notes: 'Automated execution',
                  date: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
              }
          });
      }
    }

    // Create Defects
    for (let i = 0; i < 5; i++) {
        await prisma.defect.create({
            data: {
                title: `Bug in ${project.name} - Issue ${i+1}`,
                description: 'Steps to reproduce...',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                severity: randomItem(SEVERITIES) as any,
                status: 'OPEN',
                projectId: project.id,
                authorId: john.id, // Use seeded user ID
                assigneeId: randomItem([sarah.id, john.id]), // Assign to a seeded user
            }
        });
    }

    // Create Test Plan
    const plan = await prisma.testPlan.create({
        data: {
            name: `Release 1.0 Test Plan - ${project.name}`,
            projectId: project.id,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            status: 'ACTIVE'
        }
    });

    // Add Test Runs to Plan
    for (const tc of testCases.slice(0, 10)) { // Add first 10 cases to plan
        await prisma.testRun.create({
            data: {
                testPlanId: plan.id,
                testCaseId: tc.id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: randomItem(STATUSES) as any,
                snapshot: JSON.stringify(tc)
            }
        });
    }
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

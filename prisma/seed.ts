import { PrismaClient } from '@prisma/client';

// Import all seed data from modular files
import {
  PROJECTS,
  USERS,
  SUITES,
  NEXUSQA_SUITES,
  NEXUSQA_TEST_CASES,
  PRIORITIES,
  STATUSES,
  SEVERITIES,
  REQUIREMENT_STATUSES,
  ACCEPTANCE_STATUSES,
  NEXUSQA_REQUIREMENT_FOLDERS,
  NEXUSQA_REQUIREMENTS,
  ECOMMERCE_REQUIREMENTS,
  MOBILE_APP_REQUIREMENTS,
} from './seed-data/index.ts';

const prisma = new PrismaClient();

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
  await prisma.defectComment.deleteMany();
  await prisma.defect.deleteMany();
  await prisma.requirementReview.deleteMany();
  await prisma.internalRequirement.deleteMany();
  await prisma.requirementFolder.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.testSuite.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

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

    // Create Suites - use NexusQA specific suites for NexusQA project
    const suiteNames = projectData.name === 'NexusQA 产品开发' ? NEXUSQA_SUITES : SUITES;
    const suites: { id: string; name: string }[] = [];
    const suiteMap: Record<string, string> = {}; // name -> id mapping

    for (const suiteName of suiteNames) {
      const suite = await prisma.testSuite.create({
        data: {
          name: suiteName,
          projectId: project.id,
        }
      });
      suites.push(suite);
      suiteMap[suiteName] = suite.id;

      // Create Sub-suites for non-NexusQA projects
      if (projectData.name !== 'NexusQA 产品开发' && Math.random() > 0.5) {
        const subSuite = await prisma.testSuite.create({
          data: {
            name: `${suiteName} - Advanced`,
            projectId: project.id,
            parentId: suite.id
          }
        });
        suites.push(subSuite);
        suiteMap[subSuite.name] = subSuite.id;
      }
    }

    // Create Test Cases - use NexusQA specific test cases
    const testCases: { id: string; title: string; reqIndex?: number }[] = [];

    if (projectData.name === 'NexusQA 产品开发') {
      // Create NexusQA specific test cases
      for (const tcData of NEXUSQA_TEST_CASES) {
        const suiteId = suiteMap[tcData.suite];
        const testCase = await prisma.testCase.create({
          data: {
            title: tcData.title,
            description: `测试用例：${tcData.title}\n\n验证相关功能是否符合需求规格。`,
            preconditions: '- 用户已登录系统\n- 系统处于正常运行状态',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            priority: tcData.priority as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            status: tcData.status as any,
            projectId: project.id,
            suiteId: suiteId,
            authorId: sarah.id,
            assignedToId: randomItem([sarah.id, john.id]),
            steps: {
              create: [
                { action: '准备测试环境和数据', expected: '环境就绪，数据准备完成', order: 1 },
                { action: '执行测试操作', expected: '操作成功执行', order: 2 },
                { action: '验证结果符合预期', expected: '结果与预期一致', order: 3 },
              ]
            }
          }
        });
        testCases.push({ ...testCase, reqIndex: tcData.reqIndex });

        // Create Execution History only for executed test cases
        if (tcData.status !== 'UNTESTED') {
          await prisma.executionRecord.create({
            data: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              status: tcData.status as any,
              executedBy: sarah.name,
              testCaseId: testCase.id,
              notes: tcData.status === 'PASSED' ? '测试通过' : (tcData.status === 'FAILED' ? '发现问题，已提交缺陷' : ''),
              date: new Date(Date.now() - Math.floor(Math.random() * 100000000))
            }
          });
        }
      }
    } else {
      // Create generic test cases for other projects
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
            authorId: sarah.id,
            assignedToId: randomItem([sarah.id, john.id]),
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
              executedBy: randomItem([sarah.name, john.name]),
              testCaseId: testCase.id,
              notes: 'Automated execution',
              date: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
            }
          });
        }
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
          authorId: john.id,
          assigneeId: randomItem([sarah.id, john.id]),
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
    for (const tc of testCases.slice(0, 10)) {
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

    // Select requirements data based on project
    let requirementsData;
    if (projectData.name === 'NexusQA 产品开发') {
      requirementsData = NEXUSQA_REQUIREMENTS;
    } else if (projectData.name === 'E-Commerce Platform') {
      requirementsData = ECOMMERCE_REQUIREMENTS;
    } else {
      requirementsData = MOBILE_APP_REQUIREMENTS;
    }

    // Create Requirement Folders (only for NexusQA project)
    interface FolderData {
      name: string;
      type: string;
      description: string;
      order: number;
      children?: Array<{
        name: string;
        type: string;
        description: string;
        order: number;
        requirementIndices: number[];
      }>;
    }
    const requirementToFolderMap: Map<number, string> = new Map();

    if (projectData.name === 'NexusQA 产品开发') {
      console.log('Creating requirement folders for NexusQA...');

      for (const epicData of NEXUSQA_REQUIREMENT_FOLDERS as FolderData[]) {
        // Create Epic folder
        const epicFolder = await prisma.requirementFolder.create({
          data: {
            name: epicData.name,
            type: epicData.type,
            description: epicData.description,
            order: epicData.order,
            projectId: project.id,
          }
        });
        console.log(`Created Epic: ${epicData.name}`);

        // Create Feature folders under Epic
        if (epicData.children) {
          for (const featureData of epicData.children) {
            const featureFolder = await prisma.requirementFolder.create({
              data: {
                name: featureData.name,
                type: featureData.type,
                description: featureData.description,
                order: featureData.order,
                parentId: epicFolder.id,
                projectId: project.id,
              }
            });
            console.log(`  Created Feature: ${featureData.name}`);

            // Map requirement indices to this folder
            for (const reqIdx of featureData.requirementIndices) {
              requirementToFolderMap.set(reqIdx, featureFolder.id);
            }
          }
        }
      }
    }

    // Create Internal Requirements
    for (let i = 0; i < requirementsData.length; i++) {
      const reqData = requirementsData[i];
      // Use priority from data if available, otherwise random
      const reqPriority = (reqData as { priority?: string }).priority || randomItem(PRIORITIES);
      // For NexusQA project, use more realistic status distribution
      let reqStatus: string;
      let acceptanceStatus: string;

      if (projectData.name === 'NexusQA 产品开发') {
        // Based on priority: P0 mostly completed, P1 in progress, P2 draft/pending
        if (reqPriority === 'P0') {
          reqStatus = randomItem(['APPROVED', 'IN_PROGRESS', 'COMPLETED']);
          acceptanceStatus = reqStatus === 'COMPLETED' ? 'ACCEPTED' : 'PENDING';
        } else if (reqPriority === 'P1') {
          reqStatus = randomItem(['APPROVED', 'IN_PROGRESS', 'PENDING_REVIEW']);
          acceptanceStatus = 'PENDING';
        } else {
          reqStatus = randomItem(['DRAFT', 'PENDING_REVIEW']);
          acceptanceStatus = 'PENDING';
        }
      } else {
        reqStatus = randomItem(REQUIREMENT_STATUSES);
        acceptanceStatus = reqStatus === 'COMPLETED'
          ? 'ACCEPTED'
          : (reqStatus === 'DRAFT' ? 'PENDING' : randomItem(ACCEPTANCE_STATUSES));
      }

      // Prepare acceptance criteria with IDs
      const acWithIds = reqData.acceptanceCriteria.map((ac, idx) => ({
        id: `ac-${Date.now()}-${idx}`,
        description: ac.description,
        testCaseIds: [],
        status: ac.status
      }));

      // Prepare business rules with IDs
      const businessRulesWithIds = reqData.businessRules.map((br, idx) => ({
        id: `br-${Date.now()}-${idx}`,
        code: br.code,
        description: br.description
      }));

      // Prepare design references with IDs
      const designRefsWithIds = reqData.designReferences.map((dr, idx) => ({
        id: `dr-${Date.now()}-${idx}`,
        type: dr.type,
        url: dr.url,
        title: dr.title
      }));

      // Prepare user stories with IDs
      const userStoriesWithIds = reqData.userStories.map((us, idx) => ({
        id: `us-${Date.now()}-${idx}`,
        role: us.role,
        goal: us.goal,
        benefit: us.benefit
      }));

      // Determine review-related fields based on status
      const needsReviewInfo = ['PENDING_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(reqStatus);
      const reviewerId = needsReviewInfo ? sarah.id : null;
      const reviewedAt = needsReviewInfo && reqStatus !== 'PENDING_REVIEW' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null;
      const reviewNotes = reqStatus === 'APPROVED' ? '需求描述清晰，符合开发要求' :
                         reqStatus === 'IN_PROGRESS' ? '已批准，进入开发阶段' :
                         reqStatus === 'COMPLETED' ? '功能实现完成' : null;

      // Determine folder for this requirement
      const folderId = requirementToFolderMap.get(i) || null;

      const requirement = await prisma.internalRequirement.create({
        data: {
          title: reqData.title,
          description: reqData.description,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: reqStatus as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          acceptanceStatus: acceptanceStatus as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          priority: reqPriority as any,
          tags: JSON.stringify(reqData.tags),
          acceptanceCriteria: JSON.stringify(acWithIds),
          // Folder hierarchy
          folderId,
          order: i,
          // New fields
          userStories: JSON.stringify(userStoriesWithIds),
          targetUsers: JSON.stringify(reqData.targetUsers || []),
          preconditions: reqData.preconditions || null,
          businessRules: JSON.stringify(businessRulesWithIds),
          designReferences: JSON.stringify(designRefsWithIds),
          targetVersion: reqData.targetVersion || null,
          estimatedEffort: reqData.estimatedEffort || null,
          ownerId: sarah.id,
          relatedRequirements: '[]',
          // Review fields
          reviewerId,
          reviewedAt,
          reviewNotes,
          // Project and author
          projectId: project.id,
          authorId: sarah.id,
          acceptedBy: acceptanceStatus !== 'PENDING' ? sarah.id : null,
          acceptedAt: acceptanceStatus !== 'PENDING' ? new Date() : null,
          acceptanceNotes: acceptanceStatus === 'ACCEPTED' ? '需求描述清晰，验收通过' :
                          (acceptanceStatus === 'REJECTED' ? '需要补充更多细节' : null),
          // Link test cases to requirements
          testCases: {
            connect: projectData.name === 'NexusQA 产品开发'
              // For NexusQA: find test cases that have this requirement's index
              ? testCases
                  .filter(tc => tc.reqIndex === i)
                  .map(tc => ({ id: tc.id }))
              // For other projects: cycle through available test cases
              : testCases.length > 0 ? [
                  { id: testCases[i % testCases.length].id },
                  { id: testCases[(i + 1) % testCases.length].id }
                ] : []
          }
        }
      });

      // Create review history based on status
      const reviewHistory: { action: string; toStatus: string; fromStatus?: string; comment?: string }[] = [];

      if (reqStatus === 'PENDING_REVIEW') {
        reviewHistory.push({ action: 'SUBMIT', fromStatus: 'DRAFT', toStatus: 'PENDING_REVIEW', comment: '提交评审' });
      } else if (reqStatus === 'APPROVED') {
        reviewHistory.push({ action: 'SUBMIT', fromStatus: 'DRAFT', toStatus: 'PENDING_REVIEW', comment: '提交评审' });
        reviewHistory.push({ action: 'APPROVE', fromStatus: 'PENDING_REVIEW', toStatus: 'APPROVED', comment: '需求描述清晰，符合开发要求' });
      } else if (reqStatus === 'IN_PROGRESS') {
        reviewHistory.push({ action: 'SUBMIT', fromStatus: 'DRAFT', toStatus: 'PENDING_REVIEW', comment: '提交评审' });
        reviewHistory.push({ action: 'APPROVE', fromStatus: 'PENDING_REVIEW', toStatus: 'APPROVED', comment: '需求描述清晰，符合开发要求' });
        reviewHistory.push({ action: 'START', fromStatus: 'APPROVED', toStatus: 'IN_PROGRESS', comment: '开始开发' });
      } else if (reqStatus === 'COMPLETED') {
        reviewHistory.push({ action: 'SUBMIT', fromStatus: 'DRAFT', toStatus: 'PENDING_REVIEW', comment: '提交评审' });
        reviewHistory.push({ action: 'APPROVE', fromStatus: 'PENDING_REVIEW', toStatus: 'APPROVED', comment: '需求描述清晰，符合开发要求' });
        reviewHistory.push({ action: 'START', fromStatus: 'APPROVED', toStatus: 'IN_PROGRESS', comment: '开始开发' });
        reviewHistory.push({ action: 'COMPLETE', fromStatus: 'IN_PROGRESS', toStatus: 'COMPLETED', comment: '功能实现完成' });
      }

      // Create review records
      for (let ri = 0; ri < reviewHistory.length; ri++) {
        const review = reviewHistory[ri];
        await prisma.requirementReview.create({
          data: {
            action: review.action,
            fromStatus: review.fromStatus || null,
            toStatus: review.toStatus,
            comment: review.comment || null,
            requirementId: requirement.id,
            reviewerId: sarah.id,
            createdAt: new Date(Date.now() - (reviewHistory.length - ri) * 24 * 60 * 60 * 1000) // Stagger dates
          }
        });
      }

      console.log(`Created requirement: ${requirement.title} with ${reviewHistory.length} review records`);
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

/**
 * API Integration Tests for /api/requirements/folders
 *
 * Tests the folder API endpoint for requirement management.
 * Covers: folder listing, counts, tree structure
 *
 * Key test case: rootRequirementsCount should return TOTAL requirements count,
 * not just uncategorized requirements. This was a bug fix.
 */

import { prisma } from '@/lib/prisma';

// Mock NextResponse for testing
const mockJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => {
      mockJson(data, init);
      return { data, status: init?.status || 200 };
    },
  },
}));

// Import after mocking
import { GET } from './route';

describe('GET /api/requirements/folders', () => {
  const testProjectId = 'test-project-folders';
  const testUserId = 'test-user-folders';

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.internalRequirement.deleteMany({
      where: { projectId: testProjectId }
    });
    await prisma.requirementFolder.deleteMany({
      where: { projectId: testProjectId }
    });
    await prisma.project.deleteMany({
      where: { id: testProjectId }
    });
    await prisma.user.deleteMany({
      where: { id: testUserId }
    });

    // Create test user
    await prisma.user.create({
      data: {
        id: testUserId,
        name: 'Test User',
        email: 'test-folders-api@example.com',
        role: 'ADMIN',
      }
    });

    // Create test project
    await prisma.project.create({
      data: {
        id: testProjectId,
        name: 'Test Project for Folders API',
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.internalRequirement.deleteMany({
      where: { projectId: testProjectId }
    });
    await prisma.requirementFolder.deleteMany({
      where: { projectId: testProjectId }
    });
    await prisma.project.deleteMany({
      where: { id: testProjectId }
    });
    await prisma.user.deleteMany({
      where: { id: testUserId }
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    mockJson.mockClear();
    // Clean requirements and folders before each test
    await prisma.internalRequirement.deleteMany({
      where: { projectId: testProjectId }
    });
    await prisma.requirementFolder.deleteMany({
      where: { projectId: testProjectId }
    });
  });

  describe('rootRequirementsCount - Total requirements count (Bug fix verification)', () => {
    /**
     * This test verifies the bug fix for "全部需求" showing 0
     * The issue was: rootRequirementsCount was counting only folderId: null
     * The fix: rootRequirementsCount now counts ALL requirements in the project
     */
    it('should return 0 when project has no requirements', async () => {
      const request = new Request(
        `http://localhost/api/requirements/folders?projectId=${testProjectId}`
      );

      await GET(request);

      const callArgs = mockJson.mock.calls[0][0];
      expect(callArgs.rootRequirementsCount).toBe(0);
      expect(callArgs.uncategorizedCount).toBe(0);
    });

    it('should return total count of ALL requirements (not just uncategorized) - BUG FIX', async () => {
      // Create a folder
      const folder = await prisma.requirementFolder.create({
        data: {
          name: 'Test Epic',
          type: 'EPIC',
          projectId: testProjectId,
        }
      });

      // Create 3 requirements IN the folder
      await prisma.internalRequirement.create({
        data: { title: 'Req 1', projectId: testProjectId, folderId: folder.id, authorId: testUserId }
      });
      await prisma.internalRequirement.create({
        data: { title: 'Req 2', projectId: testProjectId, folderId: folder.id, authorId: testUserId }
      });
      await prisma.internalRequirement.create({
        data: { title: 'Req 3', projectId: testProjectId, folderId: folder.id, authorId: testUserId }
      });

      // Create 2 requirements WITHOUT folder (uncategorized)
      await prisma.internalRequirement.create({
        data: { title: 'Uncategorized 1', projectId: testProjectId, folderId: null, authorId: testUserId }
      });
      await prisma.internalRequirement.create({
        data: { title: 'Uncategorized 2', projectId: testProjectId, folderId: null, authorId: testUserId }
      });

      const request = new Request(
        `http://localhost/api/requirements/folders?projectId=${testProjectId}`
      );

      await GET(request);

      const callArgs = mockJson.mock.calls[0][0];

      // KEY ASSERTION: rootRequirementsCount should be TOTAL (5), not just uncategorized (2)
      // Before bug fix: rootRequirementsCount was 2 (wrong - only counted folderId: null)
      // After bug fix: rootRequirementsCount is 5 (correct - counts all requirements)
      expect(callArgs.rootRequirementsCount).toBe(5);
      expect(callArgs.uncategorizedCount).toBe(2);
    });

    it('should return correct count when all requirements are in folders', async () => {
      // Create a folder
      const folder = await prisma.requirementFolder.create({
        data: {
          name: 'Feature Folder',
          type: 'FEATURE',
          projectId: testProjectId,
        }
      });

      // Create 4 requirements all in the folder (none uncategorized)
      await prisma.internalRequirement.create({
        data: { title: 'Req A', projectId: testProjectId, folderId: folder.id, authorId: testUserId }
      });
      await prisma.internalRequirement.create({
        data: { title: 'Req B', projectId: testProjectId, folderId: folder.id, authorId: testUserId }
      });
      await prisma.internalRequirement.create({
        data: { title: 'Req C', projectId: testProjectId, folderId: folder.id, authorId: testUserId }
      });
      await prisma.internalRequirement.create({
        data: { title: 'Req D', projectId: testProjectId, folderId: folder.id, authorId: testUserId }
      });

      const request = new Request(
        `http://localhost/api/requirements/folders?projectId=${testProjectId}`
      );

      await GET(request);

      const callArgs = mockJson.mock.calls[0][0];

      // rootRequirementsCount should be 4 (total), uncategorizedCount should be 0
      // Before bug fix: rootRequirementsCount would have been 0 (wrong!)
      // After bug fix: rootRequirementsCount is 4 (correct)
      expect(callArgs.rootRequirementsCount).toBe(4);
      expect(callArgs.uncategorizedCount).toBe(0);
    });

    it('should return correct count when all requirements are uncategorized', async () => {
      // Create 3 requirements all without folder
      await prisma.internalRequirement.create({
        data: { title: 'Orphan 1', projectId: testProjectId, folderId: null, authorId: testUserId }
      });
      await prisma.internalRequirement.create({
        data: { title: 'Orphan 2', projectId: testProjectId, folderId: null, authorId: testUserId }
      });
      await prisma.internalRequirement.create({
        data: { title: 'Orphan 3', projectId: testProjectId, folderId: null, authorId: testUserId }
      });

      const request = new Request(
        `http://localhost/api/requirements/folders?projectId=${testProjectId}`
      );

      await GET(request);

      const callArgs = mockJson.mock.calls[0][0];

      // Both counts should be 3 when all requirements are uncategorized
      expect(callArgs.rootRequirementsCount).toBe(3);
      expect(callArgs.uncategorizedCount).toBe(3);
    });
  });

  describe('Error handling', () => {
    it('should return 400 when projectId is missing', async () => {
      const request = new Request(
        'http://localhost/api/requirements/folders'
      );

      await GET(request);

      expect(mockJson).toHaveBeenCalledWith(
        { error: 'projectId is required' },
        { status: 400 }
      );
    });
  });

  describe('Folder tree structure', () => {
    it('should return folders with _count including requirements count', async () => {
      // Create a folder with requirements
      const folder = await prisma.requirementFolder.create({
        data: {
          name: 'Test Epic with Reqs',
          type: 'EPIC',
          projectId: testProjectId,
        }
      });

      await prisma.internalRequirement.create({
        data: { title: 'Req in folder', projectId: testProjectId, folderId: folder.id, authorId: testUserId }
      });

      const request = new Request(
        `http://localhost/api/requirements/folders?projectId=${testProjectId}`
      );

      await GET(request);

      const callArgs = mockJson.mock.calls[0][0];

      expect(callArgs.folders).toHaveLength(1);
      expect(callArgs.folders[0].name).toBe('Test Epic with Reqs');
      expect(callArgs.folders[0].type).toBe('EPIC');
      expect(callArgs.folders[0]._count).toBeDefined();
      expect(callArgs.folders[0]._count.requirements).toBe(1);
    });

    it('should build nested folder hierarchy', async () => {
      // Create parent folder (Epic)
      const epic = await prisma.requirementFolder.create({
        data: {
          name: 'Parent Epic',
          type: 'EPIC',
          projectId: testProjectId,
          order: 1,
        }
      });

      // Create child folder (Feature)
      await prisma.requirementFolder.create({
        data: {
          name: 'Child Feature',
          type: 'FEATURE',
          projectId: testProjectId,
          parentId: epic.id,
          order: 1,
        }
      });

      const request = new Request(
        `http://localhost/api/requirements/folders?projectId=${testProjectId}`
      );

      await GET(request);

      const callArgs = mockJson.mock.calls[0][0];

      // Should have 1 root folder with 1 child
      expect(callArgs.folders).toHaveLength(1);
      expect(callArgs.folders[0].name).toBe('Parent Epic');
      expect(callArgs.folders[0].children).toHaveLength(1);
      expect(callArgs.folders[0].children[0].name).toBe('Child Feature');
    });
  });
});

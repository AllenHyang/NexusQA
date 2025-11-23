import { createMocks } from 'node-mocks-http';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    testCase: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    testStep: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    executionRecord: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

describe('/api/testcases POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new test case with default reviewStatus', async () => {
    const { req } = createMocks({
      method: 'POST',
      json: async () => ({
        title: 'New Test Case',
        projectId: 'proj-1',
        description: 'Description',
      }),
    });

    (prisma.testCase.create as jest.Mock).mockResolvedValue({
      id: 'tc-1',
      title: 'New Test Case',
      reviewStatus: 'PENDING',
      tags: '[]',
      history: [],
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.reviewStatus).toBe('PENDING');
    expect(prisma.testCase.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        reviewStatus: 'PENDING',
      }),
    }));
  });

  it('should update reviewStatus when provided', async () => {
    const { req } = createMocks({
      method: 'POST',
      json: async () => ({
        id: 'tc-1',
        title: 'Updated Test Case',
        projectId: 'proj-1',
        reviewStatus: 'APPROVED',
      }),
    });

    (prisma.testCase.findUnique as jest.Mock).mockResolvedValue({
      id: 'tc-1',
      title: 'Updated Test Case',
      reviewStatus: 'APPROVED',
      tags: '[]',
      history: [],
    });

    (prisma.testCase.update as jest.Mock).mockResolvedValue({
      id: 'tc-1',
      reviewStatus: 'APPROVED',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reviewStatus).toBe('APPROVED');
    expect(prisma.testCase.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'tc-1' },
      data: expect.objectContaining({
        reviewStatus: 'APPROVED',
      }),
    }));
  });
});

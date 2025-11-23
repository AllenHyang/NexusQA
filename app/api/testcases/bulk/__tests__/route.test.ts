import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    testCase: {
      create: jest.fn(),
    },
  },
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('POST /api/testcases/bulk', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should import test cases successfully', async () => {
    const mockBody = {
      projectId: 'proj-1',
      cases: [
        { title: 'Case 1', priority: 'HIGH', tags: ['tag1'] },
        { title: 'Case 2', steps: [{ action: 'Do this', expected: 'Get that' }] },
      ],
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(mockBody),
    } as unknown as Request;

    const mockCreatedCases = [
        { id: 'tc-1', title: 'Case 1', priority: 'HIGH', tags: '["tag1"]', projectId: 'proj-1' },
        { id: 'tc-2', title: 'Case 2', projectId: 'proj-1', steps: [{ action: 'Do this', expected: 'Get that' }] },
    ];

    (prisma.$transaction as jest.Mock).mockResolvedValue(mockCreatedCases);
    (NextResponse.json as jest.Mock).mockReturnValue({ status: 201, json: () => ({ success: true }) });

    await POST(mockRequest);

    expect(prisma.$transaction).toHaveBeenCalled();
    // Verify that prisma.testCase.create would be called inside transaction (implementation detail, hard to test directly without spy on map/transaction logic)
    // Instead we check if NextResponse.json was called with success
    expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
            success: true, 
            count: 2,
            data: expect.arrayContaining([
                expect.objectContaining({ title: 'Case 1', tags: ['tag1'] }),
                expect.objectContaining({ title: 'Case 2' })
            ])
        }), 
        { status: 201 }
    );
  });

  it('should return 400 for invalid body', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;

    (NextResponse.json as jest.Mock).mockReturnValue({ status: 400 });

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith({ error: "Invalid request body" }, { status: 400 });
  });

  it('should return 500 on server error', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ projectId: 'p1', cases: [] }),
    } as unknown as Request;

    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB Error"));
    (NextResponse.json as jest.Mock).mockReturnValue({ status: 500 });

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith({ error: "Failed to import test cases" }, { status: 500 });
  });
});

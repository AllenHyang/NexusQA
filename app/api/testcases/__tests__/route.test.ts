/**
 * @jest-environment node
 */
import { GET, POST, DELETE } from '../route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => {
    const mockClient = {
        testCase: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
            updateMany: jest.fn()
        },
        testStep: {
            deleteMany: jest.fn(),
            create: jest.fn()
        },
        executionRecord: {
            deleteMany: jest.fn(),
            create: jest.fn()
        },
        $transaction: jest.fn()
    };
    // Circular reference for transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockClient.$transaction.mockImplementation((cb: any) => cb(mockClient));
    
    return { prisma: mockClient };
});

// Helper to create request
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createRequest = (method: string, body?: any, params?: Record<string, string>) => {
    let url = 'http://localhost/api/testcases';
    if (params) {
        const sp = new URLSearchParams(params);
        url += `?${sp.toString()}`;
    }
    return new Request(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
};

describe('Test Cases API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should fetch and normalize test cases', async () => {
            const mockData = [
                {
                    id: '1',
                    title: 'Test 1',
                    priority: 'P0',
                    tags: '["smoke", "login"]',
                    history: [{ date: new Date(), env: 'PROD' }]
                }
            ];
            (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockData);

            const req = createRequest('GET');
            const res = await GET(req);
            const json = await res.json();

            expect(json[0].priority).toBe('CRITICAL'); // P0 -> CRITICAL
            expect(json[0].tags).toEqual(['smoke', 'login']); // JSON parse
            expect(json[0].history[0].environment).toBe('PROD'); // Mapping
        });
    });

    describe('POST (Create)', () => {
        it('should create a test case with nested steps', async () => {
            const payload = {
                title: 'New Case',
                projectId: 'p1',
                steps: [{ action: 'Do X', expected: 'Get Y' }]
            };

            const mockCreated = { ...payload, id: 'c1', tags: '[]', history: [] };
            (prisma.testCase.create as jest.Mock).mockResolvedValue(mockCreated);

            const req = createRequest('POST', payload);
            const res = await POST(req);
            
            expect(res.status).toBe(201);
            expect(prisma.testCase.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    title: 'New Case',
                    steps: {
                        create: expect.arrayContaining([
                            expect.objectContaining({ action: 'Do X' })
                        ])
                    }
                })
            }));
        });

        it('should return 400 if title or projectId missing', async () => {
            const req = createRequest('POST', { title: 'Missing Project' });
            const res = await POST(req);
            expect(res.status).toBe(400);
        });
    });

    describe('POST (Update)', () => {
        it('should replace steps when updating', async () => {
            const payload = {
                id: 'c1',
                title: 'Updated Case',
                steps: [{ action: 'New Step', expected: 'New Result' }]
            };

            // Mock transaction result
            const mockUpdated = { ...payload, tags: '[]', history: [] };
            (prisma.testCase.findUnique as jest.Mock).mockResolvedValue(mockUpdated);

            const req = createRequest('POST', payload);
            const res = await POST(req);

            expect(res.status).toBe(200);
            
            // Verify Transaction flow
            expect(prisma.$transaction).toHaveBeenCalled();
            
            // Verify basic update
            expect(prisma.testCase.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'c1' },
                data: expect.objectContaining({ title: 'Updated Case' })
            }));

            // Verify steps replacement
            expect(prisma.testStep.deleteMany).toHaveBeenCalledWith({ where: { testCaseId: 'c1' } });
            expect(prisma.testStep.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ action: 'New Step' })
            }));
        });
    });

    describe('DELETE', () => {
        it('should delete single test case', async () => {
            const req = createRequest('DELETE', null, { id: 'c1' });
            await DELETE(req);
            expect(prisma.testCase.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
        });

        it('should bulk delete test cases', async () => {
            const req = createRequest('DELETE', null, { ids: 'c1,c2' });
            await DELETE(req);
            expect(prisma.testCase.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['c1', 'c2'] } } });
        });
    });
});

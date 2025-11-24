/**
 * @jest-environment node
 */
import { POST } from '../route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback({
      project: {
        create: jest.fn().mockResolvedValue({ id: '1', name: 'Imported Project' })
      },
      testSuite: {
        create: jest.fn().mockResolvedValue({ id: 's1', name: 'Suite 1' })
      },
      testCase: {
        create: jest.fn().mockResolvedValue({ id: 'c1', title: 'Case 1' })
      }
    }))
  }
}));

describe('POST /api/projects/import', () => {
  it('should import a project successfully', async () => {
    const body = {
      name: 'Imported Project',
      suites: [{ name: 'Suite 1' }]
    };
    const req = new Request('http://localhost/api/projects/import', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.project.name).toBe('Imported Project');
  });

  it('should return 400 if name is missing', async () => {
    const body = {
      description: 'Missing Name'
    };
    const req = new Request('http://localhost/api/projects/import', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

import { createTestPlanSlice, TestPlanSlice } from '../testPlanSlice';
import { StoreApi } from 'zustand';

describe('testPlanSlice', () => {
    let set: jest.Mock;
    let get: jest.Mock;
    let slice: TestPlanSlice;
    let storeApiMock: StoreApi<TestPlanSlice>;
    let mockState: Partial<TestPlanSlice>;

    beforeEach(() => {
        set = jest.fn();
        mockState = {};
        get = jest.fn(() => mockState);
        
        storeApiMock = {
            getState: get,
            setState: set,
            subscribe: jest.fn(),
            destroy: jest.fn(),
        };
        
        slice = createTestPlanSlice(set, get, storeApiMock);
        Object.assign(mockState, slice); // Allow get() to access the slice methods
        
        global.fetch = jest.fn();
    });

    describe('fetchPlans', () => {
        it('should fetch plans and update state', async () => {
            const mockPlans = [{ id: 'p1', name: 'Plan 1' }];
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockPlans)
            });

            await slice.fetchPlans('proj-1');

            expect(global.fetch).toHaveBeenCalledWith('/api/projects/proj-1/plans');
            expect(set).toHaveBeenCalledWith({ plans: mockPlans });
        });
    });

    describe('createPlan', () => {
        it('should create a plan and refresh the list', async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({ ok: true }) // POST /plans
                .mockResolvedValueOnce({ // GET /plans (via fetchPlans)
                    ok: true,
                    json: jest.fn().mockResolvedValue([])
                });
            
            // Spy on fetchPlans which is called internally
            const fetchPlansSpy = jest.spyOn(mockState as TestPlanSlice, 'fetchPlans');
            
            await slice.createPlan('proj-1', { name: 'New Plan' });

            expect(global.fetch).toHaveBeenCalledWith('/api/projects/proj-1/plans', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ name: 'New Plan' })
            }));
            
            expect(fetchPlansSpy).toHaveBeenCalledWith('proj-1');
        });
    });

    describe('fetchPlan', () => {
        it('should fetch a single plan details', async () => {
            const mockPlan = { id: 'p1', name: 'Plan 1', runs: [] };
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockPlan)
            });

            await slice.fetchPlan('p1');

            expect(global.fetch).toHaveBeenCalledWith('/api/plans/p1');
            expect(set).toHaveBeenCalledWith({ currentPlan: mockPlan });
        });
    });

    describe('addCasesToPlan', () => {
        it('should add cases and refresh the plan', async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({ ok: true }) // POST /cases
                .mockResolvedValueOnce({ // GET /plan (via fetchPlan)
                    ok: true,
                    json: jest.fn().mockResolvedValue({ id: 'p1', runs: [] })
                });

            const fetchPlanSpy = jest.spyOn(mockState as TestPlanSlice, 'fetchPlan');

            await slice.addCasesToPlan('p1', ['c1', 'c2']);

            expect(global.fetch).toHaveBeenCalledWith('/api/plans/p1/cases', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ caseIds: ['c1', 'c2'] })
            }));
            
            expect(fetchPlanSpy).toHaveBeenCalledWith('p1');
        });
    });

    describe('updateRunStatus', () => {
        it('should update run status via API and update local state optimisticly or via response', async () => {
            const mockUpdatedRun = { id: 'r1', status: 'PASSED' };
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockUpdatedRun)
            });
            
            // Setup initial state with a current plan
            mockState.currentPlan = { 
                id: 'p1', 
                name: 'Plan 1', 
                projectId: 'proj1', 
                createdAt: new Date(), 
                updatedAt: new Date(), 
                status: 'PLANNED',
                runs: [
                    { id: 'r1', status: 'UNTESTED', testPlanId: 'p1', testCaseId: 'c1', createdAt: new Date(), updatedAt: new Date(), executedBy: null, notes: null, executedAt: null },
                    { id: 'r2', status: 'UNTESTED', testPlanId: 'p1', testCaseId: 'c2', createdAt: new Date(), updatedAt: new Date(), executedBy: null, notes: null, executedAt: null }
                ]
            };
            
            // We need to mock get to return this specific state for this test
            get.mockReturnValue(mockState);

            await slice.updateRunStatus('r1', 'PASSED');

            expect(global.fetch).toHaveBeenCalledWith('/api/runs/r1', expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ status: 'PASSED' })
            }));

            // Check if set was called with updated runs
            expect(set).toHaveBeenCalled();
            const stateUpdate = set.mock.calls[0][0];
            expect(stateUpdate.currentPlan.runs[0].status).toBe('PASSED');
            expect(stateUpdate.currentPlan.runs[1].status).toBe('UNTESTED');
        });
    });
});

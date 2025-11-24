import { createTestCaseSlice, TestCaseSlice } from '../testCaseSlice';
import { StoreApi } from 'zustand';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock @/app/actions since it is imported in the slice
jest.mock('@/app/actions', () => ({
    generateImage: jest.fn()
}));

describe('testCaseSlice', () => {
    let set: jest.Mock;
    let get: jest.Mock;
    let slice: TestCaseSlice;
    let storeApiMock: StoreApi<TestCaseSlice>;

    beforeEach(() => {
        set = jest.fn();
        get = jest.fn();
        // Correctly mock StoreApi for createTestCaseSlice
        storeApiMock = {
            getState: get,
            setState: set,
            subscribe: jest.fn(),
            destroy: jest.fn(),
        };
        slice = createTestCaseSlice(set, get, storeApiMock);
        global.fetch = jest.fn();
    });

    describe('generateStepsForCase', () => {
        it('should parse streamed JSON steps correctly', async () => {
            // Mock simple text response (non-streaming)
            const mockTextResponse = '{"action":"Click Login","expected":"Login Form"}\n{"action":"Type User","expected":"User Entered"}';

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                text: jest.fn().mockResolvedValue(mockTextResponse),
                json: jest.fn()
            });

            const setEditCase = jest.fn();
            const onAIError = jest.fn();

            await slice.generateStepsForCase('Test Title', 'Test Desc', setEditCase, onAIError);

            expect(onAIError).not.toHaveBeenCalled();
            expect(setEditCase).toHaveBeenCalled();
            
            // Get the last call argument
            const lastCallArgs = setEditCase.mock.calls[setEditCase.mock.calls.length - 1][0];
            expect(lastCallArgs.steps).toHaveLength(2);
            expect(lastCallArgs.steps[0]).toMatchObject({ action: 'Click Login', expected: 'Login Form' });
            expect(lastCallArgs.steps[1]).toMatchObject({ action: 'Type User', expected: 'User Entered' });
        });

        it('should handle API errors gracefully', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                json: jest.fn().mockResolvedValue({ error: 'AI Service Down' })
            });

            const setEditCase = jest.fn();
            const onAIError = jest.fn();

            await slice.generateStepsForCase('Test', 'Desc', setEditCase, onAIError);

            expect(onAIError).toHaveBeenCalledWith('AI Service Down');
        });
    });

    describe('saveTestCase', () => {
        it('should create a new test case correctly', async () => {
            const mockCase = { title: 'New Case' };
            const mockResponse = { id: '123', title: 'New Case' };

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse)
            });

            // Initialize state with empty list
            // We need to capture the updater function passed to 'set'
            await slice.saveTestCase(mockCase);

            expect(global.fetch).toHaveBeenCalledWith('/api/testcases', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockCase)
            }));

            // Verify set was called
            expect(set).toHaveBeenCalled();
            
            // Execute the state updater function
            const updater = set.mock.calls[0][0];
            const prevState = { testCases: [] };
            const newState = updater(prevState);

            expect(newState.testCases).toHaveLength(1);
            expect(newState.testCases[0]).toEqual(mockResponse);
        });
    });

    describe('deleteTestCase', () => {
        it('should delete a test case by id', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
            // Initial state
            const initialState = { testCases: [{ id: '1', title: 'Case 1' }, { id: '2', title: 'Case 2' }] };
            
            await slice.deleteTestCase('1');

            expect(global.fetch).toHaveBeenCalledWith('/api/testcases?id=1', { method: 'DELETE' });
            
            const stateUpdater = set.mock.calls[set.mock.calls.length - 1][0];
            const newState = stateUpdater(initialState);
            expect(newState.testCases).toHaveLength(1);
            expect(newState.testCases[0].id).toBe('2');
        });
    });

    describe('bulkDeleteTestCases', () => {
        it('should delete multiple test cases by ids', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const initialState = { testCases: [{ id: '1' }, { id: '2' }, { id: '3' }] };
            
            await slice.bulkDeleteTestCases(['1', '3']);

            expect(global.fetch).toHaveBeenCalledWith('/api/testcases?ids=1,3', { method: 'DELETE' });

            const stateUpdater = set.mock.calls[set.mock.calls.length - 1][0];
            const newState = stateUpdater(initialState);
            expect(newState.testCases).toHaveLength(1);
            expect(newState.testCases[0].id).toBe('2');
        });
    });

    describe('bulkUpdateStatus', () => {
        it('should update status for multiple test cases', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const initialState = { testCases: [{ id: '1', status: 'DRAFT' }, { id: '2', status: 'DRAFT' }] };

            await slice.bulkUpdateStatus(['1'], 'PASSED');

            expect(global.fetch).toHaveBeenCalledWith('/api/testcases', expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({ ids: ['1'], updates: { status: 'PASSED' } })
            }));

            const stateUpdater = set.mock.calls[set.mock.calls.length - 1][0];
            const newState = stateUpdater(initialState);
            expect(newState.testCases[0].status).toBe('PASSED');
            expect(newState.testCases[1].status).toBe('DRAFT');
        });
    });

    describe('Suite Operations', () => {
        it('should create a suite', async () => {
            const newSuite = { id: 's1', name: 'New Suite' };
            (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue(newSuite) });
            const initialState = { suites: [] };

            await slice.createSuite('p1', null, 'New Suite');

            const stateUpdater = set.mock.calls[set.mock.calls.length - 1][0];
            const newState = stateUpdater(initialState);
            expect(newState.suites).toContainEqual(newSuite);
        });

        it('should rename a suite', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const initialState = { suites: [{ id: 's1', name: 'Old Name' }] };

            await slice.renameSuite('s1', 'New Name');

            expect(global.fetch).toHaveBeenCalledWith('/api/suites', expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({ id: 's1', name: 'New Name' })
            }));

            const stateUpdater = set.mock.calls[set.mock.calls.length - 1][0];
            const newState = stateUpdater(initialState);
            expect(newState.suites[0].name).toBe('New Name');
        });

        it('should delete a suite', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const initialState = { suites: [{ id: 's1' }, { id: 's2' }] };

            await slice.deleteSuite('s1');

            expect(global.fetch).toHaveBeenCalledWith('/api/suites?id=s1', { method: 'DELETE' });

            const stateUpdater = set.mock.calls[set.mock.calls.length - 1][0];
            const newState = stateUpdater(initialState);
            expect(newState.suites).toHaveLength(1);
            expect(newState.suites[0].id).toBe('s2');
        });
    });
});
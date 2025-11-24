import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectDetailPage from '@/app/project/[projectId]/page';
import { useAppStore } from '@/store/useAppStore';
import { useUI } from '@/contexts/UIContext';
import { useParams, useRouter } from 'next/navigation';

// Mock the store and context hooks
jest.mock('@/store/useAppStore');
jest.mock('@/contexts/UIContext');
jest.mock('@/app/actions', () => ({
  generateImage: jest.fn(),
  generateAvatar: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock global URL.createObjectURL inside describe or beforeAll to avoid top-level side effects if possible, 
// but global setup is common. To fix lint, we wrap in beforeAll.

describe('ProjectDetailPage - Export Functionality', () => {
  const mockClick = jest.fn();
  const mockSetAttribute = jest.fn();
  const mockAnchor = {
    click: mockClick,
    setAttribute: mockSetAttribute,
    style: {},
  } as unknown as HTMLAnchorElement;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.URL.createObjectURL as any) = jest.fn(() => 'mock-url');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.URL.revokeObjectURL as any) = jest.fn();
  });
  const mockProject = { id: 'p1', name: 'Test Project', description: 'Test Desc' };
  const mockTestCases = [
    { id: 'tc1', projectId: 'p1', title: 'Test Case 1', description: 'TC Desc 1' },
    { id: 'tc2', projectId: 'p1', title: 'Test Case 2', description: 'TC Desc 2' },
  ];
  const mockSuites = [
    { id: 's1', projectId: 'p1', name: 'Suite 1' },
  ];
  const mockCurrentUser = { id: 'u1', name: 'Test User', role: 'ADMIN' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ projectId: 'p1' });
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      projects: [mockProject],
      testCases: mockTestCases,
      suites: mockSuites,
      plans: [],
      currentUser: mockCurrentUser,
      users: [],
      // Mock other store functions to prevent errors
      deleteTestCase: jest.fn(),
      bulkDeleteTestCases: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      bulkMoveTestCases: jest.fn(),
      createSuite: jest.fn(),
      renameSuite: jest.fn(),
      deleteSuite: jest.fn(),
      fetchPlans: jest.fn(),
      createPlan: jest.fn(),
      addCasesToPlan: jest.fn(),
      deleteProject: jest.fn(),
    });
    (useUI as unknown as jest.Mock).mockReturnValue({
      openTestCaseModal: jest.fn(),
      openHistoryModal: jest.fn(),
      openImportCasesModal: jest.fn(),
      searchQuery: '',
    });

    // Spy on document methods
    const originalAppendChild = document.body.appendChild.bind(document.body);
    const originalRemoveChild = document.body.removeChild.bind(document.body);
    const originalCreateElement = document.createElement.bind(document);

    jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        if (node === mockAnchor) return mockAnchor;
        return originalAppendChild(node);
    });
    jest.spyOn(document.body, 'removeChild').mockImplementation((node) => {
        if (node === mockAnchor) return mockAnchor;
        return originalRemoveChild(node);
    });
    
    jest.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'a') return mockAnchor;
      return originalCreateElement(tagName, options);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('triggers file download with correct data on export', async () => {
    render(<ProjectDetailPage />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton); // Open the dropdown

    const jsonExportButton = screen.getByText('JSON Export');
    fireEvent.click(jsonExportButton); // Click the JSON Export option

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('Test Project_export.json');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockClick).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
    });

    // Verify the content of the exported file
    const blobCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
    const reader = new FileReader();
    const promise = new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
    });
    reader.readAsText(blobCall);
    const content = await promise;
    
    const parsedContent = JSON.parse(content as string);
    expect(parsedContent).toEqual({
      ...mockProject,
      testCases: mockTestCases,
      suites: mockSuites,
    });
  });
});

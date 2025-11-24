import { generateExcelExport } from '../exportGenerator';
import * as XLSX from 'xlsx';
import { Project, TestCase, TestSuite } from '@/types';

// Mock the xlsx module
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

describe('generateExcelExport', () => {
  const mockProject: Project = {
    id: 'p1',
    name: 'Test Project',
    description: 'Test Description',
    createdAt: '2023-01-01T00:00:00Z',
  };

  const mockSuites: TestSuite[] = [
    { id: 's1', projectId: 'p1', name: 'Login Suite', createdAt: '2023-01-01T00:00:00Z' },
  ];

  const mockTestCases: TestCase[] = [
    {
      id: 'tc1',
      projectId: 'p1',
      suiteId: 's1',
      title: 'Valid Login',
      description: 'User can login with valid credentials',
      status: 'PASSED',
      priority: 'HIGH',
      preconditions: 'User exists',
      steps: [
        { id: 'step1', action: 'Enter username', expected: 'Field filled', order: 0 },
        { id: 'step2', action: 'Enter password', expected: 'Field filled', order: 1 },
      ],
      authorId: 'u1',
      tags: ['smoke', 'login'],
      history: [],
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
    },
    {
      id: 'tc2',
      projectId: 'p1',
      // No suiteId, so it's in Root
      title: 'Invalid Login',
      description: 'User cannot login with invalid credentials',
      status: 'UNTESTED',
      priority: 'MEDIUM',
      preconditions: '',
      steps: [],
      authorId: 'u1',
      tags: [],
      history: [],
      createdAt: '2023-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate an Excel file with the correct data', () => {
    // Mock implementations for xlsx utils
    const mockWorksheet = { '!ref': 'A1:Z100' };
    const mockWorkbook = { SheetNames: [], Sheets: {} };
    
    (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
    (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);

    generateExcelExport(mockProject, mockTestCases, mockSuites);

    // 1. Verify data transformation (implicit via json_to_sheet call)
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledTimes(1);
    const passedRows = (XLSX.utils.json_to_sheet as jest.Mock).mock.calls[0][0];
    
    expect(passedRows).toHaveLength(2);
    
    // Check first row (tc1)
    expect(passedRows[0]).toEqual(expect.objectContaining({
      'ID': 'tc1',
      'Title': 'Valid Login',
      'Suite/Folder': 'Login Suite',
      'Status': 'PASSED',
      'Steps': '1. Enter username -> Field filled\n2. Enter password -> Field filled',
      'Tags': 'smoke, login',
    }));

    // Check second row (tc2)
    expect(passedRows[1]).toEqual(expect.objectContaining({
      'ID': 'tc2',
      'Title': 'Invalid Login',
      'Suite/Folder': '(Root)',
      'Steps': '',
      'Tags': '',
    }));

    // 2. Verify workbook creation and appending
    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
      mockWorkbook,
      mockWorksheet,
      'Test Cases'
    );

    // 3. Verify file write
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      mockWorkbook,
      'Test Project_export.xlsx'
    );
  });
});

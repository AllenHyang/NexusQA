import * as XLSX from 'xlsx';
import { Project, TestCase, TestSuite } from '../types';

export const generateExcelExport = (project: Project, testCases: TestCase[], suites: TestSuite[]): void => {
  // 1. Flatten Test Cases for the sheet
  const rows = testCases.map(tc => {
    const suite = suites.find(s => s.id === tc.suiteId);
    
    // Format steps as a readable string
    const stepsFormatted = tc.steps.map((s, i) => 
      `${i + 1}. ${s.action} -> ${s.expected}`
    ).join('\n');

    // Format tags
    const tagsFormatted = tc.tags ? tc.tags.join(', ') : '';

    return {
      'ID': tc.id,
      'Title': tc.title,
      'Description': tc.description,
      'Suite/Folder': suite ? suite.name : '(Root)',
      'Status': tc.status,
      'Priority': tc.priority,
      'Preconditions': tc.preconditions,
      'Steps': stepsFormatted,
      'Expected Result': '', // Usually part of steps, but sometimes separate. We put it in steps.
      'User Story': tc.userStory,
      'Requirement ID': tc.requirementId,
      'Tags': tagsFormatted,
      'Assigned To': tc.assignedToId, // Would need user map to get name, but ID is okay for now
      'Created At': tc.createdAt,
      'Updated At': tc.updatedAt,
    };
  });

  // 2. Create Worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // 3. Create Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Cases');

  // 4. Generate Buffer and Download
  XLSX.writeFile(workbook, `${project.name}_export.xlsx`);
};

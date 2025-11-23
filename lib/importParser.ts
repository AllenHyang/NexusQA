import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Priority } from '@/types';

export interface ImportedTestCase {
  title: string;
  description?: string;
  preconditions?: string;
  priority?: Priority;
  tags?: string[];
  userStory?: string;
  requirementId?: string;
  steps?: Array<{ action: string; expected: string }>;
}

export const parseFile = (file: File): Promise<ImportedTestCase[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target?.result;
      if (!data) {
        return reject(new Error("File reading failed."));
      }
      if (file.name.endsWith('.csv')) {
        Papa.parse(data as string, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length) {
              return reject(new Error(results.errors[0].message));
            }
            resolve(mapParsedDataToTestCases(results.data, true)); // Pass true for isCsv
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error: (err: any) => reject(err),
        });
      } else if (file.name.endsWith('.xlsx')) {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolve(mapParsedDataToTestCases(json as any[], false)); // Pass false for isCsv
      } else {
        reject(new Error("Unsupported file type. Only CSV and XLSX are supported.")); // Corrected error message
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reader.onerror = (error: any) => {
      reject(error.target?.error || error);
    };

    if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
      reader.readAsArrayBuffer(file);
    } else {
      // This else block is for initial file type check, but the error handling is now duplicated.
      // It's better to readAsArrayBuffer first and then reject if not CSV/XLSX within onload for consistent error flow.
      // For now, aligning the error message here.
      reject(new Error("Unsupported file type. Only CSV and XLSX are supported."));
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapParsedDataToTestCases = (data: any[], isCsv: boolean): ImportedTestCase[] => {
  if (!data || data.length === 0) return [];

  let headers: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rows: any[];

  if (isCsv) {
    // For CSV, data is an array of objects
    headers = Object.keys(data[0]);
    rows = data;
  } else {
    // For XLSX, data is an array of arrays (first array is header)
    headers = data[0] as string[];
    rows = data.slice(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((row: any) => {
    const testCase: ImportedTestCase = {
      title: isCsv ? row['Title'] : row[headers.indexOf('Title')] || 'Untitled Test Case',
      description: isCsv ? row['Description'] : row[headers.indexOf('Description')] || undefined,
      preconditions: isCsv ? row['Preconditions'] : row[headers.indexOf('Preconditions')] || undefined,
      priority: (isCsv ? row['Priority'] : row[headers.indexOf('Priority')] as Priority) || 'P2',
      tags: parseTags(isCsv ? row['Tags'] : row[headers.indexOf('Tags')] as string),
      userStory: isCsv ? row['User Story'] : row[headers.indexOf('User Story')] || undefined,
      requirementId: isCsv ? row['Requirement ID'] : row[headers.indexOf('Requirement ID')] || undefined,
      steps: parseSteps(isCsv ? row['Steps'] : row[headers.indexOf('Steps')] as string),
    };
    return testCase;
  });
};

const parseTags = (tagsString?: string): string[] | undefined => {
  if (!tagsString) return undefined;
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
};

const parseSteps = (stepsString?: string): Array<{ action: string; expected: string }> | undefined => {
  if (!stepsString) return undefined;
  
  return stepsString.split(/\r?\n/).map(line => {
    const parts = line.split('->').map(p => p.trim());
    return { action: parts[0] || '', expected: parts[1] || '' };
  }).filter(step => step.action.length > 0);
};
import { parseFile } from '../importParser';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

  // Helper function to create a mock File object that stores content
  const createMockFile = (name: string, content: string | ArrayBuffer, type: string): File => {
    const blob = new Blob([content], { type });
    // Attach content directly to the mock File object for easy access in FileReader mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = new File([blob], name, { type }) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (file as any)._content = content; // Custom property to hold content
    return file;
  };

describe('importParser', () => {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockFileReaderInstance: any;

  beforeEach(() => {
    jest.spyOn(window, 'FileReader').mockImplementation(() => {
      mockFileReaderInstance = {
        _onload: jest.fn(),
        _onerror: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        set onload(cb: Function) { this._onload = cb; },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        set onerror(cb: Function) { this._onerror = cb; },
        readAsArrayBuffer: jest.fn(function(file: File) {
          setTimeout(() => { // Simulate async read
            if (file.name.startsWith('read-error')) {
              mockFileReaderInstance._onerror({ target: { error: new Error("Read error") } });
            } else if (file.name === 'unsupported.txt') {
              mockFileReaderInstance._onerror({ target: { error: new Error("Unsupported file type. Only CSV and XLSX are supported.") } });
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              mockFileReaderInstance._onload({ target: { result: (file as any)._content } });
            }
          }, 0);
        }),
        readAsText: jest.fn(function(file: File) {
          setTimeout(() => { // Simulate async read
            if (file.name.startsWith('read-error')) {
              mockFileReaderInstance._onerror({ target: { error: new Error("Read error") } });
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              mockFileReaderInstance._onload({ target: { result: (file as any)._content } });
            }
          }, 0);
        }),
      };
      return mockFileReaderInstance;
    });
    // Spy on PapaParse method
    jest.spyOn(Papa, 'parse');

    // Clear mock for XLSX since it's a module mock
    (XLSX.read as jest.Mock).mockClear();
    (XLSX.utils.sheet_to_json as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseFile - CSV', () => {
    it('should parse a CSV file correctly', async () => {
      const mockCsvContent = "Title,Description,Priority,Tags,Steps\nTest Case 1,Desc 1,HIGH,\"tag1,tag2\",\"Step 1 -> Exp 1\nStep 2 -> Exp 2\"\nTest Case 2,Desc 2,MEDIUM,\"tag3\",\"Step A -> Exp A\"";
      const mockFile = createMockFile('test.csv', mockCsvContent, 'text/csv');

      const promise = parseFile(mockFile);
      await new Promise(process.nextTick);

      // Simulate FileReader onload completing for CSV after setTimeout has fired
      // No need to explicitly call mockFileReaderInstance._onload here, as readAsArrayBuffer does it.
      
      const result = await promise;

      expect(Papa.parse).toHaveBeenCalledWith(mockCsvContent, expect.any(Object));
      expect(result).toEqual([
        { title: 'Test Case 1', description: 'Desc 1', priority: 'HIGH', tags: ['tag1', 'tag2'], steps: [{ action: 'Step 1', expected: 'Exp 1' }, { action: 'Step 2', expected: 'Exp 2' }] },
        { title: 'Test Case 2', description: 'Desc 2', priority: 'MEDIUM', tags: ['tag3'], steps: [{ action: 'Step A', expected: 'Exp A' }] },
      ]);
    });

    it('should handle CSV parsing errors', async () => {
      const mockCsvContent = "invalid csv";
      const mockFile = createMockFile('test.csv', mockCsvContent, 'text/csv');

      (Papa.parse as jest.Mock).mockImplementationOnce((csvString, options) => {
        options.complete({ data: [], errors: [{ message: 'Parse error' }] });
      });

      const promise = parseFile(mockFile);
      await new Promise(process.nextTick);

      await expect(promise).rejects.toThrow('Parse error');
    });
  });

  describe('parseFile - XLSX', () => {
    it('should parse an XLSX file correctly', async () => {
      const mockXlsxContent = new ArrayBuffer(8); // Mock binary content
      const mockFile = createMockFile('test.xlsx', mockXlsxContent, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      (XLSX.read as jest.Mock).mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([
        ['Title', 'Description', 'Priority', 'Tags', 'Steps'],
        ['XLSX Case 1', 'XLSX Desc 1', 'LOW', 'tagX,tagY', 'Step X -> Exp X'],
      ]);

      const promise = parseFile(mockFile);
      await new Promise(process.nextTick);

      const result = await promise;

      expect(XLSX.read).toHaveBeenCalledWith(mockXlsxContent, { type: 'array' });
      expect(XLSX.utils.sheet_to_json).toHaveBeenCalledWith(expect.any(Object), { header: 1 });
      expect(result).toEqual([
        { title: 'XLSX Case 1', description: 'XLSX Desc 1', priority: 'LOW', tags: ['tagX', 'tagY'], steps: [{ action: 'Step X', expected: 'Exp X' }] },
      ]);
    });
  });

  it('should reject for unsupported file types', async () => {
    const mockFile = createMockFile('unsupported.txt', 'some content', 'text/plain');
    const promise = parseFile(mockFile);
    await new Promise(process.nextTick);
    await expect(promise).rejects.toThrow("Unsupported file type. Only CSV and XLSX are supported.");
  });

  it('should reject if file reading fails', async () => {
    const mockFile = createMockFile('read-error.csv', 'some content', 'text/csv'); // Using read-error.csv to trigger onerror
    const promise = parseFile(mockFile);
    await new Promise(process.nextTick);
    await expect(promise).rejects.toThrow("Read error");
  });
});

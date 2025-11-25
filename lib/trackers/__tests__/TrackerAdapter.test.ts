import { JiraAdapter, GenericAdapter } from '../index';

describe('JiraAdapter', () => {
  const adapter = new JiraAdapter('https://jira.example.com');

  it('should identify itself as Jira', () => {
    expect(adapter.getTrackerName()).toBe('Jira');
  });

  it('should validate correct Jira IDs', () => {
    expect(adapter.validateId('PROJ-123')).toBe(true);
    expect(adapter.validateId('QA-1')).toBe(true);
  });

  it('should reject invalid Jira IDs', () => {
    expect(adapter.validateId('123')).toBe(false);
    expect(adapter.validateId('PROJ')).toBe(false);
    // default regex expects uppercase
    expect(adapter.validateId('proj-123')).toBe(false); 
  });

  it('should generate correct issue URLs', () => {
    expect(adapter.generateUrl('PROJ-123')).toBe('https://jira.example.com/browse/PROJ-123');
  });

  it('should handle trailing slash in base URL', () => {
    const slashAdapter = new JiraAdapter('https://jira.example.com/');
    expect(slashAdapter.generateUrl('PROJ-123')).toBe('https://jira.example.com/browse/PROJ-123');
  });
});

describe('GenericAdapter', () => {
  const adapter = new GenericAdapter('https://tracker.com');

  it('should identify itself as Generic', () => {
    expect(adapter.getTrackerName()).toBe('Generic');
  });

  it('should validate any non-empty ID', () => {
    expect(adapter.validateId('123')).toBe(true);
    expect(adapter.validateId('abc')).toBe(true);
    expect(adapter.validateId('')).toBe(false);
  });

  it('should generate generic issue URLs', () => {
    expect(adapter.generateUrl('123')).toBe('https://tracker.com/issues/123');
  });
});

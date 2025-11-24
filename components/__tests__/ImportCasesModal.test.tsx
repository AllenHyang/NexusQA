import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImportCasesModal } from '../ImportCasesModal';
import '@testing-library/jest-dom';

// Mock the parseFile function since we don't need to test parsing here
jest.mock('@/lib/importParser', () => ({
  parseFile: jest.fn(),
}));

describe('ImportCasesModal', () => {
  const mockOnClose = jest.fn();
  const mockOnImport = jest.fn();
  const projectId = 'test-project-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the download template link', () => {
    render(
      <ImportCasesModal
        onClose={mockOnClose}
        projectId={projectId}
        onImport={mockOnImport}
      />
    );

    const downloadLink = screen.getByText('Download Template');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink.closest('a')).toHaveAttribute('href', '/templates/import_template.csv');
    expect(downloadLink.closest('a')).toHaveAttribute('download');
  });
});

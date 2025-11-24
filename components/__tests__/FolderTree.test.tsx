import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FolderTree } from '../FolderTree';
import { TestSuite } from '../../types';

// Mock Tooltip component since it's a UI component dependency
jest.mock('../../components/ui', () => ({
  // Mock Tooltip to render its children with an accessible name derived from 'content'
  Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => (
    // Assuming children is a single element, clone it and add aria-label
    React.cloneElement(children as React.ReactElement, { 'aria-label': content })
  ),
}));

describe('FolderTree', () => {
  const mockSuites: TestSuite[] = [
    { id: '1', name: 'Suite A', projectId: 'proj1', parentId: null },
    { id: '2', name: 'Suite B', projectId: 'proj1', parentId: null },
    { id: '3', name: 'Suite C', projectId: 'proj1', parentId: null },
  ];

  const mockOnSelect = jest.fn();
  const mockOnCreate = jest.fn();
  const mockOnRename = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "All Cases" and suite folders correctly', () => {
    render(
      <FolderTree
        suites={mockSuites}
        selectedSuiteId={null}
        onSelect={mockOnSelect}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('All Cases')).toBeInTheDocument();
    expect(screen.getByText('Suite A')).toBeInTheDocument();
    expect(screen.getByText('Suite B')).toBeInTheDocument();
    expect(screen.getByText('Suite C')).toBeInTheDocument();
  });

  it('calls onSelect when "All Cases" is clicked', () => {
    render(
      <FolderTree
        suites={mockSuites}
        selectedSuiteId="1"
        onSelect={mockOnSelect}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('All Cases'));
    expect(mockOnSelect).toHaveBeenCalledWith(null);
  });

  it('calls onSelect when a suite folder is clicked', () => {
    render(
      <FolderTree
        suites={mockSuites}
        selectedSuiteId={null}
        onSelect={mockOnSelect}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Suite B'));
    expect(mockOnSelect).toHaveBeenCalledWith('2');
  });

  it('allows creating a new folder', async () => {
    render(
      <FolderTree
        suites={mockSuites}
        selectedSuiteId={null}
        onSelect={mockOnSelect}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /new folder/i }));

    const input = screen.getByPlaceholderText('Suite Name...');
    fireEvent.change(input, { target: { value: 'New Test Suite' } });
    fireEvent.submit(input); // Submit on form, or blur on input to trigger handleCreate

    await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith(null, 'New Test Suite');
    });
  });

  it('allows renaming a folder', async () => {
    render(
      <FolderTree
        suites={mockSuites}
        selectedSuiteId={null}
        onSelect={mockOnSelect}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
      />
    );

    // Find Suite A and click MoreHorizontal to show actions
    const suiteA = screen.getByText('Suite A');
    const moreActionsButton = suiteA.closest('.flex')?.querySelector('button');
    if (moreActionsButton) {
      fireEvent.click(moreActionsButton);
    }

    // Click Rename
    fireEvent.click(screen.getByText('Rename'));

    const input = screen.getByDisplayValue('Suite A');
    fireEvent.change(input, { target: { value: 'Renamed Suite A' } });
    fireEvent.submit(input); // Submit on form, or blur on input to trigger handleRename

    await waitFor(() => {
        expect(mockOnRename).toHaveBeenCalledWith('1', 'Renamed Suite A');
    });
  });

  it('allows deleting a folder', async () => {
    render(
      <FolderTree
        suites={mockSuites}
        selectedSuiteId={null}
        onSelect={mockOnSelect}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
      />
    );

    // Find Suite B and click MoreHorizontal to show actions
    const suiteB = screen.getByText('Suite B');
    const moreActionsButton = suiteB.closest('.flex')?.querySelector('button');
    if (moreActionsButton) {
      fireEvent.click(moreActionsButton);
    }

    // Click Delete
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith('2');
    });
  });

});
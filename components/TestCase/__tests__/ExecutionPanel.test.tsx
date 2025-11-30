import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExecutionPanel } from '../ExecutionPanel';

describe('ExecutionPanel', () => {
  const mockSetEnv = jest.fn();
  const mockSetEvidence = jest.fn();
  const mockSetNote = jest.fn();

  const mockOnSelectDefectId = jest.fn();
  const mockOnNewDefectData = jest.fn();
  const mockOnExecute = jest.fn().mockResolvedValue(undefined);
  const mockOnStagedFilesChange = jest.fn();

  const defaultProps = {
    env: 'QA',
    setEnv: mockSetEnv,
    evidence: '',
    setEvidence: mockSetEvidence,
    note: '',
    setNote: mockSetNote,

    stagedFiles: [] as File[],
    onStagedFilesChange: mockOnStagedFilesChange,

    projectDefects: [],
    selectedDefectId: null,
    onSelectDefectId: mockOnSelectDefectId,
    newDefectData: null,
    onNewDefectData: mockOnNewDefectData,

    onExecute: mockOnExecute,
    reviewStatus: 'APPROVED' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all fields correctly including DefectSelector', () => {
    render(<ExecutionPanel {...defaultProps} />);

    expect(screen.getByPlaceholderText('Environment (e.g. Chrome, QA Server)')).toHaveValue('QA');
    expect(screen.getByPlaceholderText('Execution Notes...')).toHaveValue('');

    // Check DefectSelector presence
    expect(screen.getByText('Create New')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Defect Title')).toBeInTheDocument();
  });

  it('calls onExecute with PASSED when Pass button is clicked and confirmed', async () => {
    render(<ExecutionPanel {...defaultProps} />);
    // First select the status
    fireEvent.click(screen.getByText('Pass'));
    // Then confirm the execution
    fireEvent.click(screen.getByText('Save Execution Result'));
    await waitFor(() => {
      expect(mockOnExecute).toHaveBeenCalledWith('PASSED');
    });
  });

  it('calls onExecute with FAILED when Fail button is clicked and confirmed', async () => {
    render(<ExecutionPanel {...defaultProps} />);
    // First select the status
    fireEvent.click(screen.getByText('Fail'));
    // Then confirm the execution
    fireEvent.click(screen.getByText('Save Execution Result'));
    await waitFor(() => {
      expect(mockOnExecute).toHaveBeenCalledWith('FAILED');
    });
  });
});
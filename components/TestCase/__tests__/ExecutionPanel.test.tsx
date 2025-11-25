import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExecutionPanel } from '../ExecutionPanel';

describe('ExecutionPanel', () => {
  const mockSetEnv = jest.fn();
  const mockSetEvidence = jest.fn();
  const mockSetNote = jest.fn();
  
  const mockSetDefectExternalId = jest.fn();
  const mockSetDefectTracker = jest.fn();
  const mockSetDefectSeverity = jest.fn();
  const mockSetDefectStatus = jest.fn();
  const mockSetDefectUrl = jest.fn();

  const mockOnExecute = jest.fn();

  const defaultProps = {
    env: 'QA',
    setEnv: mockSetEnv,
    evidence: '',
    setEvidence: mockSetEvidence,
    note: '',
    setNote: mockSetNote,
    
    defectExternalId: '',
    setDefectExternalId: mockSetDefectExternalId,
    defectTracker: 'Jira',
    setDefectTracker: mockSetDefectTracker,
    defectSeverity: 'S2',
    setDefectSeverity: mockSetDefectSeverity,
    defectStatus: 'OPEN',
    setDefectStatus: mockSetDefectStatus,
    defectUrl: '',
    setDefectUrl: mockSetDefectUrl,

    onExecute: mockOnExecute,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all fields correctly', () => {
    render(<ExecutionPanel {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Env (e.g. Chrome)')).toHaveValue('QA');
    expect(screen.getByPlaceholderText('Evidence URL')).toHaveValue('');
    expect(screen.getByPlaceholderText('Execution Notes...')).toHaveValue('');
    expect(screen.getByPlaceholderText('Defect ID (e.g. JIRA-123)')).toHaveValue('');
  });

  it('calls onExecute with PASSED when Pass button is clicked', () => {
    render(<ExecutionPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('Pass'));
    expect(mockOnExecute).toHaveBeenCalledWith('PASSED');
  });

  it('calls onExecute with FAILED when Fail button is clicked', () => {
    render(<ExecutionPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('Fail'));
    expect(mockOnExecute).toHaveBeenCalledWith('FAILED');
  });

  it('calls onExecute with BLOCKED when Block button is clicked', () => {
    render(<ExecutionPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('Block'));
    expect(mockOnExecute).toHaveBeenCalledWith('BLOCKED');
  });

  it('calls onExecute with SKIPPED when Skip button is clicked', () => {
    render(<ExecutionPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('Skip'));
    expect(mockOnExecute).toHaveBeenCalledWith('SKIPPED');
  });
});
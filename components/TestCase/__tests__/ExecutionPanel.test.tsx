import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExecutionPanel } from '../ExecutionPanel';

describe('ExecutionPanel', () => {
  const mockSetEnv = jest.fn();
  const mockSetEvidence = jest.fn();
  const mockSetNote = jest.fn();
  const mockSetBugId = jest.fn();
  const mockOnExecute = jest.fn();

  const defaultProps = {
    env: 'QA',
    setEnv: mockSetEnv,
    evidence: '',
    setEvidence: mockSetEvidence,
    note: '',
    setNote: mockSetNote,
    bugId: '',
    setBugId: mockSetBugId,
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
    expect(screen.getByPlaceholderText('Bug ID / Jira Ticket (Mandatory for FAILED)')).toHaveValue('');
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

  it('applies warning style to Bug ID input when empty', () => {
     render(<ExecutionPanel {...defaultProps} bugId="" />);
     const input = screen.getByPlaceholderText('Bug ID / Jira Ticket (Mandatory for FAILED)');
     expect(input).toHaveClass('border-red-200');
  });

  it('does not apply warning style to Bug ID input when filled', () => {
    render(<ExecutionPanel {...defaultProps} bugId="BUG-123" />);
    const input = screen.getByPlaceholderText('Bug ID / Jira Ticket (Mandatory for FAILED)');
    expect(input).not.toHaveClass('border-red-200');
    expect(input).toHaveClass('border-zinc-200');
 });
});

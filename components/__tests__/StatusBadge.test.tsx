import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBadge } from '../ui';

describe('StatusBadge', () => {
  it('renders PASSED status correctly', () => {
    render(<StatusBadge status="PASSED" />);
    const badge = screen.getByText('PASSED');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
  });

  it('renders FAILED status correctly', () => {
    render(<StatusBadge status="FAILED" />);
    const badge = screen.getByText('FAILED');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100');
  });

  it('renders SKIPPED status correctly', () => {
    render(<StatusBadge status="SKIPPED" />);
    const badge = screen.getByText('SKIPPED');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-500');
    expect(badge).toHaveClass('italic');
  });

  it('renders default styling for unknown status', () => {
    // Cast to any to simulate unknown status from API or other source
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<StatusBadge status={"UNKNOWN" as any} />);
    const badge = screen.getByText('UNKNOWN');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-zinc-100'); // Matches DRAFT styling which is default fallback in logic
  });

  it('renders with PENDING review status', () => {
    render(<StatusBadge status="PASSED" reviewStatus="PENDING" />);
    const reviewBadge = screen.getByText('PENDING');
    expect(reviewBadge).toBeInTheDocument();
    expect(reviewBadge).toHaveClass('bg-yellow-100');
  });

  it('renders with APPROVED review status', () => {
    render(<StatusBadge status="PASSED" reviewStatus="APPROVED" />);
    const reviewBadge = screen.getByText('APPROVED');
    expect(reviewBadge).toBeInTheDocument();
    expect(reviewBadge).toHaveClass('bg-blue-100');
  });

  it('renders with CHANGES_REQUESTED review status', () => {
    render(<StatusBadge status="PASSED" reviewStatus="CHANGES_REQUESTED" />);
    const reviewBadge = screen.getByText('CHANGES_REQUESTED');
    expect(reviewBadge).toBeInTheDocument();
    expect(reviewBadge).toHaveClass('bg-red-100');
  });
});

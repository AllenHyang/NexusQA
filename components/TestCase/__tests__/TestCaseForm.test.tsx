import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestCaseForm } from '../TestCaseForm';
import { TestCase, TestSuite, User } from '@/types';

describe('TestCaseForm', () => {
  const mockSetEditCase = jest.fn();
  const mockSuites: TestSuite[] = [
    { id: 'suite-1', projectId: 'project-1', name: 'Smoke Tests', createdAt: '2025-01-01' },
    { id: 'suite-2', projectId: 'project-1', name: 'Regression Tests', createdAt: '2025-01-01' },
  ];

  const mockAdminUser: User = { id: 'u1', name: 'Admin User', role: 'ADMIN', avatar: '' };
  const mockQALeadUser: User = { id: 'u2', name: 'QA Lead User', role: 'QA_LEAD', avatar: '' };
  const mockTesterUser: User = { id: 'u3', name: 'Tester User', role: 'TESTER', avatar: '' };

  const defaultEditCase: Partial<TestCase> = {
    projectId: 'project-1',
    title: 'Initial Title',
    userStory: 'As a user, I want to do X, so I can get Y.',
    preconditions: 'User is logged in.',
    acceptanceCriteria: 'Given A, When B, Then C.',
    tags: ['initial', 'tag'],
    priority: 'MEDIUM',
    description: 'Initial description',
    reviewStatus: 'PENDING',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all fields correctly with initial data', () => {
    render(
      <TestCaseForm 
        editCase={defaultEditCase}
        setEditCase={mockSetEditCase}
        suites={mockSuites}
        currentUser={mockTesterUser}
      />
    );

    expect(screen.getByPlaceholderText('e.g. Verify successful login with valid credentials')).toHaveValue('Initial Title');
    expect(screen.getByPlaceholderText('Requirement ID (e.g. JIRA-1024, REQ-50)')).toHaveValue('');
    expect(screen.getByDisplayValue('Medium')).toBeInTheDocument();
    expect(screen.getByDisplayValue('As a user, I want to do X, so I can get Y.', { exact: false })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('GIVEN [context], WHEN [event], THEN [outcome]...')).toHaveValue('Given A, When B, Then C.');
    expect(screen.getByPlaceholderText('e.g. User is on the login page, Database is reset...')).toHaveValue('User is logged in.');
    expect(screen.getByText('initial')).toBeInTheDocument();
    expect(screen.getByText('tag')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('shows review status as read-only for TESTER role', () => {
    render(
      <TestCaseForm
        editCase={{ ...defaultEditCase, reviewStatus: 'PENDING' }}
        setEditCase={mockSetEditCase}
        suites={mockSuites}
        currentUser={mockTesterUser}
      />
    );
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /review status/i })).not.toBeInTheDocument();
  });

  it('shows review status as editable for ADMIN role', () => {
    render(
      <TestCaseForm
        editCase={{ ...defaultEditCase, reviewStatus: 'PENDING' }}
        setEditCase={mockSetEditCase}
        suites={mockSuites}
        currentUser={mockAdminUser}
      />
    );
    const select = screen.getByRole('combobox', { name: /review status/i });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('PENDING');

    fireEvent.change(select, { target: { value: 'APPROVED' } });
    expect(mockSetEditCase).toHaveBeenCalledWith({
      ...defaultEditCase,
      reviewStatus: 'APPROVED',
    });
  });

  it('shows review status as editable for QA_LEAD role', () => {
    render(
      <TestCaseForm
        editCase={{ ...defaultEditCase, reviewStatus: 'PENDING' }}
        setEditCase={mockSetEditCase}
        suites={mockSuites}
        currentUser={mockQALeadUser}
      />
    );
    const select = screen.getByRole('combobox', { name: /review status/i });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('PENDING');

    fireEvent.change(select, { target: { value: 'CHANGES_REQUESTED' } });
    expect(mockSetEditCase).toHaveBeenCalledWith({
      ...defaultEditCase,
      reviewStatus: 'CHANGES_REQUESTED',
    });
  });

  it('updates title correctly', () => {
    render(
      <TestCaseForm 
        editCase={defaultEditCase}
        setEditCase={mockSetEditCase}
        suites={mockSuites}
        currentUser={mockTesterUser}
      />
    );
    const titleInput = screen.getByPlaceholderText('e.g. Verify successful login with valid credentials');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(mockSetEditCase).toHaveBeenCalledWith({
      ...defaultEditCase,
      title: 'New Title',
    });
  });

  it('updates acceptance criteria correctly', () => {
    render(
      <TestCaseForm 
        editCase={defaultEditCase}
        setEditCase={mockSetEditCase}
        suites={mockSuites}
        currentUser={mockTesterUser}
      />
    );
    const acInput = screen.getByPlaceholderText('GIVEN [context], WHEN [event], THEN [outcome]...');
    fireEvent.change(acInput, { target: { value: 'New AC' } });
    expect(mockSetEditCase).toHaveBeenCalledWith({
      ...defaultEditCase,
      acceptanceCriteria: 'New AC',
    });
  });

  it('updates tags correctly with add and remove', () => {
    const tagsEditCase: Partial<TestCase> = { ...defaultEditCase, tags: ['existing'] };
    render(
      <TestCaseForm 
        editCase={tagsEditCase}
        setEditCase={mockSetEditCase}
        suites={mockSuites}
        currentUser={mockTesterUser}
      />
    );

    // Add tag
    const tagInputField = screen.getByPlaceholderText('Type tag and press Enter...');
    fireEvent.change(tagInputField, { target: { value: 'new-tag' } });
    fireEvent.keyDown(tagInputField, { key: 'Enter', code: 'Enter' });

    expect(mockSetEditCase).toHaveBeenCalledWith({
      ...tagsEditCase,
      tags: ['existing', 'new-tag'],
    });
    jest.clearAllMocks();
    cleanup(); // Clean up DOM from previous render

    // Remove tag
    render(
        <TestCaseForm  
          editCase={{ ...tagsEditCase, tags: ['existing', 'another'] }}
          setEditCase={mockSetEditCase}
          suites={mockSuites}
          currentUser={mockTesterUser}
        />
      );
    const removeIcon = screen.getByText('existing').parentElement?.querySelector('svg');
    if (removeIcon) {
        fireEvent.click(removeIcon);
    } else {
        throw new Error('Remove icon not found');
    }

    expect(mockSetEditCase).toHaveBeenCalledWith({
      ...tagsEditCase,
      tags: ['another'],
    });
  });

  it('updates priority correctly', () => {
    render(
      <TestCaseForm 
        editCase={defaultEditCase}
        setEditCase={mockSetEditCase}
        suites={mockSuites}
        currentUser={mockTesterUser}
      />
    );
    // Using display value which is what user sees
    const prioritySelect = screen.getByDisplayValue('Medium');
    fireEvent.change(prioritySelect, { target: { value: 'HIGH' } });
    expect(mockSetEditCase).toHaveBeenCalledWith({
      ...defaultEditCase,
      priority: 'HIGH',
    });
  });
});

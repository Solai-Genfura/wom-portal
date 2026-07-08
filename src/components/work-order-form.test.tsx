import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkOrderForm from './work-order-form';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => '/new',
  useSearchParams: () => new URLSearchParams(),
}));

describe('WorkOrderForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders creation form inputs correctly', () => {
    render(<WorkOrderForm />);

    expect(screen.getByLabelText(/Work Order Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Detailed Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority level/i)).toBeInTheDocument();
    
    // Status select should NOT be present in creation mode
    expect(screen.queryByLabelText(/Status/i)).not.toBeInTheDocument();
  });

  it('renders edit form inputs with pre-populated values', () => {
    const mockOrder = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Fix lobby lighting',
      description: 'Replace three blown bulbs',
      priority: 'Low' as const,
      status: 'In Progress' as const,
      updatedAt: new Date().toISOString(),
    };

    render(<WorkOrderForm initialData={mockOrder} isEdit={true} />);

    expect(screen.getByLabelText(/Work Order Title/i)).toHaveValue('Fix lobby lighting');
    expect(screen.getByLabelText(/Detailed Description/i)).toHaveValue('Replace three blown bulbs');
    expect(screen.getByLabelText(/Priority level/i)).toHaveValue('Low');
    
    // Status select SHOULD be present in edit mode
    expect(screen.getByLabelText(/Status/i)).toHaveValue('In Progress');
  });

  it('shows client-side validation error for short titles', async () => {
    render(<WorkOrderForm />);

    const titleInput = screen.getByLabelText(/Work Order Title/i);
    const submitButton = screen.getByRole('button', { name: /Save Work Order/i });

    // Try setting a title that is too short
    fireEvent.change(titleInput, { target: { value: 'A' } });
    fireEvent.click(submitButton);

    // Wait for the client-side validation message to appear
    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 2 characters./i)).toBeInTheDocument();
    });
  });
});

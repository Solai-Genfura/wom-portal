import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DashboardFilters from './dashboard-filters';

// Mock router hooks
const mockPush = vi.fn();
const mockPathname = '/';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe('DashboardFilters Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initial inputs with correct empty states', () => {
    render(<DashboardFilters />);
    
    expect(screen.getByPlaceholderText(/Search by title or description/i)).toHaveValue('');
    expect(screen.getByLabelText(/Filter by Status/i)).toHaveValue('');
    expect(screen.getByLabelText(/Filter by Priority/i)).toHaveValue('');
    
    // Clear filters button should not render when searchParams is empty
    expect(screen.queryByRole('button', { name: /Clear filters/i })).not.toBeInTheDocument();
  });

  it('populates fields from URL search parameters', () => {
    mockSearchParams = new URLSearchParams('q=servers&status=Open&priority=High');
    render(<DashboardFilters />);

    expect(screen.getByPlaceholderText(/Search by title or description/i)).toHaveValue('servers');
    expect(screen.getByLabelText(/Filter by Status/i)).toHaveValue('Open');
    expect(screen.getByLabelText(/Filter by Priority/i)).toHaveValue('High');
    
    // Clear filters button should show up
    expect(screen.getByRole('button', { name: /Clear filters/i })).toBeInTheDocument();
  });

  it('debounces text search input and updates query string', async () => {
    render(<DashboardFilters />);
    
    const searchInput = screen.getByPlaceholderText(/Search by title or description/i);
    
    // Type query
    fireEvent.change(searchInput, { target: { value: 'cooling fan' } });
    
    // It shouldn't push immediately because of the 400ms debounce
    expect(mockPush).not.toHaveBeenCalled();

    // Fast-forward timers by 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(mockPush).toHaveBeenCalledWith('/?q=cooling+fan');
  });

  it('updates status and priority immediately on select change', async () => {
    render(<DashboardFilters />);

    const statusSelect = screen.getByLabelText(/Filter by Status/i);
    fireEvent.change(statusSelect, { target: { value: 'In Progress' } });
    expect(mockPush).toHaveBeenCalledWith('/?status=In+Progress');

    vi.clearAllMocks();

    const prioritySelect = screen.getByLabelText(/Filter by Priority/i);
    fireEvent.change(prioritySelect, { target: { value: 'Low' } });
    expect(mockPush).toHaveBeenCalledWith('/?priority=Low');
  });

  it('clears all filters when clear button is clicked', async () => {
    mockSearchParams = new URLSearchParams('q=light&status=Done');
    render(<DashboardFilters />);

    const clearButton = screen.getByRole('button', { name: /Clear filters/i });
    fireEvent.click(clearButton);

    expect(mockPush).toHaveBeenCalledWith('/');
    expect(screen.getByPlaceholderText(/Search by title or description/i)).toHaveValue('');
  });
});

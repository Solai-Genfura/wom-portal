import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeleteButton from './delete-button';

// Mock next/navigation
const mockRefresh = vi.fn();
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: mockPush,
  }),
}));

describe('DeleteButton Component', () => {
  const mockId = 'test-id-123';
  const mockTitle = 'Test Work Order';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch
    global.fetch = vi.fn();
    // Mock confirm
    global.confirm = vi.fn();
    // Mock alert
    global.alert = vi.fn();
  });

  it('renders trash icon initially', () => {
    render(<DeleteButton id={mockId} title={mockTitle} />);
    const button = screen.getByRole('button', { name: `Delete work order ${mockTitle}` });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Delete Work Order');
  });

  it('does not delete if user cancels confirmation', async () => {
    vi.mocked(confirm).mockReturnValueOnce(false);
    
    render(<DeleteButton id={mockId} title={mockTitle} />);
    const button = screen.getByRole('button', { name: `Delete work order ${mockTitle}` });
    
    fireEvent.click(button);
    
    expect(confirm).toHaveBeenCalledWith(`Are you sure you want to delete "${mockTitle}"?`);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('performs API delete request and refreshes router on confirmation success', async () => {
    vi.mocked(confirm).mockReturnValueOnce(true);
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(<DeleteButton id={mockId} title={mockTitle} />);
    const button = screen.getByRole('button', { name: `Delete work order ${mockTitle}` });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(confirm).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(`/api/work-orders/${mockId}`, {
      method: 'DELETE',
    });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('redirects to dashboard when deleted from a detail page', async () => {
    // Set location pathname to a detail page URL
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, pathname: '/test-id-123' } as any;

    vi.mocked(confirm).mockReturnValueOnce(true);
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(<DeleteButton id={mockId} title={mockTitle} />);
    const button = screen.getByRole('button', { name: `Delete work order ${mockTitle}` });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    // Reset location
    window.location = originalLocation;
  });

  it('shows error alert on API failure', async () => {
    vi.mocked(confirm).mockReturnValueOnce(true);
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Database read-only error' }),
    } as Response);

    render(<DeleteButton id={mockId} title={mockTitle} />);
    const button = screen.getByRole('button', { name: `Delete work order ${mockTitle}` });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Database read-only error');
    });
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});

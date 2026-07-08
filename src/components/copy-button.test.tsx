import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CopyButton from './copy-button';

describe('CopyButton Component', () => {
  const mockText = 'test-copy-value';

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders clipboard icon and initial tooltip correctly', () => {
    render(<CopyButton text={mockText} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Copy to clipboard');
    expect(button).toBeInTheDocument();
  });

  it('copies text and switches icon/tooltip when clicked, then resets after timer', async () => {
    render(<CopyButton text={mockText} />);
    
    const button = screen.getByRole('button');
    
    // Click the button
    await act(async () => {
      fireEvent.click(button);
    });

    // Check navigator.clipboard was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockText);

    // Verify button updates to "Copied!"
    expect(button).toHaveAttribute('title', 'Copied!');

    // Fast-forward timers by 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should reset back to original state
    expect(button).toHaveAttribute('title', 'Copy to clipboard');
  });
});

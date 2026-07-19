import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Assistant } from './Assistant';
import { AccessibilityProvider } from '../context/AccessibilityContext';

// Silence scrollIntoView (not implemented in jsdom)
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Silence speechSynthesis (not implemented in jsdom)
Object.defineProperty(window, 'speechSynthesis', {
  value: { cancel: vi.fn(), speak: vi.fn() },
  writable: true,
});

describe('Assistant Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch to avoid network calls in unit tests
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'Test AI reply', mode: 'offline' }),
    } as Response);
  });

  it('renders initial welcome message', () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    expect(screen.getByText(/Hello! I'm your AccessSphere AI/i)).toBeInTheDocument();
  });

  it('renders all suggestion chips', () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    expect(screen.getByText('📍 Find accessible restroom')).toBeInTheDocument();
    expect(screen.getByText('🆘 Emergency help')).toBeInTheDocument();
    expect(screen.getByText('♿ Update my needs')).toBeInTheDocument();
  });

  it('renders chat transcript region with accessibility role', () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    const log = screen.getByRole('log');
    expect(log).toBeInTheDocument();
  });

  it('renders voice input button with proper aria-label', () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    expect(screen.getByLabelText(/start voice input/i)).toBeInTheDocument();
  });

  it('renders send button initially disabled when input is empty', () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    expect(screen.getByLabelText('Send message')).toBeDisabled();
  });

  it('enables send button when user types a message', () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    const input = screen.getByLabelText('Message input');
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    expect(screen.getByLabelText('Send message')).not.toBeDisabled();
  });

  it('allows user to type a message and clears input on submit', async () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    const input = screen.getByLabelText('Message input');

    fireEvent.change(input, { target: { value: 'Find accessible restroom' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    // User message appears in transcript
    expect(screen.getByText('Find accessible restroom')).toBeInTheDocument();

    // Input is cleared
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('calls /api/chat when a message is sent', async () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    const input = screen.getByLabelText('Message input');

    fireEvent.change(input, { target: { value: 'wheelchair access' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  it('renders AI reply from the backend in the transcript', async () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    const input = screen.getByLabelText('Message input');

    fireEvent.change(input, { target: { value: 'Where is gate A?' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Test AI reply')).toBeInTheDocument();
    });
  });

  it('shows error banner when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error'),
    );

    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    const input = screen.getByLabelText('Message input');
    fireEvent.change(input, { target: { value: 'test' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('renders settings button with aria-label', () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    expect(screen.getByLabelText('Assistant settings')).toBeInTheDocument();
  });

  it('opens settings panel when settings button clicked', () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    fireEvent.click(screen.getByLabelText('Assistant settings'));
    expect(screen.getByRole('dialog', { name: /assistant settings/i })).toBeInTheDocument();
  });
});

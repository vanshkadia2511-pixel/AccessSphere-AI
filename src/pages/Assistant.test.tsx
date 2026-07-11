import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Assistant } from './Assistant';
import { AccessibilityProvider } from '../context/AccessibilityContext';

// Mock env
vi.stubEnv('VITE_GEMINI_API_KEY', '');

// Mock scrollIntoView which is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Assistant Page', () => {
  it('renders initial welcome message and suggestion chips', () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    
    expect(screen.getByText(/Hello Alex! I'm your AccessSphere AI/i)).toBeInTheDocument();
    expect(screen.getByText('📍 Find accessible restroom')).toBeInTheDocument();
  });

  it('allows user to type a message and send it', async () => {
    render(<AccessibilityProvider><Assistant /></AccessibilityProvider>);
    
    const input = screen.getByPlaceholderText(/Ask for accessible routing/i);
    
    fireEvent.change(input, { target: { value: 'Test message to AI' } });
    expect(input).toHaveValue('Test message to AI');
    
    // Select input parent form and submit
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    // User message should appear
    expect(screen.getByText('Test message to AI')).toBeInTheDocument();
    
    // Input should be cleared
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Ask for accessible routing/i)).toHaveValue('');
    });
  });
});

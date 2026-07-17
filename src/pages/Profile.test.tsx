import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Profile } from './Profile';
import { AccessibilityProvider } from '../context/AccessibilityContext';

// scrollIntoView is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Profile Page', () => {
  it('renders the Accessibility Profile heading', () => {
    render(
      <AccessibilityProvider>
        <Profile />
      </AccessibilityProvider>
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Accessibility Profile/i)).toBeInTheDocument();
  });

  it('renders accessibility need toggles', () => {
    render(
      <AccessibilityProvider>
        <Profile />
      </AccessibilityProvider>
    );
    expect(screen.getByText('Mobility Assistance')).toBeInTheDocument();
    expect(screen.getByText('Visual Assistance')).toBeInTheDocument();
    expect(screen.getByText('Hearing Assistance')).toBeInTheDocument();
    expect(screen.getByText('Cognitive Support')).toBeInTheDocument();
  });

  it('renders personal details fields', () => {
    render(
      <AccessibilityProvider>
        <Profile />
      </AccessibilityProvider>
    );
    expect(screen.getByDisplayValue('Alex Johnson')).toBeInTheDocument();
    expect(screen.getByDisplayValue('FWC26-982347')).toBeInTheDocument();
  });

  it('shows saved state when Save Profile button is clicked', () => {
    render(
      <AccessibilityProvider>
        <Profile />
      </AccessibilityProvider>
    );
    const saveBtn = screen.getByText(/Save Profile/i);
    fireEvent.click(saveBtn);
    expect(screen.getByText(/Profile Saved!/i)).toBeInTheDocument();
  });
});

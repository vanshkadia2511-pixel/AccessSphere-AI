import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navigation } from './Navigation';

describe('Navigation Page', () => {
  it('renders the AR Indoor Navigation heading', () => {
    render(<Navigation />);
    expect(
      screen.getByRole('heading', { name: /AR Indoor Navigation/i })
    ).toBeInTheDocument();
  });

  it('shows the accessible seating destination', () => {
    render(<Navigation />);
    expect(screen.getAllByText(/Accessible Seating/i).length).toBeGreaterThan(0);
  });

  it('flags elevator access on the active route', () => {
    render(<Navigation />);
    expect(screen.getAllByText(/Elevator/i).length).toBeGreaterThan(0);
  });

  it('renders AR overlay guidance (turn instruction and target)', () => {
    render(<Navigation />);
    expect(screen.getAllByText(/Turn Right/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/30m ahead/i)).toBeInTheDocument();
  });
});

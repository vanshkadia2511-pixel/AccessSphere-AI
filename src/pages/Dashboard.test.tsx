import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';

window.alert = vi.fn();

describe('Dashboard Page', () => {
  it('renders the welcome heading', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it('renders the match-day overview subtitle', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Match-Day Overview/i)).toBeInTheDocument();
  });

  it('renders the Green Fan Rewards sustainability tracker', () => {
    render(<Dashboard />);
    expect(
      screen.getByRole('heading', { name: /Green Fan Rewards/i })
    ).toBeInTheDocument();
  });

  it('logging a sustainability action increases the points total', () => {
    render(<Dashboard />);
    expect(screen.getByText('150')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Returned Cup/i }));
    expect(screen.queryByText('150')).not.toBeInTheDocument();
  });

  it('claiming a reward the fan can afford shows the active reward badge', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /10% Concessions/i }));
    expect(screen.getByText(/Active Reward/i)).toBeInTheDocument();
  });

  it('claiming an unaffordable reward does not deduct points', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /Free Metro Pass/i }));
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.queryByText(/Active Reward/i)).not.toBeInTheDocument();
  });
});

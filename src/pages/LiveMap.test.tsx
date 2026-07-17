import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiveMap } from './LiveMap';

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('LiveMap Page', () => {
  it('renders the Real-Time Intelligence heading', () => {
    render(<LiveMap />);
    expect(screen.getByText(/Real-Time Intelligence/i)).toBeInTheDocument();
  });

  it('renders gate congestion zone labels inside the heatmap', () => {
    render(<LiveMap />);
    expect(screen.getAllByText(/North Gate/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/South Gate/i).length).toBeGreaterThan(0);
  });

  it('renders elevator and gate alerts section heading', () => {
    render(<LiveMap />);
    expect(screen.getByRole('heading', { name: /Elevator & Gate Alerts/i })).toBeInTheDocument();
  });

  it('renders parking intelligence section heading', () => {
    render(<LiveMap />);
    expect(screen.getByRole('heading', { name: /Parking Intelligence/i })).toBeInTheDocument();
  });

  it('report incident form allows input', () => {
    render(<LiveMap />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    fireEvent.change(inputs[0], { target: { value: 'Test facility' } });
    expect(inputs[0]).toHaveValue('Test facility');
  });
});

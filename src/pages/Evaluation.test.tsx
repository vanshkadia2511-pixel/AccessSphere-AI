import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Evaluation } from './Evaluation';

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Evaluation Page', () => {
  it('renders the Smart Stadium Innovation Index heading', () => {
    render(<Evaluation />);
    expect(screen.getByText(/Smart Stadium Innovation Index/i)).toBeInTheDocument();
  });

  it('renders the Detailed Score Breakdown section', () => {
    render(<Evaluation />);
    expect(screen.getByText(/Detailed Score Breakdown/i)).toBeInTheDocument();
  });

  it('renders all score breakdown category labels', () => {
    render(<Evaluation />);
    expect(screen.getByText('Multilingual Assistance')).toBeInTheDocument();
    expect(screen.getByText('Accessible Navigation')).toBeInTheDocument();
    expect(screen.getByText('Crowd Management')).toBeInTheDocument();
    expect(screen.getByText(/Transit/i)).toBeInTheDocument();
    expect(screen.getByText('Operational Intelligence')).toBeInTheDocument();
    expect(screen.getByText(/Sustainability/i)).toBeInTheDocument();
  });

  it('renders the overall Innovation Index score section', () => {
    render(<Evaluation />);
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.getByText('Innovation Index')).toBeInTheDocument();
  });

  it('renders rank and percentile metadata', () => {
    render(<Evaluation />);
    expect(screen.getByText(/Pioneer/i)).toBeInTheDocument();
    expect(screen.getByText(/Top 0.1%/i)).toBeInTheDocument();
  });
});

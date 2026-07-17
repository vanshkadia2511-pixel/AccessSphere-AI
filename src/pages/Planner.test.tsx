import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Planner } from './Planner';

describe('Planner Page', () => {
  it('renders the Transportation & Navigation Planner heading', () => {
    render(<Planner />);
    expect(
      screen.getByText(/Transportation & Navigation Planner/i)
    ).toBeInTheDocument();
  });

  it('offers accessible transport route options', () => {
    render(<Planner />);
    expect(screen.getAllByText(/Smart Shuttle/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/LA Metro/i).length).toBeGreaterThan(0);
  });

  it('surfaces sustainability (carbon savings) information on routes', () => {
    render(<Planner />);
    expect(screen.getAllByText(/Carbon Saved|Emissions Saved/i).length).toBeGreaterThan(0);
  });

  it('switching route option updates the itinerary steps', () => {
    render(<Planner />);
    const railOption = screen.getAllByText(/LA Metro/i)[0];
    fireEvent.click(railOption);
    expect(screen.getAllByText(/Metro E-Line Train/i).length).toBeGreaterThan(0);
  });

  it('itinerary steps include step-free / ADA accessibility details', () => {
    render(<Planner />);
    expect(screen.getAllByText(/ADA|ramp|wheelchair|elevator/i).length).toBeGreaterThan(0);
  });
});

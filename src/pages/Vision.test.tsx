import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Vision } from './Vision';

describe('Vision Page', () => {
  it('renders the Vision Scanner heading', () => {
    render(<Vision />);
    expect(
      screen.getByRole('heading', { name: /Vision Scanner/i })
    ).toBeInTheDocument();
  });

  it('defaults to obstacle detection mode with hazard labelling', () => {
    render(<Vision />);
    expect(screen.getByText(/Wet Floor/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear Path/i)).toBeInTheDocument();
  });

  it('switching to Read Signs mode shows a multilingual translation', () => {
    render(<Vision />);
    fireEvent.click(screen.getByRole('button', { name: /Read Signs/i }));
    expect(screen.getByText(/Accessible Restrooms/i)).toBeInTheDocument();
  });

  it('read aloud uses the browser speech synthesis API', () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    class FakeUtterance {
      text: string;
      rate = 1;
      pitch = 1;
      constructor(text: string) {
        this.text = text;
      }
    }
    vi.stubGlobal('speechSynthesis', { speak, cancel });
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    render(<Vision />);
    fireEvent.click(screen.getByRole('button', { name: /Read Signs/i }));
    const readAloud = screen.getAllByRole('button', { name: /Read Aloud/i })[0];
    fireEvent.click(readAloud);
    expect(speak).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('renders upload button when in OCR mode', () => {
    render(<Vision />);
    fireEvent.click(screen.getByRole('button', { name: /Read Signs/i }));
    expect(screen.getByText(/Upload Sign Photo/i)).toBeInTheDocument();
  });
});


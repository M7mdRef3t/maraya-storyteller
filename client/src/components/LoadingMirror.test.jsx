import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingMirror from './LoadingMirror';

describe('LoadingMirror', () => {
  it('renders the component structure', () => {
    const { container } = render(<LoadingMirror />);

    // Check main container
    expect(container.querySelector('.loading-mirror')).toBeInTheDocument();

    // Check orb elements
    expect(container.querySelector('.loading-mirror__orb')).toBeInTheDocument();
    expect(container.querySelector('.loading-mirror__orb-inner')).toBeInTheDocument();
    expect(container.querySelector('.loading-mirror__orb-reflection')).toBeInTheDocument();
  });

  it('displays default text when no statusText is provided', () => {
    render(<LoadingMirror />);
    expect(screen.getByText('المرايا تتشكل...')).toBeInTheDocument();
  });

  it('displays custom statusText when provided', () => {
    const customText = 'Loading your story...';
    render(<LoadingMirror statusText={customText} />);
    expect(screen.getByText(customText)).toBeInTheDocument();
    expect(screen.queryByText('المرايا تتشكل...')).not.toBeInTheDocument();
  });
});

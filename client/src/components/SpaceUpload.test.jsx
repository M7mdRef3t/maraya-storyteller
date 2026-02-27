import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SpaceUpload from './SpaceUpload';

const uiText = {
  back: 'Back',
  uploadTitle: 'Upload your space',
  uploadDesc: 'Choose an image',
  uploadDrop: 'Upload an image',
  analyzingSpace: 'Analyzing...',
};

describe('SpaceUpload', () => {
  it('renders a file input that is accessible (not display: none)', () => {
    render(
      <SpaceUpload
        onUpload={() => {}}
        onBack={() => {}}
        uiText={uiText}
        disabled={false}
      />,
    );

    const input = screen.getByLabelText(/upload an image/i);
    expect(input).toBeTruthy();
    expect(input.style.display).not.toBe('none');
    expect(input.classList.contains('visually-hidden')).toBe(true);
  });

  it('is disabled when the disabled prop is true', () => {
    render(
      <SpaceUpload
        onUpload={() => {}}
        onBack={() => {}}
        uiText={uiText}
        disabled={true}
      />,
    );

    const input = screen.getByLabelText(/upload an image/i);
    expect(input.disabled).toBe(true);
  });
});
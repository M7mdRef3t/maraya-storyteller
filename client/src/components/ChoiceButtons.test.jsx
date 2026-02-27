import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChoiceButtons from './ChoiceButtons';

describe('ChoiceButtons', () => {
  const mockChoices = [
    { text_ar: 'Choice 1', value: '1' },
    { text_ar: 'Choice 2', value: '2' },
  ];
  const mockOnChoose = vi.fn();

  it('renders nothing when not visible', () => {
    const { container } = render(
      <ChoiceButtons
        choices={mockChoices}
        onChoose={mockOnChoose}
        visible={false}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when choices array is empty', () => {
    const { container } = render(
      <ChoiceButtons
        choices={[]}
        onChoose={mockOnChoose}
        visible={true}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders buttons with correct text when visible', () => {
    render(
      <ChoiceButtons
        choices={mockChoices}
        onChoose={mockOnChoose}
        visible={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(screen.getByText('Choice 1')).toBeInTheDocument();
    expect(screen.getByText('Choice 2')).toBeInTheDocument();
  });

  it('renders right arrow for English UI', () => {
    render(
      <ChoiceButtons
        choices={mockChoices}
        onChoose={mockOnChoose}
        visible={true}
        uiLanguage="en"
      />
    );

    const arrows = screen.getAllByText('→');
    expect(arrows).toHaveLength(2);
  });

  it('renders left arrow for Arabic UI (default)', () => {
    render(
      <ChoiceButtons
        choices={mockChoices}
        onChoose={mockOnChoose}
        visible={true}
        uiLanguage="ar"
      />
    );

    const arrows = screen.getAllByText('←');
    expect(arrows).toHaveLength(2);
  });

  it('calls onChoose with correct choice when clicked', () => {
    render(
      <ChoiceButtons
        choices={mockChoices}
        onChoose={mockOnChoose}
        visible={true}
      />
    );

    const firstButton = screen.getAllByRole('button')[0];
    fireEvent.click(firstButton);

    expect(mockOnChoose).toHaveBeenCalledTimes(1);
    expect(mockOnChoose).toHaveBeenCalledWith(mockChoices[0]);
  });
});

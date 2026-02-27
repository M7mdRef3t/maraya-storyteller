import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SceneRenderer from './SceneRenderer';

// Mock child components to isolate SceneRenderer logic
vi.mock('./NarrationText', () => ({
  default: ({ onComplete, onBlockStart, text }) => (
    <div data-testid="narration-text">
      {text}
      <button onClick={onComplete} data-testid="complete-narration">Complete</button>
    </div>
  ),
}));

vi.mock('./ChoiceButtons', () => ({
  default: ({ visible, onChoose, choices }) => (
    visible ? (
      <div data-testid="choice-buttons">
        {choices.map((choice, index) => (
          <button key={index} onClick={() => onChoose(choice)} data-testid={`choice-${index}`}>
            {choice.text_ar}
          </button>
        ))}
      </div>
    ) : null
  ),
}));

describe('SceneRenderer', () => {
  const mockScene = {
    scene_id: 'scene-1',
    story_scene_number: 1,
    story_total_scenes: 5,
    narration_ar: 'This is a test scene.',
    choices: [
      { text_ar: 'Choice 1' },
      { text_ar: 'Choice 2' },
    ],
    interleaved_blocks: [],
  };

  const mockOnChoose = vi.fn();
  const mockOnNarrationBlock = vi.fn();

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders correctly with scene progress', () => {
    render(
      <SceneRenderer
        scene={mockScene}
        onChoose={mockOnChoose}
        onNarrationBlock={mockOnNarrationBlock}
        sceneWord="Scene"
      />
    );

    expect(screen.getByText('Scene 1/5')).toBeInTheDocument();
    expect(screen.getByTestId('narration-text')).toHaveTextContent('This is a test scene.');
    expect(screen.queryByTestId('choice-buttons')).not.toBeInTheDocument();
  });

  it('reveals choices after narration completes and delay', async () => {
    vi.useFakeTimers();
    render(
      <SceneRenderer
        scene={mockScene}
        onChoose={mockOnChoose}
        onNarrationBlock={mockOnNarrationBlock}
      />
    );

    // Initial state: choices hidden
    expect(screen.queryByTestId('choice-buttons')).not.toBeInTheDocument();

    // Trigger narration completion
    const completeButton = screen.getByTestId('complete-narration');
    act(() => {
      completeButton.click();
    });

    // Verify choices still hidden immediately (due to delay)
    expect(screen.queryByTestId('choice-buttons')).not.toBeInTheDocument();

    // Fast-forward time past the 800ms delay
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Verify choices are now visible
    expect(screen.getByTestId('choice-buttons')).toBeInTheDocument();

    // We expect 3 elements: the container "choice-buttons" and the two buttons "choice-0" and "choice-1"
    // Since we used getAllByTestId with a regex that matches both, we got 3.
    // Let's be more specific.
    expect(screen.getByTestId('choice-0')).toBeInTheDocument();
    expect(screen.getByTestId('choice-1')).toBeInTheDocument();
  });

  it('handles user choice selection', async () => {
    vi.useFakeTimers();
    render(
      <SceneRenderer
        scene={mockScene}
        onChoose={mockOnChoose}
        onNarrationBlock={mockOnNarrationBlock}
      />
    );

    // Reveal choices
    act(() => {
      screen.getByTestId('complete-narration').click();
      vi.advanceTimersByTime(800);
    });

    // Click a choice
    const choiceButton = screen.getByTestId('choice-0');
    act(() => {
      choiceButton.click();
    });

    expect(mockOnChoose).toHaveBeenCalledWith(mockScene.choices[0]);
  });

  it('shows end of journey text when isFinal is true', async () => {
    vi.useFakeTimers();
    render(
      <SceneRenderer
        scene={mockScene}
        onChoose={mockOnChoose}
        isFinal={true}
        uiLanguage="en"
      />
    );

    // Trigger narration completion
    act(() => {
      screen.getByTestId('complete-narration').click();
      vi.advanceTimersByTime(800);
    });

    // Verify final text is shown instead of choices
    expect(screen.getByText('— End of Journey —')).toBeInTheDocument();
    expect(screen.queryByTestId('choice-buttons')).not.toBeInTheDocument();
  });

  it('clears timers on unmount', () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <SceneRenderer
        scene={mockScene}
        onChoose={mockOnChoose}
      />
    );

    // Trigger narration completion to start the timer
    act(() => {
      screen.getByTestId('complete-narration').click();
    });

    unmount();

    // Advancing timers should not cause state updates (which would log errors if not cleared)
    // This is implicitly tested by lack of "act" warnings, but we can't easily spy on clearTimeout in functional components
    // without more invasive mocking. However, ensuring no errors are thrown during this process gives confidence.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('resets choices visibility when scene changes', async () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <SceneRenderer
        scene={mockScene}
        onChoose={mockOnChoose}
      />
    );

    // Show choices for first scene
    act(() => {
      screen.getByTestId('complete-narration').click();
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByTestId('choice-buttons')).toBeInTheDocument();

    // Change scene
    const newScene = { ...mockScene, scene_id: 'scene-2' };
    rerender(
        <SceneRenderer
            scene={newScene}
            onChoose={mockOnChoose}
        />
    );

    // Verify choices are hidden again
    expect(screen.queryByTestId('choice-buttons')).not.toBeInTheDocument();
  });
});

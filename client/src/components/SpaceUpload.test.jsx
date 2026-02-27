import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SpaceUpload from './SpaceUpload';

describe('SpaceUpload', () => {
  const uiText = {
    back: 'Back',
    uploadTitle: 'Upload Your Space',
    uploadDesc: 'Upload a photo of your room to get started.',
    uploadDrop: 'Drop your image here',
    analyzingSpace: 'Analyzing your space...',
  };

  const onUpload = vi.fn();
  const onBack = vi.fn();

  beforeEach(() => {
    onUpload.mockClear();
    onBack.mockClear();

    // Mock FileReader
    global.FileReader = class {
      constructor() {
        this.onload = null;
      }
      readAsDataURL(file) {
        setTimeout(() => {
             if (this.onload) {
                 this.onload({ target: { result: 'data:image/jpeg;base64,mocked-image-content' } });
             }
        }, 0);
      }
    };

    // Mock Image
    global.Image = class {
      constructor() {
        this.onload = null;
        this.width = 100;
        this.height = 100;
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    };

    // Mock Canvas
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    }));
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,processed-image-content');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly', () => {
    render(<SpaceUpload onUpload={onUpload} onBack={onBack} uiText={uiText} />);

    expect(screen.getByText(uiText.uploadTitle)).toBeInTheDocument();
    expect(screen.getByText(uiText.uploadDesc)).toBeInTheDocument();
    expect(screen.getByText(uiText.uploadDrop)).toBeInTheDocument();
    expect(screen.getByText('← ' + uiText.back)).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<SpaceUpload onUpload={onUpload} onBack={onBack} uiText={uiText} />);

    fireEvent.click(screen.getByText('← ' + uiText.back));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('processes valid image upload', async () => {
    const { container } = render(<SpaceUpload onUpload={onUpload} onBack={onBack} uiText={uiText} />);

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith('processed-image-content', 'image/jpeg');
    });
  });

  it('resizes large images (width > height)', async () => {
    // Override Image mock for this test
    global.Image = class {
      constructor() {
        this.onload = null;
        this.width = 2000;
        this.height = 1000;
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    };

    const { container } = render(<SpaceUpload onUpload={onUpload} onBack={onBack} uiText={uiText} />);
    const file = new File(['large'], 'large.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
        expect(onUpload).toHaveBeenCalled();
    });
  });

  it('resizes large images (height > width)', async () => {
    // Override Image mock for this test
    global.Image = class {
      constructor() {
        this.onload = null;
        this.width = 1000;
        this.height = 2000;
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    };

    const { container } = render(<SpaceUpload onUpload={onUpload} onBack={onBack} uiText={uiText} />);
    const file = new File(['large-tall'], 'large-tall.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
        expect(onUpload).toHaveBeenCalled();
    });
  });

  it('ignores invalid file types', () => {
    const { container } = render(<SpaceUpload onUpload={onUpload} onBack={onBack} uiText={uiText} />);

    const file = new File(['text content'], 'document.txt', { type: 'text/plain' });
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onUpload).not.toHaveBeenCalled();
  });

  it('handles drag and drop events', () => {
    const { container } = render(<SpaceUpload onUpload={onUpload} onBack={onBack} uiText={uiText} />);
    const dropzone = container.querySelector('.space-upload__dropzone');

    fireEvent.dragOver(dropzone);
    expect(dropzone).toHaveClass('space-upload__dropzone--active');

    fireEvent.dragLeave(dropzone);
    expect(dropzone).not.toHaveClass('space-upload__dropzone--active');
  });

  it('processes file dropped via drag and drop', async () => {
    const { container } = render(<SpaceUpload onUpload={onUpload} onBack={onBack} uiText={uiText} />);
    const dropzone = container.querySelector('.space-upload__dropzone');
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

    fireEvent.dragOver(dropzone);
    expect(dropzone).toHaveClass('space-upload__dropzone--active');

    fireEvent.drop(dropzone, {
        dataTransfer: {
            files: [file],
            types: ['Files']
        }
    });

    expect(dropzone).not.toHaveClass('space-upload__dropzone--active');

    await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith('processed-image-content', 'image/jpeg');
    });
  });

  it('opens file selector when dropzone is clicked', () => {
      const { container } = render(<SpaceUpload onUpload={onUpload} onBack={onBack} uiText={uiText} />);
      const dropzone = container.querySelector('.space-upload__dropzone');
      const fileInput = container.querySelector('input[type="file"]');
      const clickSpy = vi.spyOn(fileInput, 'click');

      fireEvent.click(dropzone);
      expect(clickSpy).toHaveBeenCalled();
  });
});

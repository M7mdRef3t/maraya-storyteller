import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useWebSocket from './useWebSocket';

// --- Mock WebSocket Setup ---
let socketInstances = [];

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0; // WebSocket.CONNECTING
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;

    socketInstances.push(this);

    // We can't rely on real setTimeout if we use useFakeTimers,
    // so we expose a helper to simulate connection open.
  }

  // Helper for test to manually trigger connection
  _simulateOpen() {
    this.readyState = 1; // WebSocket.OPEN
    if (this.onopen) this.onopen();
  }

  send(data) {}
  close() {
    this.readyState = 3; // WebSocket.CLOSED
    if (this.onclose) {
      this.onclose();
    }
  }
}

// Stub the global WebSocket
vi.stubGlobal('WebSocket', MockWebSocket);
// Also stub WebSocket constants since they might be needed
global.WebSocket.CONNECTING = 0;
global.WebSocket.OPEN = 1;
global.WebSocket.CLOSING = 2;
global.WebSocket.CLOSED = 3;


describe('useWebSocket Hook', () => {
  beforeEach(() => {
    socketInstances = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWebSocket());
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should connect successfully and update state', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect();
    });

    expect(socketInstances.length).toBe(1);

    // Simulate async connection success
    act(() => {
        socketInstances[0]._simulateOpen();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should send messages when connected', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect();
    });

    act(() => {
        socketInstances[0]._simulateOpen();
    });

    const mockSocket = socketInstances[0];
    const sendSpy = vi.spyOn(mockSocket, 'send');

    act(() => {
      result.current.sendMessage('test_event', { foo: 'bar' });
    });

    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ type: 'test_event', foo: 'bar' }));
  });

  it('should handle incoming messages for specific handlers', async () => {
    const { result } = renderHook(() => useWebSocket());
    const handler = vi.fn();

    act(() => {
      result.current.connect();
    });

    act(() => {
        socketInstances[0]._simulateOpen();
    });

    const mockSocket = socketInstances[0];

    // Register handler
    act(() => {
      result.current.on('server_event', handler);
    });

    const messageEvent = { data: JSON.stringify({ type: 'server_event', payload: 123 }) };

    act(() => {
      if (mockSocket.onmessage) {
        mockSocket.onmessage(messageEvent);
      }
    });

    expect(handler).toHaveBeenCalledWith({ type: 'server_event', payload: 123 });
  });

  it('should handle incoming messages for wildcard (*) handler', async () => {
    const { result } = renderHook(() => useWebSocket());
    const wildcardHandler = vi.fn();

    act(() => {
      result.current.connect();
    });

    act(() => {
        socketInstances[0]._simulateOpen();
    });

    const mockSocket = socketInstances[0];

    act(() => {
      result.current.on('*', wildcardHandler);
    });

    const messageEvent = { data: JSON.stringify({ type: 'any_event', data: 'test' }) };

    act(() => {
      if (mockSocket.onmessage) {
        mockSocket.onmessage(messageEvent);
      }
    });

    expect(wildcardHandler).toHaveBeenCalledWith({ type: 'any_event', data: 'test' });
  });

  it('should disconnect correctly', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect();
    });

    act(() => {
        socketInstances[0]._simulateOpen();
    });

    const mockSocket = socketInstances[0];
    const closeSpy = vi.spyOn(mockSocket, 'close');

    act(() => {
      result.current.disconnect();
    });

    expect(closeSpy).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
  });

  it('should attempt to reconnect on unexpected close', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect();
    });

    act(() => {
        socketInstances[0]._simulateOpen();
    });

    expect(socketInstances.length).toBe(1);
    const firstSocket = socketInstances[0];

    // Simulate unexpected close
    act(() => {
      // Trigger the onclose handler that the hook attached
      if (firstSocket.onclose) {
        firstSocket.onclose();
      }
    });

    expect(result.current.isConnected).toBe(false);

    // Fast-forward past the reconnect timeout (3000ms)
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Should have created a new socket instance
    expect(socketInstances.length).toBe(2);

    // Simulate connection for the new socket
    act(() => {
        socketInstances[1]._simulateOpen();
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('should not reconnect if explicitly disconnected', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect();
    });

    act(() => {
        socketInstances[0]._simulateOpen();
    });

    // Explicit disconnect
    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);

    // Fast-forward time
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Should NOT have created a new socket instance (still just the first one)
    expect(socketInstances.length).toBe(1);
  });
});

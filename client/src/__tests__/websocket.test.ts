/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  connectWebSocket, 
  disconnectWebSocket,
  sendMessage,
  addWebSocketListener,
  removeWebSocketListener
} from '../lib/websocket';
import { authService } from '../lib/auth';

// Mock the auth service
vi.mock('../lib/auth', () => ({
  authService: {
    getToken: vi.fn(),
  },
}));

describe('WebSocket Client', () => {
  let wsInstance: {
    send: vi.Mock;
    close: vi.Mock;
    readyState: number;
    onopen?: () => void;
    onclose?: (event: { code: number; reason: string }) => void;
    onmessage?: (event: { data: string }) => void;
    onerror?: (error: any) => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the global WebSocket class
    wsInstance = {
      send: vi.fn(),
      close: vi.fn(),
      readyState: 0, // CONNECTING
    };

    const mockWebSocket = vi.fn(() => wsInstance) as any;
    mockWebSocket.OPEN = 1; // Add the static OPEN property
    global.WebSocket = mockWebSocket;

    // Mock authService to return a token
    (authService.getToken as vi.Mock).mockReturnValue('mock-jwt-token');
  });

  afterEach(() => {
    disconnectWebSocket();
    vi.restoreAllMocks();
  });

  it('should connect to WebSocket server', () => {
    connectWebSocket();
    expect(global.WebSocket).toHaveBeenCalledWith(
      expect.stringContaining('/ws?token=mock-jwt-token')
    );
  });

  it('should send messages when connected', () => {
    connectWebSocket();

    // Manually set to OPEN, as onopen is not automatically called in mock
    wsInstance.readyState = 1;

    const result = sendMessage('test_type', { test: 'data' });
    expect(result).toBe(true);
    expect(wsInstance.send).toHaveBeenCalledWith('{"type":"test_type","payload":{"test":"data"}}');
  });

  it('should not send messages when not connected', () => {
    const result = sendMessage('test_type', { test: 'data' });
    expect(result).toBe(false);
    expect(wsInstance.send).not.toHaveBeenCalled();
  });

  it('should manage event listeners and receive messages', () => {
    const mockCallback = vi.fn();
    addWebSocketListener('test_event', mockCallback);

    connectWebSocket();
    
    // Simulate receiving a message
    if (wsInstance.onmessage) {
      wsInstance.onmessage({ data: JSON.stringify({ type: 'test_event', payload: { success: true } }) });
    }

    expect(mockCallback).toHaveBeenCalledWith({ success: true });
    
    // Remove listener and test it's not called again
    removeWebSocketListener('test_event', mockCallback);
    if (wsInstance.onmessage) {
      wsInstance.onmessage({ data: JSON.stringify({ type: 'test_event', payload: { success: true } }) });
    }
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should disconnect from WebSocket server', () => {
    connectWebSocket();
    disconnectWebSocket();
    expect(wsInstance.close).toHaveBeenCalledWith(1000, 'Client disconnect');
  });
});

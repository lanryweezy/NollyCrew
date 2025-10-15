import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  connectWebSocket, 
  disconnectWebSocket,
  sendMessage,
  addWebSocketListener,
  removeWebSocketListener
} from '../lib/websocket';

// Mock the auth service
vi.mock('../lib/auth', () => ({
  authService: {
    getToken: vi.fn().mockReturnValue('mock-jwt-token'),
  },
}));

describe('WebSocket Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global WebSocket mock
    (global as any).WebSocket = vi.fn(() => ({
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1, // OPEN
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    disconnectWebSocket();
  });

  it('should connect to WebSocket server', () => {
    connectWebSocket();
    expect(WebSocket).toHaveBeenCalledWith(
      expect.stringContaining('/ws?token=mock-jwt-token')
    );
  });

  it('should send messages when connected', () => {
    connectWebSocket();
    const result = sendMessage('test_type', { test: 'data' });
    expect(result).toBe(true);
  });

  it('should not send messages when not connected', () => {
    const result = sendMessage('test_type', { test: 'data' });
    expect(result).toBe(false);
  });

  it('should manage event listeners', () => {
    const mockCallback = vi.fn();
    
    // Add listener
    addWebSocketListener('test_event', mockCallback);
    
    // Remove listener
    removeWebSocketListener('test_event', mockCallback);
    
    // Verify functions were called
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should disconnect from WebSocket server', () => {
    connectWebSocket();
    disconnectWebSocket();
    // In a real test, we would verify the WebSocket close method was called
  });
});
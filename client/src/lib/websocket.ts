import { authService } from './auth';

// WebSocket connection state
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Event listeners
const listeners: Map<string, Set<(data: any) => void>> = new Map();

// Connect to WebSocket server
export function connectWebSocket() {
  // Close existing connection if any
  if (ws) {
    ws.close();
  }

  // Clear any existing reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // Get auth token
  const token = authService.getToken();
  if (!token) {
    console.warn('No auth token available, cannot connect to WebSocket');
    return;
  }

  // Create WebSocket connection
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws?token=${token}`;
  ws = new WebSocket(wsUrl);

  // Handle connection open
  ws.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    emitEvent('connected', { status: 'connected' });
  };

  // Handle incoming messages
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      emitEvent(message.type, message.payload);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  // Handle connection close
  ws.onclose = (event) => {
    console.log('WebSocket disconnected', event.reason);
    emitEvent('disconnected', { reason: event.reason });

    // Attempt to reconnect if not intentionally closed
    if (event.code !== 1000) { // 1000 = Normal closure
      attemptReconnect();
    }
  };

  // Handle errors
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    emitEvent('error', { error });
  };
}

// Attempt to reconnect with exponential backoff
function attemptReconnect() {
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error('Max reconnect attempts reached');
    emitEvent('reconnect_failed', { attempts: reconnectAttempts });
    return;
  }

  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Max 30 seconds
  reconnectAttempts++;

  console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`);
  
  reconnectTimeout = setTimeout(() => {
    connectWebSocket();
  }, delay);
}

// Disconnect from WebSocket server
export function disconnectWebSocket() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (ws) {
    ws.close(1000, 'Client disconnect');
    ws = null;
  }

  reconnectAttempts = 0;
}

// Send a message to the server
export function sendMessage(type: string, payload: any, projectId?: string) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected, cannot send message');
    return false;
  }

  const message = { type, payload, projectId };
  ws.send(JSON.stringify(message));
  return true;
}

// Join a project room
export function joinProject(projectId: string) {
  return sendMessage('join_project', { projectId }, projectId);
}

// Leave a project room
export function leaveProject(projectId: string) {
  return sendMessage('leave_project', { projectId }, projectId);
}

// Send a chat message
export function sendChatMessage(projectId: string, content: string, channelId?: string) {
  return sendMessage('chat_message', { content, channelId }, projectId);
}

// Update a document
export function updateDocument(projectId: string, documentId: string, content: any) {
  return sendMessage('document_update', { documentId, content }, projectId);
}

// Update a task
export function updateTask(projectId: string, taskId: string, updates: any) {
  return sendMessage('task_update', { taskId, updates }, projectId);
}

// Send cursor position (for collaborative editing)
export function sendCursorPosition(projectId: string, documentId: string, position: any) {
  return sendMessage('cursor_position', { documentId, position }, projectId);
}

// Send typing indicator
export function sendTypingIndicator(projectId: string, documentId: string, isTyping: boolean) {
  return sendMessage('typing_indicator', { documentId, isTyping }, projectId);
}

// Add event listener
export function addWebSocketListener(eventType: string, callback: (data: any) => void) {
  if (!listeners.has(eventType)) {
    listeners.set(eventType, new Set());
  }
  listeners.get(eventType)!.add(callback);
}

// Remove event listener
export function removeWebSocketListener(eventType: string, callback: (data: any) => void) {
  const eventListeners = listeners.get(eventType);
  if (eventListeners) {
    eventListeners.delete(callback);
    if (eventListeners.size === 0) {
      listeners.delete(eventType);
    }
  }
}

// Emit event to all listeners
function emitEvent(eventType: string, data: any) {
  const eventListeners = listeners.get(eventType);
  if (eventListeners) {
    eventListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket event listener:', error);
      }
    });
  }
}

// Hook for using WebSocket in React components
export function useWebSocket() {
  return {
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    sendMessage,
    joinProject,
    leaveProject,
    sendChatMessage,
    updateDocument,
    updateTask,
    sendCursorPosition,
    sendTypingIndicator,
    addListener: addWebSocketListener,
    removeListener: removeWebSocketListener
  };
}
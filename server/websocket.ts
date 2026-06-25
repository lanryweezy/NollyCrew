import { WebSocketServer, WebSocket } from 'ws';
import { storage } from './storage.js';
import { logger } from './utils/logger.js';

// Store active connections
interface UserConnection {
  userId: string;
  projectId?: string;
  ws: WebSocket;
}

const connections: Map<string, UserConnection> = new Map();
const projectRooms: Map<string, Set<string>> = new Map();

interface WebSocketMessage {
  type: string;
  payload: any;
  projectId?: string;
}

export function initializeWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws: WebSocket, req: any) => {
    logger.info('New WebSocket connection attempt');

    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId') || 'anonymous';

    const connectionId = `${userId}-${Date.now()}`;
    connections.set(connectionId, { userId, ws });

    logger.info(`WebSocket connection established for user ${userId}`);

    ws.send(JSON.stringify({
      type: 'connected',
      payload: { userId, connectionId }
    }));

    ws.on('message', async (data: string) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await handleMessage(connectionId, message);
      } catch (error) {
        logger.error('Error parsing WebSocket message', { error: (error as Error).message });
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message format' } }));
      }
    });

    ws.on('close', () => handleDisconnect(connectionId));
    ws.on('error', () => handleDisconnect(connectionId));
  });

  logger.info('WebSocket server initialized');
  return wss;
}

async function handleMessage(connectionId: string, message: WebSocketMessage) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  switch (message.type) {
    case 'join_project':
      await joinProject(connectionId, message.payload.projectId);
      break;
    case 'leave_project':
      await leaveProject(connectionId, message.payload.projectId);
      break;
    case 'chat_message':
      await broadcastToProject(message.projectId!, {
        type: 'chat_message',
        payload: { ...message.payload, userId: connection.userId, timestamp: new Date().toISOString() },
        projectId: message.projectId
      });
      break;
    case 'document_update':
      await broadcastToProject(message.projectId!, {
        type: 'document_update',
        payload: message.payload,
        projectId: message.projectId
      });
      break;
    case 'task_update':
      await broadcastToProject(message.projectId!, {
        type: 'task_update',
        payload: { ...message.payload, userId: connection.userId, timestamp: new Date().toISOString() },
        projectId: message.projectId
      });
      break;
    case 'cursor_position':
      await broadcastToProject(message.projectId!, {
        type: 'cursor_position',
        payload: { ...message.payload, userId: connection.userId }
      }, connection.userId);
      break;
    case 'typing_indicator':
      await broadcastToProject(message.projectId!, {
        type: 'typing_indicator',
        payload: { ...message.payload, userId: connection.userId }
      }, connection.userId);
      break;
    case 'webrtc_offer':
    case 'webrtc_answer':
    case 'webrtc_ice_candidate':
      if (message.payload.targetUserId) {
        sendToUser(message.payload.targetUserId, {
          type: message.type,
          payload: { ...message.payload, fromUserId: connection.userId }
        });
      }
      break;
    default:
      connection.ws.send(JSON.stringify({ type: 'error', payload: { message: `Unknown message type: ${message.type}` } }));
  }
}

async function joinProject(connectionId: string, projectId: string) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  connection.projectId = projectId;
  if (!projectRooms.has(projectId)) projectRooms.set(projectId, new Set());
  projectRooms.get(projectId)!.add(connection.userId);

  connection.ws.send(JSON.stringify({ type: 'project_joined', payload: { projectId } }));

  await broadcastToProject(projectId, {
    type: 'user_joined',
    payload: { userId: connection.userId, userName: (await storage.getUser(connection.userId))?.firstName || 'Unknown' },
    projectId
  }, connection.userId);
}

async function leaveProject(connectionId: string, projectId: string) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  if (projectRooms.has(projectId)) {
    projectRooms.get(projectId)!.delete(connection.userId);
    if (projectRooms.get(projectId)!.size === 0) projectRooms.delete(projectId);
  }

  await broadcastToProject(projectId, { type: 'user_left', payload: { userId: connection.userId }, projectId }, connection.userId);
}

async function broadcastToProject(projectId: string, message: WebSocketMessage, excludeUserId?: string) {
  const room = projectRooms.get(projectId);
  if (!room) return;

  const messageString = JSON.stringify(message);
  for (const userId of room) {
    if (excludeUserId && userId === excludeUserId) continue;
    for (const [, connection] of connections) {
      if (connection.userId === userId && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(messageString);
      }
    }
  }
}

function handleDisconnect(connectionId: string) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  if (connection.projectId) {
    const room = projectRooms.get(connection.projectId);
    if (room) {
      room.delete(connection.userId);
      if (room.size === 0) projectRooms.delete(connection.projectId);
    }
  }

  connections.delete(connectionId);
  logger.info(`WebSocket connection closed for user ${connection.userId}`);
}

export function sendToUser(userId: string, message: WebSocketMessage) {
  for (const [, connection] of connections) {
    if (connection.userId === userId && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
      return true;
    }
  }
  return false;
}

export function getUsersInProject(projectId: string): string[] {
  const room = projectRooms.get(projectId);
  return room ? Array.from(room) : [];
}

import { WebSocketServer, WebSocket } from 'ws';
import { verify as jwtVerify } from './utils/jwt.js';
import { storage } from './storage.js';
import { logger } from './utils/logger.js';

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// Store active connections
interface UserConnection {
  userId: string;
  projectId?: string;
  ws: WebSocket;
}

const connections: Map<string, UserConnection> = new Map();
const projectRooms: Map<string, Set<string>> = new Map(); // projectId -> Set of userIds

// Message types
interface WebSocketMessage {
  type: string;
  payload: any;
  projectId?: string;
}

// Initialize WebSocket server
export function initializeWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws: WebSocket, req: any) => {
    logger.info('New WebSocket connection attempt');

    // Extract token from query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      logger.warn('WebSocket connection rejected: No token provided');
      ws.close(4001, 'Authentication required');
      return;
    }

    try {
      // Verify JWT token
      const decoded: any = jwtVerify(token, JWT_SECRET as string);
      const user = await storage.getUser(decoded.userId);
      
      if (!user) {
        logger.warn('WebSocket connection rejected: Invalid user');
        ws.close(4002, 'Invalid user');
        return;
      }

      // Store connection
      const connectionId = `${user.id}-${Date.now()}`;
      connections.set(connectionId, { userId: user.id, ws });

      logger.info(`WebSocket connection established for user ${user.id}`);

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connected',
        payload: { userId: user.id, connectionId }
      }));

      // Handle incoming messages
      ws.on('message', async (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          await handleMessage(connectionId, message);
        } catch (error) {
          logger.error('Error parsing WebSocket message', { error: (error as Error).message });
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Invalid message format' }
          }));
        }
      });

      // Handle connection close
      ws.on('close', () => {
        handleDisconnect(connectionId);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket error', { error: (error as Error).message });
        handleDisconnect(connectionId);
      });

    } catch (error) {
      logger.error('WebSocket authentication error', { error: (error as Error).message });
      ws.close(4003, 'Authentication failed');
    }
  });

  logger.info('WebSocket server initialized');
  return wss;
}

// Handle incoming messages
async function handleMessage(connectionId: string, message: WebSocketMessage) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  logger.info(`Received message type: ${message.type}`, { userId: connection.userId });

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
        payload: {
          ...message.payload,
          userId: connection.userId,
          timestamp: new Date().toISOString()
        },
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
        payload: {
          ...message.payload,
          userId: connection.userId,
          timestamp: new Date().toISOString()
        },
        projectId: message.projectId
      });
      break;
      
    case 'cursor_position':
      await broadcastToProject(message.projectId!, {
        type: 'cursor_position',
        payload: {
          ...message.payload,
          userId: connection.userId
        },
        projectId: message.projectId
      }, connection.userId); // Exclude sender
      break;
      
    case 'typing_indicator':
      await broadcastToProject(message.projectId!, {
        type: 'typing_indicator',
        payload: {
          ...message.payload,
          userId: connection.userId
        },
        projectId: message.projectId
      }, connection.userId); // Exclude sender
      break;
      
    default:
      logger.warn(`Unknown message type: ${message.type}`);
      connection.ws.send(JSON.stringify({
        type: 'error',
        payload: { message: `Unknown message type: ${message.type}` }
      }));
  }
}

// Join a project room
async function joinProject(connectionId: string, projectId: string) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  // Update connection with project ID
  connection.projectId = projectId;
  
  // Add user to project room
  if (!projectRooms.has(projectId)) {
    projectRooms.set(projectId, new Set());
  }
  projectRooms.get(projectId)!.add(connection.userId);
  
  // Notify user they've joined
  connection.ws.send(JSON.stringify({
    type: 'project_joined',
    payload: { projectId }
  }));
  
  // Notify others in the project room
  await broadcastToProject(projectId, {
    type: 'user_joined',
    payload: { 
      userId: connection.userId,
      userName: (await storage.getUser(connection.userId))?.firstName || 'Unknown User'
    },
    projectId
  }, connection.userId); // Exclude sender
  
  logger.info(`User ${connection.userId} joined project ${projectId}`);
}

// Leave a project room
async function leaveProject(connectionId: string, projectId: string) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  // Remove user from project room
  if (projectRooms.has(projectId)) {
    projectRooms.get(projectId)!.delete(connection.userId);
    
    // Clean up empty rooms
    if (projectRooms.get(projectId)!.size === 0) {
      projectRooms.delete(projectId);
    }
  }
  
  // Notify others in the project room
  await broadcastToProject(projectId, {
    type: 'user_left',
    payload: { userId: connection.userId },
    projectId
  }, connection.userId); // Exclude sender
  
  logger.info(`User ${connection.userId} left project ${projectId}`);
}

// Broadcast message to all users in a project
async function broadcastToProject(
  projectId: string, 
  message: WebSocketMessage, 
  excludeUserId?: string
) {
  const room = projectRooms.get(projectId);
  if (!room) return;

  const messageString = JSON.stringify(message);
  
  // Send to all users in the project room
  for (const userId of room) {
    if (excludeUserId && userId === excludeUserId) continue;
    
    // Find all connections for this user
    for (const [connectionId, connection] of connections) {
      if (connection.userId === userId && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(messageString);
      }
    }
  }
}

// Handle disconnection
function handleDisconnect(connectionId: string) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  // Remove from project room if in one
  if (connection.projectId) {
    const room = projectRooms.get(connection.projectId);
    if (room) {
      room.delete(connection.userId);
      
      // Clean up empty rooms
      if (room.size === 0) {
        projectRooms.delete(connection.projectId);
      }
    }
  }

  // Remove connection
  connections.delete(connectionId);
  
  logger.info(`WebSocket connection closed for user ${connection.userId}`);
}

// Utility function to send a message to a specific user
export function sendToUser(userId: string, message: WebSocketMessage) {
  for (const [connectionId, connection] of connections) {
    if (connection.userId === userId && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
      return true;
    }
  }
  return false;
}

// Utility function to get users in a project room
export function getUsersInProject(projectId: string): string[] {
  const room = projectRooms.get(projectId);
  return room ? Array.from(room) : [];
}
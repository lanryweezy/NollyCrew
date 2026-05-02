import Pusher from 'pusher-js';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || '';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1';

let pusher: Pusher | null = null;

if (PUSHER_KEY) {
  pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    forceTLS: true
  });
}

export const subscribeToProject = (projectId: string, callback: (event: string, data: any) => void) => {
  if (!pusher) return null;
  
  const channel = pusher.subscribe(`project-${projectId}`);
  
  // Bind to common events
  const events = [
    'chat_message', 
    'document_update', 
    'task_update', 
    'cursor_position', 
    'typing_indicator',
    'user_joined',
    'user_left'
  ];
  
  events.forEach(event => {
    channel.bind(event, (data: any) => callback(event, data));
  });
  
  return channel;
};

export const unsubscribeFromProject = (projectId: string) => {
  if (!pusher) return;
  pusher.unsubscribe(`project-${projectId}`);
};

export default pusher;

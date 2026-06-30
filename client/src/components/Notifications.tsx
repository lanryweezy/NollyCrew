import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useWebSocket } from "@/lib/websocket";
import { useAuth } from "@/lib/auth-context";
import { 
  Bell, 
  MessageCircle,
  UserPlus,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function Notifications() {
  const { profile } = useAuth();
  const { connect, addListener, removeListener } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    connect();

    const handleNewMessage = (data: any) => {
      if (data.recipientId === profile?.id) {
        setNotifications(prev => [{
          id: `msg-${Date.now()}`,
          type: 'message',
          title: 'New Message',
          message: `From ${data.senderName || 'someone'}`,
          timestamp: new Date().toISOString(),
          read: false,
        }, ...prev]);
      }
    };

    const handleApplicationUpdate = (data: any) => {
      setNotifications(prev => [{
        id: `app-${Date.now()}`,
        type: 'job',
        title: 'Application Update',
        message: data.message || 'Your application status has been updated',
        timestamp: new Date().toISOString(),
        read: false,
      }, ...prev]);
    };

    addListener('new_message', handleNewMessage);
    addListener('application_update', handleApplicationUpdate);

    return () => {
      removeListener('new_message', handleNewMessage);
      removeListener('application_update', handleApplicationUpdate);
    };
  }, [profile?.id]);

  async function loadNotifications() {
    try {
      const data = await apiFetch('/notifications');
      if (Array.isArray(data)) {
        setNotifications(data.map(n => ({ ...n, timestamp: n.timestamp || n.createdAt || new Date().toISOString() })));
      }
    } catch {}
    setLoading(false);
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageCircle className="w-4 h-4" />;
      case "job": return <Briefcase className="w-4 h-4" />;
      case "connection": return <UserPlus className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "message": return "bg-blue-100 dark:bg-blue-900/50";
      case "job": return "bg-purple-100 dark:bg-purple-900/50";
      default: return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-80">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>Mark all read</Button>
        </div>
        {unreadCount > 0 && <Badge variant="secondary" className="mt-2">{unreadCount} unread</Badge>}
      </div>
      <ScrollArea className="h-96">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-muted/30' : ""}`}
                onClick={() => setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n))}>
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getBackgroundColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                      {!notification.read && <div className="w-2 h-2 rounded-full bg-primary ml-2 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                    <span className="text-xs text-muted-foreground mt-1 block">{formatTime(notification.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

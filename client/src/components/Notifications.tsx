import { useState } from "react";
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  MessageCircle,
  UserPlus,
  Briefcase,
  Calendar,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "message" | "job" | "connection";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "message",
      title: "New Message",
      message: "John Doe sent you a message about your project",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "2",
      type: "job",
      title: "Job Application",
      message: "Your application for Lead Actor position has been reviewed",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false
    },
    {
      id: "3",
      type: "connection",
      title: "New Connection",
      message: "Sarah Johnson accepted your connection request",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "4",
      type: "success",
      title: "Project Update",
      message: "Your script has been successfully analyzed by AI",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true
    },
    {
      id: "5",
      type: "info",
      title: "Upcoming Deadline",
      message: "Project 'Love in Lagos' script submission due in 3 days",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageCircle className="w-4 h-4" />;
      case "job": return <Briefcase className="w-4 h-4" />;
      case "connection": return <UserPlus className="w-4 h-4" />;
      case "success": return <CheckCircle className="w-4 h-4" />;
      case "warning": return <AlertCircle className="w-4 h-4" />;
      case "info": return <Info className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "message": return "bg-blue-100 dark:bg-blue-900/50";
      case "job": return "bg-purple-100 dark:bg-purple-900/50";
      case "connection": return "bg-green-100 dark:bg-green-900/50";
      case "success": return "bg-green-100 dark:bg-green-900/50";
      case "warning": return "bg-yellow-100 dark:bg-yellow-900/50";
      case "info": return "bg-blue-100 dark:bg-blue-900/50";
      default: return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-80">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
        {unreadCount > 0 && (
          <Badge variant="secondary" className="mt-2">
            {unreadCount} unread
          </Badge>
        )}
      </div>
      
      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getBackgroundColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 ml-2"
                        onClick={() => clearNotification(notification.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full">
          View all notifications
        </Button>
      </div>
    </div>
  );
}
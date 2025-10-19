import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWebSocket } from "@/lib/websocket";
import { Send, Users } from "lucide-react";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  channelId?: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

interface RealTimeChatProps {
  projectId: string;
  channelId?: string;
  users: User[];
}

export default function RealTimeChat({ projectId, channelId, users }: RealTimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, addListener, removeListener, joinProject, leaveProject } = useWebSocket();

  // Join project on mount
  useEffect(() => {
    joinProject(projectId);
    
    // Listen for chat messages
    const handleChatMessage = (data: any) => {
      const message: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        userId: data.userId,
        userName: data.userName || "Unknown User",
        userAvatar: data.userAvatar,
        content: data.content,
        timestamp: data.timestamp || new Date().toISOString(),
        channelId: data.channelId
      };
      
      setMessages(prev => [...prev, message]);
    };
    
    // Listen for user join/leave events
    const handleUserJoined = (data: any) => {
      setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
    };
    
    const handleUserLeft = (data: any) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    };
    
    addListener('chat_message', handleChatMessage);
    addListener('user_joined', handleUserJoined);
    addListener('user_left', handleUserLeft);
    
    // Cleanup
    return () => {
      leaveProject(projectId);
      removeListener('chat_message', handleChatMessage);
      removeListener('user_joined', handleUserJoined);
      removeListener('user_left', handleUserLeft);
    };
  }, [projectId, channelId, addListener, removeListener, joinProject, leaveProject]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && sendMessage) {
      sendChatMessage(projectId, newMessage.trim(), channelId);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Team Chat</CardTitle>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">
            {onlineUsers.length} online
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.userAvatar} />
                  <AvatarFallback>
                    {message.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{message.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
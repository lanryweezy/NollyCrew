import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWebSocket } from "@/lib/websocket";
import { Save, Users, Eye } from "lucide-react";

interface CollaborativeEditorProps {
  projectId: string;
  documentId: string;
  documentName: string;
  initialContent: string;
  onSave?: (content: string) => void;
}

interface CursorPosition {
  userId: string;
  userName: string;
  userAvatar?: string;
  position: number;
}

export default function CollaborativeEditor({ 
  projectId, 
  documentId, 
  documentName, 
  initialContent,
  onSave
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { 
    sendMessage, 
    addListener, 
    removeListener, 
    joinProject, 
    leaveProject,
    sendCursorPosition,
    sendTypingIndicator
  } = useWebSocket();

  // Join project on mount
  useEffect(() => {
    joinProject(projectId);
    
    // Listen for document updates
    const handleDocumentUpdate = (data: any) => {
      if (data.documentId === documentId) {
        setContent(data.content);
      }
    };
    
    // Listen for cursor positions
    const handleCursorPosition = (data: any) => {
      if (data.documentId === documentId) {
        setCursors(prev => {
          // Remove existing cursor for this user
          const filtered = prev.filter(cursor => cursor.userId !== data.userId);
          // Add new cursor position
          return [...filtered, {
            userId: data.userId,
            userName: data.userName || "Unknown User",
            userAvatar: data.userAvatar,
            position: data.position
          }];
        });
      }
    };
    
    // Listen for typing indicators
    const handleTypingIndicator = (data: any) => {
      if (data.documentId === documentId) {
        // Handle typing indicator logic here if needed
      }
    };
    
    addListener('document_update', handleDocumentUpdate);
    addListener('cursor_position', handleCursorPosition);
    addListener('typing_indicator', handleTypingIndicator);
    
    // Cleanup
    return () => {
      leaveProject(projectId);
      removeListener('document_update', handleDocumentUpdate);
      removeListener('cursor_position', handleCursorPosition);
      removeListener('typing_indicator', handleTypingIndicator);
    };
  }, [projectId, documentId, addListener, removeListener, joinProject, leaveProject]);

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Send document update
    updateDocument(projectId, documentId, newContent);
    
    // Send cursor position
    const cursorPosition = e.target.selectionStart;
    sendCursorPosition(projectId, documentId, cursorPosition);
    
    // Handle typing indicator
    const now = Date.now();
    setLastTypingTime(now);
    
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(projectId, documentId, true);
    }
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(content);
    }
  };

  // Periodically send typing indicator
  useEffect(() => {
    const typingInterval = setInterval(() => {
      const now = Date.now();
      if (isTyping && now - lastTypingTime > 1000) {
        setIsTyping(false);
        sendTypingIndicator(projectId, documentId, false);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [isTyping, lastTypingTime, projectId, documentId, sendTypingIndicator]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{documentName}</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSave}
            variant="outline"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">
              {cursors.length} collaborating
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            className="h-full min-h-[400px] resize-none border-0 rounded-none focus-visible:ring-0"
            placeholder="Start writing your document..."
          />
          {/* Cursor indicators */}
          <div className="absolute top-2 right-2 flex gap-1">
            {cursors.map((cursor) => (
              <div 
                key={cursor.userId}
                className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs"
              >
                <Avatar className="w-4 h-4">
                  <AvatarImage src={cursor.userAvatar} />
                  <AvatarFallback>
                    {cursor.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{cursor.userName}</span>
                <Eye className="w-3 h-3" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
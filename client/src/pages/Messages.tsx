import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  MessageSquare,
  CheckCheck,
  Clock,
  UserPlus
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import PageHeader from '@/components/PageHeader';
import ResponsiveSection from '@/components/ResponsiveSection';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chats: Chat[] = [
    { id: '1', name: 'Kemi Adetiba', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kemi', lastMessage: "Let's discuss the script next week.", time: '10:30 AM', unread: 2, online: true },
    { id: '2', name: 'Kunle Afolayan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kunle', lastMessage: 'The location is confirmed.', time: 'Yesterday', unread: 0, online: false },
    { id: '3', name: 'Funke Akindele', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=funke', lastMessage: 'I loved the character breakdown!', time: 'Tue', unread: 0, online: true },
    { id: '4', name: 'Richard Mofe-Damijo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rmd', lastMessage: 'Sent the self-tape.', time: 'Mon', unread: 0, online: false },
  ];

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!selectedChat) return;
    setLoading(true);
    try {
      const { messages } = await api.listMessages(selectedChat.id);
      setMessages(messages.length > 0 ? messages : [
        { id: 'm1', senderId: selectedChat.id, content: selectedChat.lastMessage, timestamp: new Date() }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!selectedChat || !content) return;
    const newMessage = {
      id: `temp-${Date.now()}`,
      senderId: 'me',
      recipientId: selectedChat.id,
      content,
      timestamp: new Date(),
      status: 'sent'
    };
    setMessages(prev => [...prev, newMessage]);
    setContent('');
    try {
      await api.sendMessage({ recipientId: selectedChat.id, content });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <ResponsiveSection padding="none" className="flex-1 overflow-hidden">
        <div className="container mx-auto h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          <div className="bg-card border rounded-2xl shadow-xl h-full flex overflow-hidden">
            
            {/* Sidebar */}
            <div className="w-full sm:w-80 border-r flex flex-col bg-muted/10">
              <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Messages</h2>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="New chat">
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search chats..." className="pl-9 bg-background/50 border-none ring-1 ring-muted" />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {chats.map((chat) => (
                    <div 
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedChat?.id === chat.id 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={chat.avatar} />
                          <AvatarFallback>{chat.name[0]}</AvatarFallback>
                        </Avatar>
                        {chat.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline">
                          <p className={`font-semibold text-sm truncate ${selectedChat?.id === chat.id ? 'text-white' : ''}`}>
                            {chat.name}
                          </p>
                          <span className={`text-[10px] ${selectedChat?.id === chat.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {chat.time}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${selectedChat?.id === chat.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {chat.lastMessage}
                        </p>
                      </div>
                      {chat.unread > 0 && selectedChat?.id !== chat.id && (
                        <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center p-0 rounded-full text-[10px]">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            {selectedChat ? (
              <div className="flex-1 flex flex-col bg-background">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedChat.avatar} />
                      <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm leading-none">{selectedChat.name}</p>
                      <p className="text-[10px] text-green-500 font-medium mt-1">
                        {selectedChat.online ? 'Online' : 'Active 2h ago'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Start voice call"><Phone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Start video call"><Video className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Chat info"><Info className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="More options"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4 bg-muted/5" ref={scrollRef}>
                  <div className="space-y-6">
                    {messages.map((m, i) => (
                      <div key={m.id} className={`flex ${m.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] space-y-1 ${m.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                            m.senderId === 'me' 
                              ? 'bg-primary text-primary-foreground rounded-tr-none' 
                              : 'bg-card border rounded-tl-none'
                          }`}>
                            {m.content}
                          </div>
                          <div className="flex items-center gap-1 px-1">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {m.senderId === 'me' && (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-background border-t">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type a message..." 
                      value={content} 
                      onChange={e => setContent(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && send()}
                      className="flex-1 h-11 border-none bg-muted/30 focus-visible:ring-primary/20"
                    />
                    <Button 
                      onClick={send} 
                      disabled={!content || loading}
                      className="h-11 w-11 rounded-full shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-10 w-10 text-primary opacity-50" />
                </div>
                <h3 className="text-xl font-bold">Your Conversations</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                  Select a professional from your network to start discussing your next blockbuster project.
                </p>
                <Button className="mt-6" variant="outline">
                  Browse Professionals
                </Button>
              </div>
            )}
          </div>
        </div>
      </ResponsiveSection>
    </div>
  );
}

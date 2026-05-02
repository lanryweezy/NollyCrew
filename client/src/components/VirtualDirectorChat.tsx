import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Film, 
  Mic, 
  Video,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function VirtualDirectorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Nollywood Virtual Director. I've analyzed your project profile and I'm ready to help. You can ask me about script improvements, casting choices, location ideas, or production logistics. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsAnalyzing(true);

    try {
      // API call to AI endpoint (to be implemented/updated in routes)
      const response = await fetch('/api/ai/director-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages.slice(-5) })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || "I'm having a little trouble connecting to my creative circuits, but let's keep working on your vision!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Director chat error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const suggestions = [
    "How can I make the opening scene more dramatic?",
    "What kind of lighting should we use for the Lagos market scene?",
    "Suggest some casting archetypes for the antagonist.",
    "Help me optimize the shooting schedule for 5 days."
  ];

  return (
    <Card className="flex flex-col h-[600px] border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="bg-primary/5 border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=director" />
                <AvatarFallback>VD</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background shadow-sm" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Virtual Director <Sparkles className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </CardTitle>
              <CardDescription className="text-xs">Pro AI Production Consultant</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">Nollywood Expert</Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col relative bg-muted/5">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className={`h-8 w-8 mt-1 shrink-0 ${m.role === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                      {m.role === 'assistant' ? <Bot className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary-foreground" />}
                    </Avatar>
                    <div className={`space-y-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-card border rounded-tl-none leading-relaxed'
                      }`}>
                        {m.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 max-w-[85%]">
                  <Avatar className="h-8 w-8 bg-secondary animate-pulse">
                    <Bot className="h-4 w-4 text-primary" />
                  </Avatar>
                  <div className="bg-card border rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {messages.length < 3 && (
          <div className="px-4 py-3 border-t bg-background/50 backdrop-blur-sm">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 px-1 tracking-wider">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm" 
                  className="text-[11px] h-7 bg-background hover:bg-primary/5 hover:text-primary transition-all rounded-full"
                  onClick={() => {
                    setInput(s);
                  }}
                >
                  {s} <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-background border-t">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Ask your Virtual Director..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="pr-10 h-11 rounded-xl focus-visible:ring-primary/20 transition-all border-primary/10 shadow-inner"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              className="h-11 w-11 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" /> Powered by Nollywood AI Engine v2.4
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

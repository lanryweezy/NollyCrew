import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';

export default function Messages() {
  const [otherUserId, setOtherUserId] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { messages } = await api.listMessages(otherUserId || undefined);
      setMessages(messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!otherUserId || !content) return;
    try {
      // optimistic append
      const tempId = `temp-${Date.now()}`;
      const optimistic = { id: tempId, senderId: 'me', recipientId: otherUserId, content };
      setMessages(prev => [...prev, optimistic]);
      setContent('');
      try {
        const { message } = await api.sendMessage({ recipientId: otherUserId, content });
        setMessages(prev => prev.map(m => m.id === tempId ? message : m));
      } catch (e) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        throw e;
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader 
        title="Messages"
        subtitle="Connect and communicate with other professionals"
      />
      <Card>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Other User ID" value={otherUserId} onChange={e => setOtherUserId(e.target.value)} />
            <Button onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Load'}</Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-auto border rounded p-3 bg-muted/30">
            {messages.map(m => (
              <div key={m.id} className="text-sm">
                <span className="font-semibold">{m.senderId === otherUserId ? 'Them' : 'You'}:</span> {m.content}
              </div>
            ))}
            {!messages.length && <div className="text-sm text-muted-foreground">No messages yet</div>}
          </div>

          <div className="flex gap-2 mt-4">
            <Input placeholder="Type a message..." value={content} onChange={e => setContent(e.target.value)} />
            <Button onClick={send} disabled={!content || !otherUserId}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



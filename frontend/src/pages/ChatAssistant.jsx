import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Send, Bot, User, Loader2, Info } from 'lucide-react';

export default function ChatAssistant() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSession();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSession = async () => {
    try {
      // Find session for this project
      const { data: sessionData } = await api.get('/chat/sessions');
      const projSession = sessionData.data.sessions.find(s => s.projectId._id === id);
      
      if (projSession) {
        const { data } = await api.get(`/chat/sessions/${projSession._id}`);
        setSession(data.data.session);
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch chat session', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending || !session) return;

    const userMsg = input.trim();
    setInput('');
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { _id: tempId, role: 'user', content: userMsg }]);
    setIsSending(true);

    try {
      const { data } = await api.post(`/chat/sessions/${session._id}/messages`, {
        content: userMsg
      });
      
      // Append the assistant's response. The user message is already in state from the optimistic update.
      setMessages(prev => [...prev, data.data.message]);
    } catch (error) {
      console.error('Failed to send message', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-bold mb-2">No Chat Session Found</h2>
        <p className="text-muted-foreground mb-6">The architecture review must complete before chatting is available.</p>
        <Button asChild>
          <Link to={`/projects/${id}`}>Return to Project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] border rounded-xl overflow-hidden bg-background shadow-sm">
      {/* Chat Header */}
      <div className="bg-muted/30 border-b p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
            <Link to={`/projects/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" /> Architecture Assistant
            </h2>
            <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-md">
              {session.projectId?.name || 'Project Analysis'}
            </p>
          </div>
        </div>
        <div className="flex items-center text-xs text-muted-foreground bg-background px-2 py-1 rounded-md border shadow-sm">
          <Info className="h-3 w-3 mr-1" /> Context-Aware RAG Enabled
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-background/95">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          // Only show specific message types, skip system messages
          if (message.role === 'system') return null;

          return (
            <div key={message._id} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[85%] sm:max-w-[75%] overflow-hidden break-words rounded-2xl px-5 py-4 shadow-sm ${
                isUser 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'bg-card border text-card-foreground rounded-tl-sm'
              }`}>
                {message.messageType === 'review' && !isUser && (
                  <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70 border-b border-border/50 pb-2">
                    Initial Architecture Review
                  </div>
                )}
                <div className={`prose prose-sm dark:prose-invert max-w-none overflow-x-auto ${isUser ? 'text-primary-foreground prose-p:text-primary-foreground/90' : ''}`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                
                {/* Sources / Metadata (only for AI) */}
                {!isUser && message.metadata?.sources && message.metadata.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground">Referenced Documents:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.metadata.sources.map((source, idx) => (
                        <span key={idx} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground border">
                          {source.documentName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border">
                  <User className="h-5 w-5 text-secondary-foreground" />
                </div>
              )}
            </div>
          );
        })}
        {isSending && (
          <div className="flex gap-4 justify-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="bg-card border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-background border-t">
        <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto flex items-center">
          <Input
            className="pr-12 py-6 rounded-full bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
            placeholder="Ask about security, scaling, or cost optimization..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 rounded-full h-10 w-10 shadow-sm"
            disabled={!input.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          AI Architecture Review Assistant uses configured AI models. Information may be inaccurate.
        </p>
      </div>
    </div>
  );
}

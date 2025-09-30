import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, Image, Mic, Bot, User, Loader2, Trash2 } from 'lucide-react';
import type { ChatMessage } from './ApiTester';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, attachments?: ChatMessage['attachments']) => void;
  onClearMessages: () => void;
  isLoading: boolean;
}

export const ChatInterface = ({ messages, onSendMessage, onClearMessages, isLoading }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<ChatMessage['attachments']>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() || attachments?.length) {
      onSendMessage(inputValue.trim(), attachments);
      setInputValue('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const attachment = {
        type: file.type.startsWith('image/') ? 'image' as const : 'audio' as const,
        url,
        name: file.name,
      };

      setAttachments(prev => [...(prev || []), attachment]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev?.filter((_, i) => i !== index));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-chat-bg">
      {/* Header */}
      <div className="border-b border-border bg-chat-header px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">AI Agent Tester</h2>
              <p className="text-sm text-muted-foreground">
                {messages.length} mensajes
              </p>
            </div>
          </div>
          
          <Button
            onClick={onClearMessages}
            variant="ghost"
            size="icon"
            disabled={messages.length === 0}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
            title="Limpiar conversación"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`group hover:bg-chat-message-hover rounded-lg p-2 transition-colors ${
            message.type === 'user' ? 'ml-12' : 'mr-12'
          }`}>
            <div className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className={`${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>

              <div className={`flex flex-col gap-2 flex-1 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-4 py-3 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-chat-bubble-user text-primary-foreground' 
                      : 'bg-chat-bubble-assistant text-foreground border border-border'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index}>
                            {attachment.type === 'image' ? (
                              <div className="relative max-w-xs">
                                <img 
                                  src={attachment.url} 
                                  alt={attachment.name}
                                  className="w-full rounded-lg"
                                />
                                <Badge variant="secondary" className="absolute top-2 left-2 text-xs bg-black/50 text-white">
                                  <Image className="w-3 h-3 mr-1" />
                                  Imagen
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                <Mic className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{attachment.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="group hover:bg-chat-message-hover rounded-lg p-2 mr-12">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="inline-block px-4 py-3 rounded-2xl bg-chat-bubble-assistant border border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Procesando...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-chat-header p-4">
        {/* Attachments Preview */}
        {attachments && attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 p-2 bg-chat-bubble-assistant border border-border rounded-lg cursor-pointer hover:bg-members-hover"
                onClick={() => removeAttachment(index)}
              >
                {attachment.type === 'image' ? (
                  <Image className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Mic className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm text-foreground">{attachment.name}</span>
                <button className="text-destructive hover:text-destructive/80 text-lg leading-none">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <div className="relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="bg-chat-input border-border focus:border-primary focus:ring-1 focus:ring-primary pr-12 min-h-[48px] rounded-xl"
                disabled={isLoading}
              />
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,audio/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-muted"
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !attachments?.length) || isLoading}
            className="bg-primary hover:bg-primary/90 shadow-glow h-12 w-12 rounded-xl p-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
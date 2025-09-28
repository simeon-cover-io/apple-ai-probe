import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, Image, Mic, Bot, User, Loader2 } from 'lucide-react';
import type { ChatMessage } from './ApiTester';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, attachments?: ChatMessage['attachments']) => void;
  isLoading: boolean;
}

export const ChatInterface = ({ messages, onSendMessage, isLoading }: ChatInterfaceProps) => {
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
    <div className="flex flex-col h-full bg-gradient-subtle">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-apple-gray-5">AI Agent Tester</h2>
            <p className="text-sm text-apple-gray-4">
              {messages.length} mensajes
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className={message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>

            <div className={`flex flex-col gap-1 max-w-[80%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
              <Card className={`p-4 shadow-card transition-smooth ${
                message.type === 'user' 
                  ? 'bg-chat-bubble-user text-primary-foreground' 
                  : 'bg-chat-bubble-assistant border-apple-gray-3'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {attachment.type === 'image' ? (
                          <div className="relative">
                            <img 
                              src={attachment.url} 
                              alt={attachment.name}
                              className="max-w-xs rounded-lg shadow-sm"
                            />
                            <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                              <Image className="w-3 h-3 mr-1" />
                              Imagen
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Mic className="w-3 h-3 mr-1" />
                            {attachment.name}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <span className="text-xs text-apple-gray-4 px-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-muted">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <Card className="p-4 bg-chat-bubble-assistant border-apple-gray-3 shadow-card">
              <div className="flex items-center gap-2 text-apple-gray-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Procesando...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-6">
        {/* Attachments Preview */}
        {attachments && attachments.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="gap-2 p-2 bg-apple-gray-2 hover:bg-apple-gray-3 cursor-pointer"
                onClick={() => removeAttachment(index)}
              >
                {attachment.type === 'image' ? (
                  <Image className="w-3 h-3" />
                ) : (
                  <Mic className="w-3 h-3" />
                )}
                <span className="text-xs">{attachment.name}</span>
                <button className="text-destructive hover:text-destructive/80">
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="bg-chat-input border-apple-gray-3 focus:border-primary focus:ring-1 focus:ring-primary resize-none min-h-[44px]"
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
                variant="outline"
                size="sm"
                className="border-apple-gray-3 hover:bg-apple-gray-2"
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !attachments?.length) || isLoading}
            className="bg-primary hover:bg-primary/90 shadow-apple px-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};